export class BearPit {
  constructor(pitId, config, tournamentSimulator = null) {
    this.pitId = pitId;
    this.config = config;
    this.tournamentSimulator = tournamentSimulator; // NEW: Reference to tournament for retirement coordination
    this.currentChampion = null;
    this.fights = [];
    this.totalFights = 0;
    this.totalSimuls = 0;
    this.elapsedTime = 0;
    this.isActive = true;
    this.currentFightEndTime = null; // Track when current fight will end
    this.currentFightStartTime = null; // Track when current fight started
  }

  calculateFightOutcomeProbabilities(fighter1, fighter2) {
    // Base probability based on skill difference
    const skillDifference = fighter1.level - fighter2.level;
    const baseMultiplier = Math.pow(this.config.skillMultiplier, skillDifference);
    let baseProbability = baseMultiplier / (1 + baseMultiplier);

    // Apply fatigue if fighter1 is the current champion
    if (this.currentChampion === fighter1) {
      const fatigueReduction = fighter1.currentStreak * this.config.fatigueMultiplier;
      baseProbability = Math.max(0.01, baseProbability - fatigueReduction);
    }

    baseProbability = Math.min(0.99, Math.max(0.01, baseProbability));

    // Calculate simul probability based on level difference
    const levelDifference = Math.abs(fighter1.level - fighter2.level);
    let simulProbability = this.config.baseSimulChance || 0.1; // 10% base simul chance

    // Reduce simul chance as level difference increases
    const simulReduction = levelDifference * (this.config.simulReductionPerLevel || 0.02); // 2% reduction per level
    simulProbability = Math.max(0.01, simulProbability - simulReduction);

    // Adjust win probabilities to account for simul
    const remainingProbability = 1 - simulProbability;
    const fighter1WinProbability = baseProbability * remainingProbability;
    const fighter2WinProbability = (1 - baseProbability) * remainingProbability;

    return {
      fighter1Win: fighter1WinProbability,
      fighter2Win: fighter2WinProbability,
      simul: simulProbability
    };
  }

  generateFightDuration() {
    // Generate fight duration based on configured average and variance
    const avgDuration = this.config.averageFightDurationSeconds || 45;
    const variance = this.config.fightDurationVariance || 15;
    
    // Generate random duration with normal-ish distribution
    // Using simple approach: average ± random variance
    const minDuration = Math.max(10, avgDuration - variance); // Minimum 10 seconds
    const maxDuration = avgDuration + variance;
    
    const durationSeconds = minDuration + Math.random() * (maxDuration - minDuration);
    return durationSeconds / 60; // Convert to minutes
  }

  tryRunFight(queueManager) {
    // Check if we can start a new fight (round hasn't ended and no fight in progress)
    if (!this.isActive || this.elapsedTime >= this.config.roundDurationMinutes) {
      this.isActive = false;
      return false;
    }

    // If there's a fight in progress, check if it has finished
    if (this.currentFightEndTime !== null) {
      if (this.elapsedTime < this.currentFightEndTime) {
        // Fight still in progress
        return true;
      } else {
        // Fight just finished, resolve it
        this.resolveFight(queueManager);
      }
    }

    // Try to start a new fight
    return this.startNewFight(queueManager);
  }

  startNewFight(queueManager) {
    let fighter1, fighter2;

    if (this.currentChampion === null) {
      // First fight - need two fighters from queue
      fighter1 = queueManager.getNextFighter(this.pitId, this.elapsedTime);
      fighter2 = queueManager.getNextFighter(this.pitId, this.elapsedTime);

      if (!fighter1 || !fighter2) {
        // Put fighter back if we only got one
        if (fighter1) queueManager.addFighter(fighter1, this.pitId, this.elapsedTime, 0); // No rest period when putting back
        return false;
      }
    } else {
      // Champion defends
      fighter1 = this.currentChampion;
      fighter2 = queueManager.getNextFighter(this.pitId, this.elapsedTime);

      if (!fighter2) {
        return false; // No challenger available
      }
    }

    // Generate fight duration and set start/end times
    const fightDuration = this.generateFightDuration();
    this.currentFightStartTime = this.elapsedTime;
    this.currentFightEndTime = this.elapsedTime + fightDuration;
    
    // Store fighters for when fight resolves
    this.currentFighter1 = fighter1;
    this.currentFighter2 = fighter2;
    
    return true;
  }

  resolveFight(queueManager) {
    const fighter1 = this.currentFighter1;
    const fighter2 = this.currentFighter2;
    
    // Calculate the actual fight duration from start to end
    const fightDuration = this.currentFightEndTime - this.currentFightStartTime;
    
    // Update elapsed time to fight end
    this.elapsedTime = this.currentFightEndTime;
    
    // Clear current fight tracking
    this.currentFightEndTime = null;
    this.currentFightStartTime = null;
    this.currentFighter1 = null;
    this.currentFighter2 = null;

    const probabilities = this.calculateFightOutcomeProbabilities(fighter1, fighter2);
    const randomValue = Math.random();

    // Record fight statistics for both fighters
    fighter1.recordFight(probabilities.fighter1Win, probabilities.fighter2Win);
    fighter2.recordFight(probabilities.fighter2Win, probabilities.fighter1Win);

    // NEW: Both fighters spent time in this fight regardless of outcome
    fighter1.recordFightTime(fightDuration);
    fighter2.recordFightTime(fightDuration);

    // Get rest period from config (default 30 seconds = 0.5 minutes)
    const restPeriodMinutes = (this.config.restPeriodSeconds || 30) / 60;

    let outcome, winner, loser;

    if (randomValue < probabilities.fighter1Win) {
      // Fighter 1 wins
      outcome = 'win';
      winner = fighter1;
      loser = fighter2;

      winner.win(fightDuration, loser);
      loser.lose(winner);

      this.currentChampion = winner;
      winner.isChampion = true;
      winner.currentPitId = this.pitId;
      queueManager.addFighter(loser, this.pitId, this.elapsedTime, restPeriodMinutes);

    } else if (randomValue < probabilities.fighter1Win + probabilities.fighter2Win) {
      // Fighter 2 wins
      outcome = 'win';
      winner = fighter2;
      loser = fighter1;

      winner.win(fightDuration, loser);
      loser.lose(winner);

      this.currentChampion = winner;
      winner.isChampion = true;
      winner.currentPitId = this.pitId;
      queueManager.addFighter(loser, this.pitId, this.elapsedTime, restPeriodMinutes);

    } else {
      // Simul - both fighters die
      outcome = 'simul';
      fighter1.simul(fighter2); // FIXED: Pass opponent for award tracking
      fighter2.simul(fighter1); // FIXED: Pass opponent for award tracking

      this.currentChampion = null;
      this.totalSimuls++;

      // Both fighters go back to queue with rest period
      queueManager.addFighter(fighter1, this.pitId, this.elapsedTime, restPeriodMinutes);
      queueManager.addFighter(fighter2, this.pitId, this.elapsedTime, restPeriodMinutes);
    }

    // NEW: Check if winner reached target streak and coordinate retirement with tournament
    if (outcome === 'win' && this.config.retirementStreakLength && 
        winner.currentStreak >= this.config.retirementStreakLength) {
      
      // Use tournament simulator's retirement coordination if available
      if (this.tournamentSimulator && this.tournamentSimulator.retireFighter) {
        const retired = this.tournamentSimulator.retireFighter(winner, this.elapsedTime);
        if (retired) {
          console.log(`🏆 ${winner.name} reaches target streak of ${this.config.retirementStreakLength} and retires from pit ${this.pitId} at ${this.elapsedTime.toFixed(1)}min after ${winner.totalFights} fights! (${this.tournamentSimulator.retiredCount}/${this.config.maxRetirements})`);
          this.currentChampion = null; // Clear the pit
        } else {
          console.log(`⚠️ ${winner.name} reaches ${this.config.retirementStreakLength} wins but retirement cap (${this.config.maxRetirements}) is full! Continues fighting.`);
        }
      } else {
        // Fallback for backward compatibility (retire without limit)
        console.log(`🏆 ${winner.name} reaches target streak of ${this.config.retirementStreakLength} and retires from pit ${this.pitId} at ${this.elapsedTime.toFixed(1)}min after ${winner.totalFights} fights!`);
        winner.retire(this.elapsedTime);
        this.currentChampion = null; // Clear the pit
      }
    }

    this.fights.push({
      time: this.elapsedTime.toFixed(1),
      fighter1: fighter1.name,
      fighter2: fighter2.name,
      outcome: outcome,
      winner: outcome === 'win' ? winner.name : null,
      duration: (fightDuration * 60).toFixed(0), // Show duration in seconds
      streak: outcome === 'win' ? winner.currentStreak : 0,
      retired: !!(outcome === 'win' && winner.isRetired), // NEW: Track retirements
      probabilities: {
        fighter1Win: probabilities.fighter1Win.toFixed(3),
        fighter2Win: probabilities.fighter2Win.toFixed(3),
        simul: probabilities.simul.toFixed(3)
      },
      unlucky: {
        fighter1Unlucky: probabilities.fighter1Win < 0.1,
        fighter2Unlucky: probabilities.fighter2Win < 0.1
      }
    });

    this.totalFights++;

    // Check if round time is up (but allow current fight to finish)
    if (this.elapsedTime >= this.config.roundDurationMinutes) {
      this.isActive = false;
    }
  }

  getResult() {
    return {
      pitId: this.pitId,
      champion: this.currentChampion ? {
        name: this.currentChampion.name,
        level: this.currentChampion.level,
        currentStreak: this.currentChampion.currentStreak,
        longestStreak: this.currentChampion.longestStreak,
        timeInPit: this.currentChampion.timeInPit,
        timeAsChampion: this.currentChampion.timeAsChampion
      } : null,
      totalFights: this.totalFights,
      totalSimuls: this.totalSimuls,
      duration: this.elapsedTime,
      fights: this.fights,
      isActive: this.isActive
    };
  }

  getCurrentStatus() {
    return {
      pitId: this.pitId,
      elapsedTime: this.elapsedTime.toFixed(1),
      isActive: this.isActive,
      champion: this.currentChampion ? {
        name: this.currentChampion.name,
        level: this.currentChampion.level,
        streak: this.currentChampion.currentStreak
      } : 'None',
      totalFights: this.totalFights,
      averageFightDuration: this.totalFights > 0 ? 
        (this.fights.reduce((sum, fight) => sum + parseFloat(fight.duration), 0) / this.totalFights).toFixed(1) + 's' : 'N/A'
    };
  }
}