import TournamentSimulator from "./tournament-simulator.js";

export class FairnessAnalyzer {
  constructor(fighterCountOrFighters, levelDistribution = null, baseConfig = {}) {
    // Support both direct fighter list or generated fighters
    if (Array.isArray(fighterCountOrFighters)) {
      // Passed actual fighter objects
      this.baseFighters = fighterCountOrFighters;
    } else {
      // Passed fighter count - generate fighters
      this.baseFighters = this.generateFighters(fighterCountOrFighters, levelDistribution);
    }

    this.baseConfig = {
      skillMultiplier: 3.0,
      fatigueMultiplier: 0.001,
      useShortestQueue: false,
      baseSimulChance: 0.15,
      simulReductionPerLevel: 0.015,
      averageFightDurationSeconds: 30,
      fightDurationVariance: 10,
      restPeriodSeconds: 30,
      ...baseConfig
    };
  }

  // Generate fighters with configurable count and level distribution
  generateFighters(count, levelDistribution = null) {
    const fighters = [];

    // Default level distribution if none provided
    if (!levelDistribution) {
      levelDistribution = this.generateDefaultLevelDistribution(count);
    }

    let fighterIndex = 1;

    // Generate fighters based on level distribution
    for (const [level, fighterCount] of Object.entries(levelDistribution)) {
      for (let i = 0; i < fighterCount; i++) {
        fighters.push({
          name: `Fighter${fighterIndex}`,
          level: parseInt(level)
        });
        fighterIndex++;
      }
    }

    // If we don't have enough fighters, fill with level 1
    while (fighters.length < count) {
      fighters.push({
        name: `Fighter${fighterIndex}`,
        level: 1
      });
      fighterIndex++;
    }

    // If we have too many, trim excess
    return fighters.slice(0, count);
  }

  // Generate a realistic level distribution based on fighter count
  generateDefaultLevelDistribution(count) {
    const distribution = {};

    // Common boffer distribution: lots of low levels, fewer high levels
    const levelWeights = {
      1: 0.35,  // 35% level 1 (newbies)
      2: 0.25,  // 25% level 2
      3: 0.20,  // 20% level 3
      4: 0.10,  // 10% level 4
      5: 0.06,  // 6% level 5
      6: 0.03,  // 3% level 6
      7: 0.01   // 1% level 7+
    };

    for (const [level, weight] of Object.entries(levelWeights)) {
      const fighterCount = Math.round(count * weight);
      if (fighterCount > 0) {
        distribution[level] = fighterCount;
      }
    }

    // Ensure we have at least the right total
    const totalGenerated = Object.values(distribution).reduce((a, b) => a + b, 0);
    if (totalGenerated < count) {
      distribution[1] = (distribution[1] || 0) + (count - totalGenerated);
    }

    return distribution;
  }

  // Calculate various fairness metrics with competitive focus
  calculateFairnessMetrics(results) {
    const fighterStats = results.fighterStats;
    const totalFighters = fighterStats.length;

    // 1. Fight Distribution Fairness - THE MOST IMPORTANT METRIC
    const fightCounts = fighterStats.map(f => f.totalFights);
    const avgFights = fightCounts.reduce((a, b) => a + b, 0) / totalFighters;
    const fightVariance = fightCounts.reduce((sum, count) => sum + Math.pow(count - avgFights, 2), 0) / totalFighters;
    const fightStdDev = Math.sqrt(fightVariance);
    const fightDistributionCV = avgFights > 0 ? fightStdDev / avgFights : 0; // Lower is more fair

    // 2. Fight Frequency Analysis
    const avgFightsPerMinute = results.roundDuration > 0 ? avgFights / results.roundDuration : 0;
    const maxFightsPerMinute = Math.max(...fighterStats.map(f =>
      results.roundDuration > 0 ? f.totalFights / results.roundDuration : 0
    ));

    // 3. Rest Time Analysis (time between fights for each fighter)
    const avgRestTime = results.roundDuration > 0 && avgFights > 1 ?
      (results.roundDuration / Math.max(1, avgFights - 1)) : results.roundDuration;

    // 4. Competitive Balance - how much do skill levels correlate with performance?
    const skillLevels = fighterStats.map(f => f.level);
    
    // Use tournament placements from results
    const tournamentPlacements = results.tournamentPlacements;
    
    // Calculate composite performance score (0-1, higher is better)
    const performanceScores = fighterStats.map(fighter => {
      const winRate = fighter.totalFights > 0 ? fighter.totalWins / fighter.totalFights : 0;
      // Convert placement to score (1st place = 1.0, last place approaches 0)
      const placement = tournamentPlacements[fighter.name];
      const placementScore = 1 - ((placement - 1) / (fighterStats.length - 1));
      
      // Weight: 60% win rate, 40% placement (placement matters more in smaller tournaments)
      const weightWinRate = fighterStats.length > 10 ? 0.6 : 0.5;
      const weightPlacement = 1 - weightWinRate;
      
      return (winRate * weightWinRate) + (placementScore * weightPlacement);
    });
    
    const skillWinCorrelation = this.calculateCorrelation(skillLevels, performanceScores);

    // 5. Unlucky Fighter Analysis - how many fighters were consistently unlucky?
    const unluckyFighters = fighterStats.filter(f => parseFloat(f.unluckyPercentage) > 50).length;
    const unluckyRate = unluckyFighters / totalFighters;

    // 6. Winner Legitimacy - does the winner have reasonable stats?
    const winner = results.overallWinner;
    const winnerLegitimacy = winner ? {
      levelRank: this.getRankByLevel(winner.level, skillLevels),
      winRateVsLevel: winner.totalWins > 0 ? (winner.totalWins / (winner.totalWins + winner.totalLosses + winner.totalSimuls)) / (winner.level / 10) : 0
    } : null;

    // 7. Time Efficiency - how much of the available time was used effectively?
    const totalPossibleTime = results.config.numberOfPits * results.roundDuration;
    const actualFightTime = results.pitResults.reduce((sum, pit) => sum + pit.duration, 0);
    const timeEfficiency = totalPossibleTime > 0 ? actualFightTime / totalPossibleTime : 0;

    // 8. Fight distribution extremes
    const minFights = Math.min(...fightCounts);
    const maxFights = Math.max(...fightCounts);
    const fightRange = maxFights - minFights;

    // 9. Realism Checks (for information, but not heavily weighted in competitive fairness)
    const realismFlags = {
      excessiveFightRate: avgFightsPerMinute > 0.5,
      impossibleFightRate: maxFightsPerMinute > 1.0,
      insufficientRest: avgRestTime < 2.0,
      unrealisticTotalFights: results.totalFights > (results.config.numberOfPits * results.roundDuration * 1.5)
    };

    // NEW: Retirement Mode Analysis
    let retirementMetrics = null;
    if (results.config.retirementStreakLength) {
      const retiredFighters = fighterStats.filter(f => f.isRetired);
      const retirementTimes = retiredFighters.map(f => f.retiredAt).filter(t => t !== null);
      const retirementFights = retiredFighters.map(f => f.retiredAfterFights).filter(f => f !== null);
      
      retirementMetrics = {
        retiredCount: results.retiredCount || 0,
        maxRetirements: results.maxRetirements || results.config.maxRetirements,
        targetStreak: results.config.retirementStreakLength,
        averageRetirementTime: retirementTimes.length > 0 ? retirementTimes.reduce((a, b) => a + b, 0) / retirementTimes.length : null,
        averageRetirementFights: retirementFights.length > 0 ? retirementFights.reduce((a, b) => a + b, 0) / retirementFights.length : null,
        retirementSuccess: results.maxRetirements > 0 ? (results.retiredCount || 0) / results.maxRetirements : 0
      };
    }

    return {
      fightDistribution: {
        avgFightsPerFighter: avgFights,
        fightDistributionCV: fightDistributionCV, // PRIMARY FAIRNESS METRIC
        minFights: minFights,
        maxFights: maxFights,
        fightRange: fightRange,
        avgFightsPerMinute: avgFightsPerMinute,
        maxFightsPerMinute: maxFightsPerMinute,
        avgRestTimeBetweenFights: avgRestTime
      },
      competitiveBalance: {
        skillWinCorrelation: skillWinCorrelation, // Should be positive but not too high
        unluckyFighterRate: unluckyRate // Lower is better
      },
      efficiency: {
        timeEfficiency: timeEfficiency,
        fightsPerMinute: results.roundDuration > 0 ? results.totalFights / results.roundDuration : 0,
        simulRate: results.totalFights > 0 ? results.totalSimuls / results.totalFights : 0
      },
      realism: realismFlags,
      winnerLegitimacy: winnerLegitimacy,
      retirement: retirementMetrics, // NEW: Retirement mode metrics
      rawStats: {
        totalFights: results.totalFights,
        totalSimuls: results.totalSimuls,
        roundDuration: results.roundDuration
      }
    };
  }

  // Calculate Pearson correlation coefficient
  calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  getRankByLevel(level, allLevels) {
    const sorted = [...allLevels].sort((a, b) => b - a);
    return sorted.indexOf(level) + 1;
  }

  // Calculate competitive fairness score (0-100, higher is better) - ONLY competition metrics
  calculateCompetitiveFairness(metrics) {
    let score = 100;

    // 1. FIGHT DISTRIBUTION FAIRNESS - Most important for competition (60% weight)
    // CV of 0.0 = perfect, 0.2 = good, 0.5 = poor, 1.0+ = terrible
    const cvPenalty = Math.pow(metrics.fightDistribution.fightDistributionCV, 2) * 150;
    score -= cvPenalty;

    // 2. SKILL-WIN CORRELATION - Critical for legitimate competition (40% weight)
    // Ideal correlation is around 0.4-0.6 (skill matters but not deterministic)
    const skillCorrelation = metrics.competitiveBalance.skillWinCorrelation;
    let skillPenalty = 0;

    if (skillCorrelation < 0.2) {
      // Too random - skill doesn't matter enough
      skillPenalty = (0.2 - skillCorrelation) * 125; // Heavy penalty for randomness
    } else if (skillCorrelation > 0.7) {
      // Too deterministic - skill determines everything
      skillPenalty = (skillCorrelation - 0.7) * 100; // Heavy penalty for determinism
    } else if (skillCorrelation < 0.4) {
      // Below ideal range but acceptable
      skillPenalty = (0.4 - skillCorrelation) * 40;
    } else if (skillCorrelation > 0.6) {
      // Above ideal range but acceptable
      skillPenalty = (skillCorrelation - 0.6) * 40;
    }
    // Skill correlation between 0.4-0.6 gets no penalty (ideal range)

    score -= skillPenalty;

    return Math.max(0, Math.min(100, score));
  }

  // Calculate a combined score that includes competition + practical considerations
  calculateOptimizedScore(metrics) {
    const competitiveFairness = this.calculateCompetitiveFairness(metrics);
    const totalFights = metrics.rawStats.totalFights;
    const avgFightsPerFighter = metrics.fightDistribution.avgFightsPerFighter;
    const skillCorrelation = metrics.competitiveBalance.skillWinCorrelation;

    // Primary score: competitive fairness (0-100) - PURE competition metrics
    // Secondary considerations: fight count and practical factors

    // Fight quantity bonuses (separate from competitive fairness)
    const fightBonus = Math.min(12, totalFights / 4); // Up to 12 points for 48+ total fights
    const avgFightBonus = Math.min(8, avgFightsPerFighter * 1.6); // Up to 8 points for 5+ avg fights

    // Practical penalties (not part of competitive fairness but important for tournaments)
    let practicalPenalty = 0;

    // Extreme fight range penalty (practical concern, not competitive fairness)
    const avgFights = metrics.fightDistribution.avgFightsPerFighter;
    const relativeFightRange = avgFights > 0 ? metrics.fightDistribution.fightRange / avgFights : 0;
    practicalPenalty += relativeFightRange * 15;

    // Unlucky fighter rate penalty (competitive concern but not core fairness)
    practicalPenalty += metrics.competitiveBalance.unluckyFighterRate * 10;

    // Time efficiency bonus (practical consideration)
    const efficiencyBonus = metrics.efficiency.timeEfficiency * 3;

    // Extra bonus for ideal skill correlation (reward the sweet spot)
    let skillBonus = 0;
    if (skillCorrelation >= 0.4 && skillCorrelation <= 0.6) {
      const distanceFromIdeal = Math.abs(skillCorrelation - 0.5);
      skillBonus = (0.1 - distanceFromIdeal) * 50; // Up to 5 extra points for perfect 0.5 correlation
    }

    return competitiveFairness + fightBonus + avgFightBonus + efficiencyBonus + skillBonus - practicalPenalty;
  }

  // Run analysis across different configurations with competitive focus
  analyzeFairness(timeOptions = [10, 15, 20, 25], pitOptions = null, queueOptions = [false, true], iterations = 10) {
    if (!pitOptions) {
      // Default pit options based on fighter count
      const fighterCount = this.baseFighters.length;
      pitOptions = [];
      for (let pits = 1; pits <= Math.min(fighterCount / 2, 6); pits++) {
        pitOptions.push(pits);
      }
    }

    const results = [];
    const isRetirementMode = this.baseConfig.retirementStreakLength !== undefined && this.baseConfig.retirementStreakLength !== null;

    console.log(`Analyzing ${isRetirementMode ? 'RETIREMENT MODE' : 'TRADITIONAL'} fairness for ${this.baseFighters.length} fighters across ${timeOptions.length} time options, ${pitOptions.length} pit options, and ${queueOptions.length} queue strategies with ${iterations} iterations each...`);
    console.log(`Level Distribution: ${this.getLevelDistribution()}`);
    if (isRetirementMode) {
      console.log(`Retirement Target: ${this.baseConfig.retirementStreakLength} wins (max ${this.baseConfig.maxRetirements} winners)`);
    }
    console.log(`Optimization Priority: 1) Fight Distribution CV (lower=better), 2) Total Fights, 3) Fights per Fighter`);

    let configIndex = 0;
    const totalConfigs = timeOptions.length * pitOptions.length * queueOptions.length;

    for (const time of timeOptions) {
      for (const pits of pitOptions) {
        for (const useShortestQueue of queueOptions) {
          // Skip shortest queue option for single pit (doesn't make sense)
          if (pits === 1 && useShortestQueue === true) {
            continue;
          }

          configIndex++;
          const queueStrategy = useShortestQueue ? 'shortest' : 'shared';
          console.log(`\nTesting Configuration ${configIndex}/${totalConfigs}: ${time} minutes, ${pits} pit(s), ${queueStrategy} queue`);

          const configResults = [];

          for (let i = 0; i < iterations; i++) {
            const config = {
              ...this.baseConfig,
              fighters: this.baseFighters,
              roundDurationMinutes: time,
              numberOfPits: pits,
              useShortestQueue: useShortestQueue
            };

            const simulator = new TournamentSimulator(config);
            const result = simulator.runRound();
            const metrics = this.calculateFairnessMetrics(result);
            const competitiveFairness = this.calculateCompetitiveFairness(metrics);
            const optimizedScore = this.calculateOptimizedScore(metrics);

            configResults.push({
              result,
              metrics,
              competitiveFairness,
              optimizedScore
            });
          }

          // Calculate averages for this configuration
          const avgMetrics = this.averageMetrics(configResults);
          const avgCompetitiveFairness = configResults.reduce((sum, r) => sum + r.competitiveFairness, 0) / iterations;
          const avgOptimizedScore = configResults.reduce((sum, r) => sum + r.optimizedScore, 0) / iterations;

          results.push({
            configuration: {time, pits, useShortestQueue, ...this.baseConfig},
            averageMetrics: avgMetrics,
            competitiveFairnessScore: avgCompetitiveFairness,
            optimizedScore: avgOptimizedScore,
            allRuns: configResults
          });

          console.log(`  Optimized Score: ${avgOptimizedScore.toFixed(1)}`);
          console.log(`  Fight Distribution CV: ${avgMetrics.fightDistribution.fightDistributionCV.toFixed(3)} (PRIMARY METRIC)`);
          console.log(`  Avg Fights/Fighter: ${avgMetrics.fightDistribution.avgFightsPerFighter.toFixed(1)}`);
          console.log(`  Total Fights: ${avgMetrics.rawStats.totalFights.toFixed(1)}`);
          console.log(`  Fight Range: ${avgMetrics.fightDistribution.minFights.toFixed(0)}-${avgMetrics.fightDistribution.maxFights.toFixed(0)}`);

          // NEW: Show retirement metrics if applicable
          if (avgMetrics.retirement) {
            console.log(`  Avg Retirements: ${avgMetrics.retirement.retiredCount.toFixed(1)}/${avgMetrics.retirement.maxRetirements}`);
            if (avgMetrics.retirement.averageRetirementTime) {
              console.log(`  Avg Retirement Time: ${avgMetrics.retirement.averageRetirementTime.toFixed(1)} minutes`);
            }
          }

          // Show realism warnings but don't penalize for them
          const realism = avgMetrics.realism;
          const realismIssues = Object.entries(realism).filter(([key, value]) => value > 0.5);
          if (realismIssues.length > 0) {
            console.log(`  📊 REALISM INFO: ${realismIssues.map(([key]) => key).join(', ')}`);
          }
        }
      }
    }

    // Sort by optimized score (fight distribution fairness + fight count)
    results.sort((a, b) => b.optimizedScore - a.optimizedScore);

    return results;
  }

  // Generate a detailed report showing the best configurations
  generateOptimizedReport(results, topN = 5) {
    const isRetirementMode = results.length > 0 && results[0].averageMetrics.retirement !== null;
    
    console.log('\n' + '='.repeat(80));
    console.log(`TOP ${topN} CONFIGURATIONS FOR ${isRetirementMode ? 'RETIREMENT MODE' : 'TRADITIONAL'} FAIRNESS + FIGHT COUNT`);
    console.log('='.repeat(80));

    for (let i = 0; i < Math.min(topN, results.length); i++) {
      const result = results[i];
      const config = result.configuration;
      const metrics = result.averageMetrics;

      console.log(`\n${i + 1}. ${config.time}min, ${config.pits} pit(s), ${config.useShortestQueue ? 'shortest' : 'shared'} queue`);
      console.log(`   Optimized Score: ${result.optimizedScore.toFixed(1)}`);
      console.log(`   Fight Distribution CV: ${metrics.fightDistribution.fightDistributionCV.toFixed(3)}`);
      console.log(`   Skill-Win Correlation: ${metrics.competitiveBalance.skillWinCorrelation.toFixed(3)} (ideal ~0.4)`);
      console.log(`   Total Fights: ${metrics.rawStats.totalFights.toFixed(1)}`);
      console.log(`   Fights per Fighter: ${metrics.fightDistribution.avgFightsPerFighter.toFixed(1)}`);
      console.log(`   Fight Range: ${metrics.fightDistribution.minFights.toFixed(0)}-${metrics.fightDistribution.maxFights.toFixed(0)} fights`);
      console.log(`   Unlucky Fighter Rate: ${(metrics.competitiveBalance.unluckyFighterRate * 100).toFixed(1)}%`);
      
      // NEW: Show retirement metrics
      if (metrics.retirement) {
        console.log(`   Retirement Success: ${(metrics.retirement.retirementSuccess * 100).toFixed(1)}% (${metrics.retirement.retiredCount.toFixed(1)}/${metrics.retirement.maxRetirements})`);
        if (metrics.retirement.averageRetirementTime) {
          console.log(`   Avg Retirement Time: ${metrics.retirement.averageRetirementTime.toFixed(1)} minutes`);
        }
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('OPTIMIZATION NOTES:');
    console.log('- Fight Distribution CV: THE KEY METRIC - lower values = more even fight distribution');
    console.log('  * 0.00-0.15: Excellent fairness');
    console.log('  * 0.15-0.30: Good fairness');
    console.log('  * 0.30-0.50: Moderate fairness');
    console.log('  * 0.50+: Poor fairness');
    console.log('- Fight Range: Difference between fighter with most/fewest fights');
    console.log('- Skill-Win Correlation: ~0.4 is ideal (skill matters but not deterministic)');
    if (isRetirementMode) {
      console.log('- Retirement Success: Percentage of retirement slots filled by end of tournament');
      console.log('- Retirement Time: Average time for fighters to reach target streak');
    }
    console.log('='.repeat(80));

    return results[0]; // Return the best configuration
  }

  // Helper method to get level distribution summary
  getLevelDistribution() {
    const distribution = {};
    this.baseFighters.forEach(f => {
      distribution[f.level] = (distribution[f.level] || 0) + 1;
    });
    return Object.entries(distribution)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([level, count]) => `L${level}:${count}`)
      .join(', ');
  }

  averageMetrics(configResults) {
    const count = configResults.length;

    const avgMetrics = {
      fightDistribution: {
        avgFightsPerFighter: 0,
        fightDistributionCV: 0,
        minFights: 0,
        maxFights: 0,
        fightRange: 0,
        avgFightsPerMinute: 0,
        maxFightsPerMinute: 0,
        avgRestTimeBetweenFights: 0
      },
      competitiveBalance: {
        skillWinCorrelation: 0,
        unluckyFighterRate: 0
      },
      efficiency: {
        timeEfficiency: 0,
        fightsPerMinute: 0,
        simulRate: 0
      },
      realism: {
        excessiveFightRate: 0,
        impossibleFightRate: 0,
        insufficientRest: 0,
        unrealisticTotalFights: 0
      },
      rawStats: {
        totalFights: 0,
        totalSimuls: 0,
        roundDuration: 0
      },
      retirement: null // Will be populated if any results have retirement metrics
    };

    // Check if any results have retirement metrics
    const hasRetirement = configResults.some(r => r.metrics.retirement !== null);
    if (hasRetirement) {
      avgMetrics.retirement = {
        retiredCount: 0,
        maxRetirements: 0,
        targetStreak: 0,
        averageRetirementTime: 0,
        averageRetirementFights: 0,
        retirementSuccess: 0
      };
    }

    for (const result of configResults) {
      const m = result.metrics;
      avgMetrics.fightDistribution.avgFightsPerFighter += m.fightDistribution.avgFightsPerFighter;
      avgMetrics.fightDistribution.fightDistributionCV += m.fightDistribution.fightDistributionCV;
      avgMetrics.fightDistribution.minFights += m.fightDistribution.minFights;
      avgMetrics.fightDistribution.maxFights += m.fightDistribution.maxFights;
      avgMetrics.fightDistribution.fightRange += m.fightDistribution.fightRange;
      avgMetrics.fightDistribution.avgFightsPerMinute += m.fightDistribution.avgFightsPerMinute;
      avgMetrics.fightDistribution.maxFightsPerMinute += m.fightDistribution.maxFightsPerMinute;
      avgMetrics.fightDistribution.avgRestTimeBetweenFights += m.fightDistribution.avgRestTimeBetweenFights;
      avgMetrics.competitiveBalance.skillWinCorrelation += m.competitiveBalance.skillWinCorrelation;
      avgMetrics.competitiveBalance.unluckyFighterRate += m.competitiveBalance.unluckyFighterRate;
      avgMetrics.efficiency.timeEfficiency += m.efficiency.timeEfficiency;
      avgMetrics.efficiency.fightsPerMinute += m.efficiency.fightsPerMinute;
      avgMetrics.efficiency.simulRate += m.efficiency.simulRate;

      // Realism flags (count how many runs had issues)
      avgMetrics.realism.excessiveFightRate += m.realism.excessiveFightRate ? 1 : 0;
      avgMetrics.realism.impossibleFightRate += m.realism.impossibleFightRate ? 1 : 0;
      avgMetrics.realism.insufficientRest += m.realism.insufficientRest ? 1 : 0;
      avgMetrics.realism.unrealisticTotalFights += m.realism.unrealisticTotalFights ? 1 : 0;

      avgMetrics.rawStats.totalFights += m.rawStats.totalFights;
      avgMetrics.rawStats.totalSimuls += m.rawStats.totalSimuls;
      avgMetrics.rawStats.roundDuration += m.rawStats.roundDuration;

      // NEW: Average retirement metrics if present
      if (m.retirement && avgMetrics.retirement) {
        avgMetrics.retirement.retiredCount += m.retirement.retiredCount;
        avgMetrics.retirement.maxRetirements += m.retirement.maxRetirements;
        avgMetrics.retirement.targetStreak += m.retirement.targetStreak;
        avgMetrics.retirement.averageRetirementTime += m.retirement.averageRetirementTime || 0;
        avgMetrics.retirement.averageRetirementFights += m.retirement.averageRetirementFights || 0;
        avgMetrics.retirement.retirementSuccess += m.retirement.retirementSuccess;
      }
    }

    // Average everything
    for (const category of Object.keys(avgMetrics)) {
      if (category === 'realism') {
        // Convert realism counts to percentages
        for (const key of Object.keys(avgMetrics.realism)) {
          avgMetrics.realism[key] = avgMetrics.realism[key] / count;
        }
      } else if (category === 'retirement' && avgMetrics.retirement) {
        // Average retirement metrics
        for (const key of Object.keys(avgMetrics.retirement)) {
          avgMetrics.retirement[key] = avgMetrics.retirement[key] / count;
        }
        // Handle null averageRetirementTime properly
        if (avgMetrics.retirement.averageRetirementTime === 0) {
          avgMetrics.retirement.averageRetirementTime = null;
        }
      } else if (category !== 'retirement') {
        for (const key of Object.keys(avgMetrics[category])) {
          avgMetrics[category][key] = avgMetrics[category][key] / count;
        }
      }
    }

    return avgMetrics;
  }
}