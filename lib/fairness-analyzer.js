import TournamentSimulator from "./tournament-simulator.js";
import { generateFightersFromDistribution } from "../utils/helpers.js";
import { distributions } from "./distributions.js";
import { FairnessCalculator } from "./fairness-calculator.js";
import { MetricsHelper } from "./metrics-helper.js";
import { tournamentLogger } from "./tournament-simulator.js";

export class FairnessAnalyzer {
  constructor(fighterCountOrFighters, levelDistribution = 'Flat', baseConfig = {}) {
    // Support both direct fighter list or generated fighters
    if (Array.isArray(fighterCountOrFighters)) {
      this.baseFighters = fighterCountOrFighters;
    } else {
      // Use pyramid distribution as default if none provided
      const defaultDistribution = distributions.find(d => d.name === levelDistribution).dist;
      this.baseFighters = generateFightersFromDistribution(fighterCountOrFighters, defaultDistribution);
    }

    this.baseConfig = baseConfig;
    this.logger = tournamentLogger;
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

  runConfigurationIterations(time, pits, iterations) {
    const configResults = [];
    for (let i = 0; i < iterations; i++) {
      const config = {
        ...this.baseConfig,
        fighters: this.baseFighters,
        roundDurationMinutes: time,
        numberOfPits: pits,
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

  analyzeFairness(timeOptions = [10, 15, 20, 25], pitOptions = null, iterations = 10) {
    if (!pitOptions) {
      const fighterCount = this.baseFighters.length;
      pitOptions = [];
      for (let pits = 1; pits <= Math.min(fighterCount / 2, 6); pits++) {
        pitOptions.push(pits);
      }
    }

    const results = [];
    const isRetirementMode = this.baseConfig.retirementStreakLength !== undefined && this.baseConfig.retirementStreakLength !== null;

    this.logger.log(`Analyzing ${isRetirementMode ? 'RETIREMENT MODE' : 'TRADITIONAL'} fairness for ${this.baseFighters.length} fighters across ${timeOptions.length} time options, ${pitOptions.length} pit options with ${iterations} iterations each...`);
    this.logger.log(`Level Distribution: ${this.getLevelDistribution()}`);
    if (isRetirementMode) {
      this.logger.log(`Retirement Target: ${this.baseConfig.retirementStreakLength} wins (max ${this.baseConfig.maxRetirements} winners)`);
    }
    this.logger.log(`Optimization Priority: 1) Fight Distribution CV (lower=better), 2) Total Fights, 3) Fights per Fighter`);

    let configIndex = 0;
    const totalConfigs = timeOptions.length * pitOptions.length;

    for (const time of timeOptions) {
      for (const pits of pitOptions) {
        configIndex++;
        this.logger.log(`\nTesting Configuration ${configIndex}/${totalConfigs}: ${time} minutes, ${pits} pit(s)`);

        const configResults = this.runConfigurationIterations(time, pits, iterations);
        const avgMetrics = MetricsHelper.averageMetrics(configResults);
        const avgCompetitiveFairness = configResults.reduce((sum, r) => sum + r.competitiveFairness, 0) / iterations;
        const avgOptimizedScore = configResults.reduce((sum, r) => sum + r.optimizedScore, 0) / iterations;

        results.push({
          configuration: { time, pits, ...this.baseConfig },
          averageMetrics: avgMetrics,
          competitiveFairnessScore: avgCompetitiveFairness,
          optimizedScore: avgOptimizedScore,
          allRuns: configResults
        });

        this.logConfigurationResults(avgMetrics, avgOptimizedScore, isRetirementMode);
      }
    }

    return results.sort((a, b) => b.optimizedScore - a.optimizedScore);
  }

  logConfigurationResults(avgMetrics, avgOptimizedScore, isRetirementMode) {
    this.logger.log(`  Optimized Score: ${avgOptimizedScore.toFixed(1)}`);
    this.logger.log(`  Fight Distribution CV: ${avgMetrics.fightDistribution.fightDistributionCV.toFixed(3)} (PRIMARY METRIC)`);
    this.logger.log(`  Avg Fights/Fighter: ${avgMetrics.fightDistribution.avgFightsPerFighter.toFixed(1)}`);
    this.logger.log(`  Total Fights: ${avgMetrics.rawStats.totalFights.toFixed(1)}`);
    this.logger.log(`  Fight Range: ${avgMetrics.fightDistribution.minFights.toFixed(0)}-${avgMetrics.fightDistribution.maxFights.toFixed(0)}`);

    if (avgMetrics.retirement) {
      this.logger.log(`  Avg Retirements: ${avgMetrics.retirement.retiredCount.toFixed(1)}/${avgMetrics.retirement.maxRetirements}`);
      if (avgMetrics.retirement.averageRetirementTime) {
        this.logger.log(`  Avg Retirement Time: ${avgMetrics.retirement.averageRetirementTime.toFixed(1)} minutes`);
      }
    }

    const realismIssues = Object.entries(avgMetrics.realism).filter(([key, value]) => value > 0.5);
    if (realismIssues.length > 0) {
      this.logger.log(`  📊 REALISM INFO: ${realismIssues.map(([key]) => key).join(', ')}`);
    }
  }

  generateOptimizedReport(results, topN = 5) {
    const isRetirementMode = results.length > 0 && results[0].averageMetrics.retirement !== null;

    this.logger.log('\n' + '='.repeat(80));
    this.logger.log(`TOP ${topN} CONFIGURATIONS FOR ${isRetirementMode ? 'RETIREMENT MODE' : 'TRADITIONAL'} FAIRNESS + FIGHT COUNT`);
    this.logger.log('='.repeat(80));

    for (let i = 0; i < Math.min(topN, results.length); i++) {
      const result = results[i];
      const config = result.configuration;
      const metrics = result.averageMetrics;

      this.logger.log(`\n${i + 1}. ${config.time}min, ${config.pits} pit(s), ${config.useShortestQueue ? 'shortest' : 'shared'} queue`);
      this.logger.log(`   Optimized Score: ${result.optimizedScore.toFixed(1)}`);
      this.logger.log(`   Fight Distribution CV: ${metrics.fightDistribution.fightDistributionCV.toFixed(3)}`);
      this.logger.log(`   Skill-Win Correlation: ${metrics.competitiveBalance.skillWinCorrelation.toFixed(3)} (ideal ~0.4)`);
      this.logger.log(`   Total Fights: ${metrics.rawStats.totalFights.toFixed(1)}`);
      this.logger.log(`   Fights per Fighter: ${metrics.fightDistribution.avgFightsPerFighter.toFixed(1)}`);
      this.logger.log(`   Fight Range: ${metrics.fightDistribution.minFights.toFixed(0)}-${metrics.fightDistribution.maxFights.toFixed(0)} fights`);
      this.logger.log(`   Unlucky Fighter Rate: ${(metrics.competitiveBalance.unluckyFighterRate * 100).toFixed(1)}%`);

      if (metrics.retirement) {
        this.logger.log(`   Retirement Success: ${(metrics.retirement.retirementSuccess * 100).toFixed(1)}% (${metrics.retirement.retiredCount.toFixed(1)}/${metrics.retirement.maxRetirements})`);
        if (metrics.retirement.averageRetirementTime) {
          this.logger.log(`   Avg Retirement Time: ${metrics.retirement.averageRetirementTime.toFixed(1)} minutes`);
        }
      }
    }

    this.logger.log('\n' + '='.repeat(80));
    this.logger.log('OPTIMIZATION NOTES:');
    this.logger.log('- Fight Distribution CV: THE KEY METRIC - lower values = more even fight distribution');
    this.logger.log('  * 0.00-0.15: Excellent fairness');
    this.logger.log('  * 0.15-0.30: Good fairness');
    this.logger.log('  * 0.30-0.50: Moderate fairness');
    this.logger.log('  * 0.50+: Poor fairness');
    this.logger.log('- Fight Range: Difference between fighter with most/fewest fights');
    this.logger.log('- Skill-Win Correlation: ~0.4 is ideal (skill matters but not deterministic)');
    if (isRetirementMode) {
      this.logger.log('- Retirement Success: Percentage of retirement slots filled by end of tournament');
      this.logger.log('- Retirement Time: Average time for fighters to reach target streak');
    }
    this.logger.log('='.repeat(80));

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