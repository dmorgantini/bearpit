export class FairnessCalculator {
  static calculateFightDistribution(fighterStats, roundDuration) {
    if (fighterStats.length === 0) {
      return {
        avgFightsPerFighter: 0,
        fightDistributionCV: 0,
        minFights: 0,
        maxFights: 0,
        fightRange: 0,
        avgFightsPerMinute: 0,
        maxFightsPerMinute: 0,
        avgRestTimeBetweenFights: 0
      }
    }
    const fightCounts = fighterStats.map(f => f.totalFights);
    const avgFights = fightCounts.reduce((a, b) => a + b, 0) / fighterStats.length;
    const fightVariance = fightCounts.reduce((sum, count) => sum + Math.pow(count - avgFights, 2), 0) / fighterStats.length;
    const fightStdDev = Math.sqrt(fightVariance);
    const fightDistributionCV = avgFights > 0 ? fightStdDev / avgFights : 0;

    const avgFightsPerMinute = roundDuration > 0 ? avgFights / roundDuration : 0;
    const maxFightsPerMinute = Math.max(...fighterStats.map(f =>
      roundDuration > 0 ? f.totalFights / roundDuration : 0
    ));

    const avgRestTime = roundDuration > 0 && avgFights > 1 ?
      (roundDuration / Math.max(1, avgFights - 1)) : roundDuration;

    return {
      avgFightsPerFighter: avgFights,
      fightDistributionCV,
      minFights: Math.min(...fightCounts),
      maxFights: Math.max(...fightCounts),
      fightRange: Math.max(...fightCounts) - Math.min(...fightCounts),
      avgFightsPerMinute,
      maxFightsPerMinute,
      avgRestTimeBetweenFights: avgRestTime
    };
  }

  static calculateCompetitiveBalance(fighterStats, tournamentPlacements) {
    const skillLevels = fighterStats.map(f => f.level);
    const performanceScores = fighterStats.map(fighter => {
      const winRate = fighter.totalFights > 0 ? fighter.totalWins / fighter.totalFights : 0;
      const placement = tournamentPlacements[fighter.name];
      const placementScore = 1 - ((placement - 1) / (fighterStats.length - 1));
      
      const weightWinRate = fighterStats.length > 10 ? 0.6 : 0.5;
      const weightPlacement = 1 - weightWinRate;
      
      return (winRate * weightWinRate) + (placementScore * weightPlacement);
    });
    
    const skillWinCorrelation = this.calculateCorrelation(skillLevels, performanceScores);
    const unluckyFighters = fighterStats.filter(f => parseFloat(f.unluckyPercentage) > 50).length;
    const luckyFighters = fighterStats.filter(f => parseFloat(f.luckyPercentage) > 50).length;

    return {    
      skillWinCorrelation,
      unluckyFighterRate: unluckyFighters / fighterStats.length,
      luckyFighterRate: luckyFighters / fighterStats.length
    };
  }

  static calculateEfficiencyMetrics(results) {
    const totalPossibleTime = results.config.numberOfPits * results.roundDuration;
    const actualFightTime = results.pitResults.reduce((sum, pit) => sum + pit.duration, 0);
    const timeEfficiency = totalPossibleTime > 0 ? actualFightTime / totalPossibleTime : 0;

    return {
      timeEfficiency,
      fightsPerMinute: results.roundDuration > 0 ? results.totalFights / results.roundDuration : 0,
      simulRate: results.totalFights > 0 ? results.totalSimuls / results.totalFights : 0
    };
  }

  static calculateRealismFlags(fightDistribution, results) {
    return {
      excessiveFightRate: fightDistribution.avgFightsPerMinute > 3.0,
      impossibleFightRate: fightDistribution.maxFightsPerMinute > 5.0,
      insufficientRest: fightDistribution.avgRestTimeBetweenFights < 2.0,
      unrealisticTotalFights: results.totalFights > (results.config.numberOfPits * results.roundDuration * 3)
    };
  }

  static calculateWinnerLegitimacy(winner, fighterStats) {
    if (!winner) return null;

    const skillLevels = fighterStats.map(f => f.level);
    return {
      levelRank: this.getRankByLevel(winner.level, skillLevels),
      winRateVsLevel: winner.totalWins > 0 ? 
        (winner.totalWins / (winner.totalWins + winner.totalLosses + winner.totalSimuls)) / (winner.level / 10) : 0
    };
  }

  static calculateRetirementMetrics(results, fighterStats) {
    if (!results.config.retirementStreakLength) return null;

    const retiredFighters = fighterStats.filter(f => f.isRetired);
    const retirementTimes = retiredFighters.map(f => f.retiredAt).filter(t => t !== null);
    const retirementFights = retiredFighters.map(f => f.retiredAfterFights).filter(f => f !== null);
    
    return {
      retiredCount: results.retiredCount || 0,
      maxRetirements: results.maxRetirements || results.config.maxRetirements,
      targetStreak: results.config.retirementStreakLength,
      averageRetirementTime: retirementTimes.length > 0 ? 
        retirementTimes.reduce((a, b) => a + b, 0) / retirementTimes.length : null,
      averageRetirementFights: retirementFights.length > 0 ? 
        retirementFights.reduce((a, b) => a + b, 0) / retirementFights.length : null,
      retirementSuccess: results.maxRetirements > 0 ? 
        (results.retiredCount || 0) / results.maxRetirements : 0
    };
  }

  static calculateCorrelation(x, y) {
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

  static getRankByLevel(level, allLevels) {
    const sorted = [...allLevels].sort((a, b) => b - a);
    return sorted.indexOf(level) + 1;
  }

  static calculateCompetitiveFairness(metrics) {
    let score = 100;

    const fightDistributionCV = metrics.fightDistribution?.fightDistributionCV || 0;
    const cvPenalty = Math.pow(fightDistributionCV, 2) * 150;
    score -= cvPenalty;

    const skillCorrelation = metrics.competitiveBalance?.skillWinCorrelation || 0;
    let skillPenalty = 0;

    if (skillCorrelation < 0.2) {
      skillPenalty = (0.2 - skillCorrelation) * 125;
    } else if (skillCorrelation > 0.7) {
      skillPenalty = (skillCorrelation - 0.7) * 100;
    } else if (skillCorrelation < 0.4) {
      skillPenalty = (0.4 - skillCorrelation) * 40;
    } else if (skillCorrelation > 0.6) {
      skillPenalty = (skillCorrelation - 0.6) * 40;
    }

    score -= skillPenalty;

    return Math.max(0, Math.min(100, score));
  }

  static calculateFairnessScores(metrics) {
    if (!metrics || Object.keys(metrics).length === 0) return null;

    const {
      fightDistribution = {},
      competitiveBalance = {},
      efficiency = {},
    } = metrics;

    // Calculate base competitive fairness score
    const skillCorrelation = competitiveBalance.skillWinCorrelation || 0;
    const competitiveScore = Math.max(0, 100 * (1 - Math.pow(Math.abs(skillCorrelation - 0.5) * 3, 2)));

    // Calculate fight distribution scores
    const fightRange = fightDistribution.fightRange || 0;
    const fightRangeScore = Math.max(0, 100 * Math.exp(-fightRange * 0.3));
    const fightCV = fightDistribution.fightDistributionCV || 0;
    const cvScore = Math.max(0, 100 * Math.exp(-fightCV * 2));
    const fightDistributionScore = (fightRangeScore + cvScore) / 2;

    // Calculate luck scores
    const unluckyRate = competitiveBalance.unluckyFighterRate || 0;
    const unluckyScore = Math.max(0, 100 * (1 - Math.pow(unluckyRate, 2) * 8));
    const luckyRate = competitiveBalance.luckyFighterRate || 0;
    const luckyScore = Math.max(0, 100 * (1 - Math.pow(luckyRate, 2) * 8));

    // Calculate efficiency score
    const timeEfficiency = efficiency.timeEfficiency || 0;
    const efficiencyScore = timeEfficiency * 100;

    return {
      competitive: competitiveScore,
      fightDistribution: fightDistributionScore,
      unlucky: unluckyScore,
      lucky: luckyScore,
      efficiency: efficiencyScore
    };
  }

  static combineWeightedScores(scores) {
    if (!scores) return 0;

    const weights = {
      competitive: 0.5,    // Competitive fairness is most important
      fightDistribution: 0.25,    // Fight distribution fairness is very important
      unlucky: 0.1,        // Unlucky fighter rate
      lucky: 0.1,          // Lucky fighter rate
      efficiency: 0.05     // Time efficiency
    };

    return Math.round(
      (scores.competitive * weights.competitive) +
      (scores.fightDistribution * weights.fightDistribution) +
      (scores.unlucky * weights.unlucky) +
      (scores.lucky * weights.lucky) +
      (scores.efficiency * weights.efficiency)
    );
  }

  static generateScoreExplanation(metrics, scores) {
    if (!metrics || !scores) return null;

    const explanations = {
      competitive: {
        score: scores.competitive,
        description: `Skill-win correlation of ${metrics.competitiveBalance?.skillWinCorrelation?.toFixed(2) || 0} indicates ${this.getCorrelationDescription(metrics.competitiveBalance?.skillWinCorrelation)}`,
        impact: this.getScoreImpact(scores.competitive)
      },
      fightDistribution: {
        score: scores.fightDistribution,
        description: `Fight range of ${metrics.fightDistribution?.fightRange || 0} and CV of ${metrics.fightDistribution?.fightDistributionCV?.toFixed(2) || 0} indicates ${this.getDistributionDescription(metrics.fightDistribution)}`,
        impact: this.getScoreImpact(scores.fightDistribution)
      },
      unlucky: {
        score: scores.unlucky,
        description: `${(metrics.competitiveBalance?.unluckyFighterRate * 100 || 0).toFixed(1)}% of fighters are unlucky`,
        impact: this.getScoreImpact(scores.unlucky)
      },
      lucky: {
        score: scores.lucky,
        description: `${(metrics.competitiveBalance?.luckyFighterRate * 100 || 0).toFixed(1)}% of fighters are lucky`,
        impact: this.getScoreImpact(scores.lucky)
      },
      efficiency: {
        score: scores.efficiency,
        description: `Time efficiency of ${(metrics.efficiency?.timeEfficiency * 100 || 0).toFixed(1)}%`,
        impact: this.getScoreImpact(scores.efficiency)
      }
    };

    return explanations;
  }

  static getCorrelationDescription(correlation) {
    if (!correlation) return "no correlation between skill and wins";
    if (correlation < 0.2) return "very weak correlation between skill and wins";
    if (correlation < 0.4) return "weak correlation between skill and wins";
    if (correlation < 0.6) return "moderate correlation between skill and wins";
    if (correlation < 0.8) return "strong correlation between skill and wins";
    return "very strong correlation between skill and wins";
  }

  static getDistributionDescription(distribution) {
    if (!distribution) return "no fight distribution data";
    const range = distribution.fightRange || 0;
    const cv = distribution.fightDistributionCV || 0;
    
    if (range === 0 && cv === 0) return "perfect fight distribution";
    if (range <= 1 && cv <= 0.1) return "very fair fight distribution";
    if (range <= 2 && cv <= 0.2) return "fair fight distribution";
    if (range <= 3 && cv <= 0.3) return "moderate fight distribution";
    return "unfair fight distribution";
  }

  static getScoreImpact(score) {
    if (score >= 90) return "excellent";
    if (score >= 80) return "very good";
    if (score >= 70) return "good";
    if (score >= 60) return "fair";
    if (score >= 50) return "poor";
    return "very poor";
  }

  static calculateOptimizedScore(metrics) {
    const scores = this.calculateFairnessScores(metrics);
    if (!scores) return 0;
    return this.combineWeightedScores(scores);
  }
} 