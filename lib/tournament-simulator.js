import {Fighter} from "./fighter.js";
import {QueueManager} from "./queue-manager.js";
import {BearPit} from "./bear-pit.js";

class TournamentSimulator {
  constructor(config) {
    // Calculate retirement streak length if set to "auto" or if it's a string
    let retirementStreakLength = config.retirementStreakLength;
    if (typeof retirementStreakLength === 'string' && retirementStreakLength.toLowerCase() === 'auto') {
      const avgLevel = config.fighters.reduce((sum, f) => sum + f.level, 0) / config.fighters.length;
      retirementStreakLength = Math.round(avgLevel * 2) + 1;
    }

    this.config = {
      ...config,
      fighters: config.fighters || [],
      numberOfPits: config.numberOfPits || 1,
      roundDurationMinutes: config.roundDurationMinutes || 15,
      skillMultiplier: config.skillMultiplier || 2.0,
      fatigueMultiplier: config.fatigueMultiplier || 0.05,
      useShortestQueue: config.useShortestQueue || false,
      baseSimulChance: config.baseSimulChance || 0.1,
      simulReductionPerLevel: config.simulReductionPerLevel || 0.02,
      averageFightDurationSeconds: config.averageFightDurationSeconds || 30,
      fightDurationVariance: config.fightDurationVariance || 10,
      fightDurationVariancePerLevel: config.fightDurationVariancePerLevel || 0,
      restPeriodSeconds: config.restPeriodSeconds || 30, // 30 second minimum rest period
      retirementStreakLength: retirementStreakLength, // Can be int, null, or calculated from average level
      maxRetirements: config.maxRetirements || 3, // Maximum number of fighters that can retire
    };

    this.fighters = this.config.fighters.map(f => new Fighter(f.name, f.level));
    this.retiredCount = 0; // Track how many have retired
  }

  // Check if retirements are still allowed
  canRetire() {
    return this.retiredCount < this.config.maxRetirements;
  }

  // Handle retirement and update count
  retireFighter(fighter, currentTime) {
    if (this.canRetire()) {
      fighter.retire(currentTime);
      this.retiredCount++;
      return true;
    }
    return false;
  }

  // NEW: Analyze award eligibility and eliminations
  analyzeAwardEliminations() {
    const fighterStats = this.fighters;

    const analysis = {
      totalEliminations: fighterStats.reduce((sum, f) => sum + f.totalLosses + f.totalSimuls, 0),
      eliminationsByAwardWinners: fighterStats.reduce((sum, f) => sum + f.eliminatedByAwardWinner, 0),
      eliminationsWhileAwardWinner: fighterStats.reduce((sum, f) => sum + f.eliminationsWhileAwardWinner, 0),

      // Award eligibility analysis
      totalFighters: fighterStats.length,
      eligibleFighters: 0,
      ineligibleFighters: 0,
      awardWinners: 0,
      eligibleButDidntWin: 0,

      // Breakdown by fighter level
      eliminationsByLevel: {},

      // Fighters most affected
      mostAffectedFighters: fighterStats
        .filter(f => f.eliminatedByAwardWinner > 0)
        .sort((a, b) => b.eliminatedByAwardWinner - a.eliminatedByAwardWinner)
        .slice(0, 5)
        .map(f => ({
          name: f.name,
          level: f.level,
          eliminatedByAwardWinner: f.eliminatedByAwardWinner,
          totalEliminations: f.totalLosses + f.totalSimuls,
          eliminationRate: f.getEliminationByAwardWinnerRate()
        }))
    };

    // Analyze award eligibility
    fighterStats.forEach(fighter => {
      const status = fighter.getAwardEligibilityStatus(this.config.retirementStreakLength);

      if (status.canEarnAward) {
        analysis.eligibleFighters++;
        if (status.earnedAward) {
          analysis.awardWinners++;
        } else {
          analysis.eligibleButDidntWin++;
        }
      } else {
        analysis.ineligibleFighters++;
      }
    });

    // Calculate rates
    analysis.awardWinnerEliminationRate = analysis.totalEliminations > 0 ?
      (analysis.eliminationsByAwardWinners / analysis.totalEliminations) * 100 : 0;

    analysis.eligibilityRate = (analysis.eligibleFighters / analysis.totalFighters) * 100;
    analysis.awardSuccessRate = analysis.eligibleFighters > 0 ?
      (analysis.awardWinners / analysis.eligibleFighters) * 100 : 0;

    // Breakdown by level
    for (let level = 1; level <= 10; level++) {
      const fightersAtLevel = fighterStats.filter(f => f.level === level);
      if (fightersAtLevel.length > 0) {
        const levelEliminations = fightersAtLevel.reduce((sum, f) => sum + f.totalLosses + f.totalSimuls, 0);
        const levelEliminationsByAwardWinners = fightersAtLevel.reduce((sum, f) => sum + f.eliminatedByAwardWinner, 0);

        analysis.eliminationsByLevel[level] = {
          totalFighters: fightersAtLevel.length,
          totalEliminations: levelEliminations,
          eliminationsByAwardWinners: levelEliminationsByAwardWinners,
          eliminationRate: levelEliminations > 0 ? (levelEliminationsByAwardWinners / levelEliminations) * 100 : 0
        };
      }
    }

    return analysis;
  }

  // Centralized sorting logic for tournament placements
  getSortedFighters() {
    if (this.config.retirementStreakLength) {
      // Retirement mode: Sort by retirement order first, then by performance
      return [...this.fighters].sort((a, b) => {
        // Retired fighters come first, sorted by retirement time
        if (a.isRetired && !b.isRetired) return -1;
        if (!a.isRetired && b.isRetired) return 1;

        if (a.isRetired && b.isRetired) {
          // Both retired: earlier retirement time wins
          if (a.retiredAt !== b.retiredAt) {
            return a.retiredAt - b.retiredAt;
          }
          // Tie-break by fewer fights (more efficient)
          return a.retiredAfterFights - b.retiredAfterFights;
        }

        // Both not retired: sort by traditional metrics
        if (a.longestStreak !== b.longestStreak) {
          return b.longestStreak - a.longestStreak;
        }
        if (a.totalWins !== b.totalWins) {
          return b.totalWins - a.totalWins;
        }
        if (a.totalFights !== b.totalFights) {
          return a.totalFights - b.totalFights; // Fewer fights is better (more efficient)
        }
        return a.totalLosses - b.totalLosses; // Fewer losses is better
      });
    } else {
      // Traditional mode: Sort by longest streak, then total wins, then efficiency
      return [...this.fighters].sort((a, b) => {
        if (a.longestStreak !== b.longestStreak) {
          return b.longestStreak - a.longestStreak;
        }
        if (a.totalWins !== b.totalWins) {
          return b.totalWins - a.totalWins;
        }
        if (a.timeInPit !== b.timeInPit) {
          return b.timeInPit - a.timeInPit; // More time fighting is better
        }
        if (a.totalFights !== b.totalFights) {
          return b.totalFights - a.totalFights; // More fights is better
        }
        return a.totalLosses - b.totalLosses; // Fewer losses is better
      });
    }
  }

  // Get top 4 fighters for fairness analysis (works in both modes)
  getTopFourFighters() {
    const sorted = this.getSortedFighters();

    return sorted.slice(0, 4).map((fighter, index) => ({
      rank: index + 1,
      name: fighter.name,
      level: fighter.level,
      longestStreak: fighter.longestStreak,
      currentStreak: fighter.currentStreak,
      totalWins: fighter.totalWins,
      totalLosses: fighter.totalLosses,
      totalSimuls: fighter.totalSimuls,
      totalFights: fighter.totalFights,
      timeInPit: fighter.timeInPit,
      unluckyPercentage: fighter.getUnluckyPercentage(),
      luckyPercentage: fighter.getLuckyPercentage(),
      winRate: fighter.getWinRate(),
      isRetired: fighter.isRetired,
      retiredAt: fighter.retiredAt,
      retiredAfterFights: fighter.retiredAfterFights,
      efficiency: this.config.retirementStreakLength && fighter.isRetired && fighter.retiredAfterFights > 0 ?
        (fighter.longestStreak / fighter.retiredAfterFights * 100) : // Streak per fight ratio for retirement mode
        (fighter.totalFights > 0 ? (fighter.totalWins / fighter.totalFights * 100) : 0), // Win rate as efficiency for traditional mode
      // NEW: Award tracking
      earnedAward: fighter.earnedAward,
      eliminatedByAwardWinner: fighter.eliminatedByAwardWinner,
      eliminationsWhileAwardWinner: fighter.eliminationsWhileAwardWinner,
      eliminationByAwardWinnerRate: fighter.getEliminationByAwardWinnerRate()
    }));
  }

  // Get all tournament placements
  getAllTournamentPlacements() {
    const sortedFighters = this.getSortedFighters();

    // Create placement mapping: fighterName -> placement
    const placements = {};
    sortedFighters.forEach((fighter, index) => {
      placements[fighter.name] = index + 1; // 1-based ranking
    });

    return placements;
  }

  runRound() {
    console.log('=== TOURNAMENT ROUND STARTING ===');
    console.log(`Fighters: ${this.fighters.length}`);
    console.log(`Pits: ${this.config.numberOfPits}`);
    console.log(`Round Duration: ${this.config.roundDurationMinutes} minutes`);
    console.log(`Queue Strategy: ${this.config.useShortestQueue ? 'Shortest queue per pit' : 'Single shared queue'}`);
    console.log(`Skill Multiplier: ${this.config.skillMultiplier}x per level`);
    console.log(`Fatigue Multiplier: ${this.config.fatigueMultiplier} per streak`);
    console.log(`Base Simul Chance: ${(this.config.baseSimulChance * 100).toFixed(1)}%`);
    console.log(`Simul Reduction: ${(this.config.simulReductionPerLevel * 100).toFixed(1)}% per level difference`);
    console.log(`Average Fight Duration: ${this.config.averageFightDurationSeconds}s ±${this.config.fightDurationVariance}s`);
    console.log(`Rest Period: ${this.config.restPeriodSeconds}s between fights`);
    if (this.config.retirementStreakLength) {
      console.log(`🏆 Retirement Streak: First ${this.config.maxRetirements} fighters to reach ${this.config.retirementStreakLength} wins retire`);
    }

    // Reset all fighters and retirement counter
    this.fighters.forEach(fighter => fighter.reset());
    this.retiredCount = 0;

    // Create queue manager
    const queueManager = new QueueManager(
      this.fighters,
      this.config.numberOfPits,
      this.config.useShortestQueue
    );

    // Create pits with reference to tournament simulator for retirement checks
    const pits = [];
    for (let i = 0; i < this.config.numberOfPits; i++) {
      pits.push(new BearPit(i, this.config, this)); // Pass tournament reference
    }

    console.log('\n--- Running Time-Based Simulation ---');
    console.log(`Initial queue distribution: ${JSON.stringify(queueManager.getQueueStatus())}`);

    // Time-based simulation with small time steps
    let currentTime = 0;
    const timeStep = this.config.simulationTimeStepSeconds / 60; // Convert seconds to minutes
    const roundEndTime = this.config.roundDurationMinutes;
    let stepCount = 0;

    while (currentTime < roundEndTime) {
      stepCount++;

      // Update elapsed time for all pits
      pits.forEach(pit => {
        pit.elapsedTime = currentTime;
      });

      // Each pit tries to manage its fights
      let activePits = 0;
      for (const pit of pits) {
        if (pit.tryRunFight(queueManager)) {
          activePits++;
        }
      }

      // Break if no pits are active and no fighters will become available
      if (activePits === 0 && !queueManager.hasAvailableFighters(null, currentTime + 5)) {
        console.log(`All pits inactive and no fighters available at ${currentTime.toFixed(1)} minutes`);
        break;
      }

      // Log progress every 5 minutes of simulation time
      const stepsPerFiveMinutes = Math.round(5 * 60 / this.config.simulationTimeStepSeconds);
      if (stepCount % stepsPerFiveMinutes === 0) {
        const activeCount = pits.filter(p => p.isActive).length;
        const queueStatus = queueManager.getQueueStatus(currentTime);
        console.log(`Time ${currentTime.toFixed(1)}min: ${activeCount} active pits, total fights: ${pits.reduce((sum, p) => sum + p.totalFights, 0)}, retired: ${this.retiredCount}/${this.config.maxRetirements}`);
        console.log(`  Queue status: ${JSON.stringify(queueStatus)}`);
      }

      currentTime += timeStep;
    }

    // Allow any fights that started before round end to finish
    const maxExtraTime = Math.max(...pits.map(p =>
      p.currentFightEndTime ? p.currentFightEndTime - roundEndTime : 0
    ));

    if (maxExtraTime > 0) {
      console.log(`Allowing fights to finish - extending ${maxExtraTime.toFixed(1)} minutes past round end`);
      currentTime = roundEndTime + maxExtraTime;

      // Update all pits to final time and resolve any remaining fights
      pits.forEach(pit => {
        pit.elapsedTime = currentTime;
        if (pit.currentFightEndTime && pit.currentFightEndTime <= currentTime) {
          pit.resolveFight(queueManager);
        }
      });
    }

    // Collect results
    const pitResults = pits.map(pit => pit.getResult());

    // Find overall winner based on retirement system
    let overallWinner = null;

    if (this.config.retirementStreakLength) {
      // Race-to-streak mode: winner is who reached target streak first (fastest by fights)
      const retiredFighters = this.fighters
        .filter(f => f.isRetired)
        .sort((a, b) => {
          // First by retirement time (earlier is better)
          if (a.retiredAt !== b.retiredAt) {
            return a.retiredAt - b.retiredAt;
          }
          // Tie-break by fewer total fights (more efficient)
          return a.retiredAfterFights - b.retiredAfterFights;
        });

      overallWinner = retiredFighters.length > 0 ? retiredFighters[0] : null;
    } else {
      // Traditional mode: winner by longest streak, then total wins
      let bestStreak = 0;
      let bestWins = 0;

      for (const fighter of this.fighters) {
        if (fighter.longestStreak > bestStreak ||
          (fighter.longestStreak === bestStreak && fighter.totalWins > bestWins)) {
          bestStreak = fighter.longestStreak;
          bestWins = fighter.totalWins;
          overallWinner = fighter;
        }
      }
    }

    console.log('\n--- Round Completed ---');
    console.log(`Simulation Steps: ${stepCount}`);

    if (this.config.retirementStreakLength) {
      console.log(`Retired fighters: ${this.retiredCount}/${this.config.maxRetirements} (retirement cap reached: ${this.retiredCount >= this.config.maxRetirements})`);
    }

    pitResults.forEach(result => {
      console.log(`Pit ${result.pitId}: ${result.totalFights} fights (${result.totalSimuls} simuls), ${result.duration.toFixed(1)} minutes`);
      if (result.champion) {
        console.log(`  Champion: ${result.champion.name} (Level ${result.champion.level}, Streak: ${result.champion.currentStreak})`);
      }
    });

    // NEW: Generate award elimination analysis
    const awardAnalysis = this.analyzeAwardEliminations();

    return {
      pitResults: pitResults,
      overallWinner: overallWinner ? {
        name: overallWinner.name,
        level: overallWinner.level,
        longestStreak: overallWinner.longestStreak,
        totalWins: overallWinner.totalWins,
        totalLosses: overallWinner.totalLosses,
        totalSimuls: overallWinner.totalSimuls,
        timeInPit: overallWinner.timeInPit,
        isRetired: overallWinner.isRetired,
        retiredAt: overallWinner.retiredAt,
        retiredAfterFights: overallWinner.retiredAfterFights,
        earnedAward: overallWinner.earnedAward
      } : null,
      roundDuration: this.config.roundDurationMinutes,
      totalFights: pitResults.reduce((sum, result) => sum + result.totalFights, 0),
      totalSimuls: pitResults.reduce((sum, result) => sum + result.totalSimuls, 0),
      config: this.config,
      retiredFighters: this.fighters.filter(f => f.isRetired).map(f => ({
        name: f.name,
        level: f.level,
        retiredAt: f.retiredAt,
        retiredAfterFights: f.retiredAfterFights,
        streakAchieved: this.config.retirementStreakLength,
        earnedAward: f.earnedAward
      })),
      retiredCount: this.retiredCount,
      maxRetirements: this.config.maxRetirements,
      topFourFighters: this.getTopFourFighters(),
      tournamentPlacements: this.getAllTournamentPlacements(),
      awardAnalysis: awardAnalysis, // NEW: Award and elimination analysis
      fighterStats: this.fighters.map(f => ({
        name: f.name,
        level: f.level,
        longestStreak: f.longestStreak,
        currentStreak: f.currentStreak,
        totalWins: f.totalWins,
        totalLosses: f.totalLosses,
        totalSimuls: f.totalSimuls,
        totalFights: f.totalFights,
        unluckyFights: f.unluckyFights,
        unluckyPercentage: f.getUnluckyPercentage().toFixed(1),
        luckyPercentage: f.getLuckyPercentage().toFixed(1),
        timeInPit: f.timeInPit,
        isChampion: f.isChampion,
        currentPitId: f.currentPitId,
        isRetired: f.isRetired,
        retiredAt: f.retiredAt,
        retiredAfterFights: f.retiredAfterFights,
        // NEW: Award tracking
        earnedAward: f.earnedAward,
        awardThreshold: f.getAwardThreshold(),
        canEarnAward: f.canEarnAward(this.config.retirementStreakLength),
        eliminatedByAwardWinner: f.eliminatedByAwardWinner,
        eliminationsWhileAwardWinner: f.eliminationsWhileAwardWinner,
        eliminationByAwardWinnerRate: f.getEliminationByAwardWinnerRate()
      }))
    };
  }
}

export default TournamentSimulator;
