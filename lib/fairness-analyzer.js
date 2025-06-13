import TournamentSimulator from "./tournament-simulator.js";
import { generateFightersFromDistribution } from "../utils/helpers.js";
import { distributions } from "./distributions.js";
import { FairnessCalculator } from "./fairness-calculator.js";

export class FairnessAnalyzer {
  constructor(fighterCountOrFighters, levelDistribution = null, baseConfig = {}) {
    // Support both direct fighter list or generated fighters
    if (Array.isArray(fighterCountOrFighters)) {
      this.baseFighters = fighterCountOrFighters;
    } else {
      // Use pyramid distribution as default if none provided
      const defaultDistribution = levelDistribution || distributions.find(d => d.name === 'Pyramid').dist;
      this.baseFighters = generateFightersFromDistribution(fighterCountOrFighters, defaultDistribution);
    }

    this.baseConfig = baseConfig;
  }

  calculateFairnessMetrics(results) {
    const fighterStats = results.fighterStats;

    const fightDistribution = FairnessCalculator.calculateFightDistribution(fighterStats, results.roundDuration);
    const competitiveBalance = FairnessCalculator.calculateCompetitiveBalance(fighterStats, results.tournamentPlacements);
    const efficiency = FairnessCalculator.calculateEfficiencyMetrics(results);
    const realism = FairnessCalculator.calculateRealismFlags(fightDistribution, results);
    const winnerLegitimacy = FairnessCalculator.calculateWinnerLegitimacy(results.overallWinner, fighterStats);
    const retirement = FairnessCalculator.calculateRetirementMetrics(results, fighterStats);

    return {
      fightDistribution,
      competitiveBalance,
      efficiency,
      realism,
      winnerLegitimacy,
      retirement,
      rawStats: {
        totalFights: results.totalFights,
        totalSimuls: results.totalSimuls,
        roundDuration: results.roundDuration
      }
    };
  }

  runConfigurationIterations(time, pits, useShortestQueue, iterations) {
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
      const competitiveFairness = FairnessCalculator.calculateCompetitiveFairness(metrics);
      const optimizedScore = FairnessCalculator.calculateOptimizedScore(metrics);

      configResults.push({
        result,
        metrics,
        competitiveFairness,
        optimizedScore
      });
    }
    return configResults;
  }

  analyzeFairness(timeOptions = [10, 15, 20, 25], pitOptions = null, queueOptions = [false, true], iterations = 10) {
    if (!pitOptions) {
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
          if (pits === 1 && useShortestQueue === true) continue;

          configIndex++;
          const queueStrategy = useShortestQueue ? 'shortest' : 'shared';
          console.log(`\nTesting Configuration ${configIndex}/${totalConfigs}: ${time} minutes, ${pits} pit(s), ${queueStrategy} queue`);

          const configResults = this.runConfigurationIterations(time, pits, useShortestQueue, iterations);
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

          this.logConfigurationResults(avgMetrics, avgOptimizedScore, isRetirementMode);
        }
      }
    }

    return results.sort((a, b) => b.optimizedScore - a.optimizedScore);
  }

  logConfigurationResults(avgMetrics, avgOptimizedScore, isRetirementMode) {
    console.log(`  Optimized Score: ${avgOptimizedScore.toFixed(1)}`);
    console.log(`  Fight Distribution CV: ${avgMetrics.fightDistribution.fightDistributionCV.toFixed(3)} (PRIMARY METRIC)`);
    console.log(`  Avg Fights/Fighter: ${avgMetrics.fightDistribution.avgFightsPerFighter.toFixed(1)}`);
    console.log(`  Total Fights: ${avgMetrics.rawStats.totalFights.toFixed(1)}`);
    console.log(`  Fight Range: ${avgMetrics.fightDistribution.minFights.toFixed(0)}-${avgMetrics.fightDistribution.maxFights.toFixed(0)}`);

    if (avgMetrics.retirement) {
      console.log(`  Avg Retirements: ${avgMetrics.retirement.retiredCount.toFixed(1)}/${avgMetrics.retirement.maxRetirements}`);
      if (avgMetrics.retirement.averageRetirementTime) {
        console.log(`  Avg Retirement Time: ${avgMetrics.retirement.averageRetirementTime.toFixed(1)} minutes`);
      }
    }

    const realismIssues = Object.entries(avgMetrics.realism).filter(([key, value]) => value > 0.5);
    if (realismIssues.length > 0) {
      console.log(`  📊 REALISM INFO: ${realismIssues.map(([key]) => key).join(', ')}`);
    }
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
      retirement: null
    };

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
      this.accumulateMetrics(avgMetrics, m);
    }

    this.normalizeMetrics(avgMetrics, count);
    return avgMetrics;
  }

  accumulateMetrics(avgMetrics, metrics) {
    // Accumulate fight distribution metrics
    Object.keys(avgMetrics.fightDistribution).forEach(key => {
      avgMetrics.fightDistribution[key] += metrics.fightDistribution[key];
    });

    // Accumulate competitive balance metrics
    Object.keys(avgMetrics.competitiveBalance).forEach(key => {
      avgMetrics.competitiveBalance[key] += metrics.competitiveBalance[key];
    });

    // Accumulate efficiency metrics
    Object.keys(avgMetrics.efficiency).forEach(key => {
      avgMetrics.efficiency[key] += metrics.efficiency[key];
    });

    // Accumulate realism flags
    Object.keys(avgMetrics.realism).forEach(key => {
      avgMetrics.realism[key] += metrics.realism[key] ? 1 : 0;
    });

    // Accumulate raw stats
    Object.keys(avgMetrics.rawStats).forEach(key => {
      avgMetrics.rawStats[key] += metrics.rawStats[key];
    });

    // Accumulate retirement metrics if present
    if (metrics.retirement && avgMetrics.retirement) {
      Object.keys(avgMetrics.retirement).forEach(key => {
        avgMetrics.retirement[key] += metrics.retirement[key] || 0;
      });
    }
  }

  normalizeMetrics(avgMetrics, count) {
    // Normalize all metrics by dividing by count
    for (const category of Object.keys(avgMetrics)) {
      if (category === 'realism') {
        // Convert realism counts to percentages
        Object.keys(avgMetrics.realism).forEach(key => {
          avgMetrics.realism[key] = avgMetrics.realism[key] / count;
        });
      } else if (category === 'retirement' && avgMetrics.retirement) {
        // Normalize retirement metrics
        Object.keys(avgMetrics.retirement).forEach(key => {
          avgMetrics.retirement[key] = avgMetrics.retirement[key] / count;
        });
        // Handle null averageRetirementTime properly
        if (avgMetrics.retirement.averageRetirementTime === 0) {
          avgMetrics.retirement.averageRetirementTime = null;
        }
      } else if (category !== 'retirement') {
        Object.keys(avgMetrics[category]).forEach(key => {
          avgMetrics[category][key] = avgMetrics[category][key] / count;
        });
      }
    }
  }

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

    return results[0];
  }

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
}