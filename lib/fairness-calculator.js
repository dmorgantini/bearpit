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
    const cvPenalty = fightDistributionCV < 0.4 
      ? Math.pow(fightDistributionCV, 1.5) * 50
      : Math.pow(fightDistributionCV, 1.5) * 100;
    score -= cvPenalty;

    const skillCorrelation = metrics.competitiveBalance?.skillWinCorrelation || 0;
    let skillPenalty = 0;

    if (skillCorrelation < 0.3) {
      skillPenalty = (0.3 - skillCorrelation) * 125;
    } else if (skillCorrelation > 0.9) {
      skillPenalty = (skillCorrelation - 0.9) * 100;
    } else if (skillCorrelation < 0.5) {
      skillPenalty = (0.5 - skillCorrelation) * 40;
    } else if (skillCorrelation > 0.8) {
      skillPenalty = (skillCorrelation - 0.8) * 40;
    }

    score -= skillPenalty;

    return Math.max(0, Math.min(100, score));
  }

  static calculateFairnessScores(metrics) {
    if (!metrics || Object.keys(metrics).length === 0) return null;

    const {
      fightDistribution = {},
      competitiveBalance = {},
    } = metrics;

    // Calculate base competitive fairness score targeting 0.65 correlation
    const skillCorrelation = competitiveBalance.skillWinCorrelation || 0;
    const competitiveScore = Math.max(0, 100 * (1 - Math.pow(Math.abs(skillCorrelation - 0.65) * 2.5, 2)));

    // Calculate fight distribution scores with less aggressive penalties
    const fightRange = fightDistribution.fightRange || 0;
    
    // More linear fight range scoring
    let fightRangeScore;
    if (fightRange <= 5) {
      fightRangeScore = 100; // Perfect score for small range
    } else if (fightRange <= 10) {
      fightRangeScore = 90 + (10 - fightRange); // 90-95 for moderate range
    } else if (fightRange <= 15) {
      fightRangeScore = 80 + (15 - fightRange) * 2; // 80-90 for larger range
    } else {
      fightRangeScore = Math.max(0, 80 * Math.exp(-(fightRange - 15) * 0.1)); // Gradual decay for very large range
    }

    const fightCV = fightDistribution.fightDistributionCV || 0;
    
    // More lenient CV score calculation
    let cvScore;
    if (fightCV < 0.3) {
      cvScore = 100; // Perfect score for excellent CV
    } else if (fightCV < 0.4) {
      cvScore = 90 + (0.4 - fightCV) * 100; // 90-100 for very good CV
    } else if (fightCV < 0.5) {
      cvScore = 80 + (0.5 - fightCV) * 100; // 80-90 for good CV
    } else if (fightCV < 0.6) {
      cvScore = 70 + (0.6 - fightCV) * 100; // 70-80 for fair CV
    } else {
      cvScore = Math.max(0, 70 * Math.exp(-(fightCV - 0.6) * 2)); // Exponential decay for poor CV
    }
    
    const fightDistributionScore = (fightRangeScore + cvScore) / 2;

    // Calculate luck scores
    const unluckyRate = competitiveBalance.unluckyFighterRate || 0;
    const unluckyScore = Math.max(0, 100 * (1 - Math.pow(unluckyRate, 2) * 8));
    const luckyRate = competitiveBalance.luckyFighterRate || 0;
    const luckyScore = Math.max(0, 100 * (1 - Math.pow(luckyRate, 2) * 8));

    // Enhanced fight count bonus with higher rewards for 10+ fights and stronger penalties for low counts
    const avgFightsPerFighter = fightDistribution.avgFightsPerFighter || 0;
    let fightsPerFighterBonus;
    if (avgFightsPerFighter >= 15) {
      fightsPerFighterBonus = 100; // Perfect score for 15+ fights
    } else if (avgFightsPerFighter >= 10) {
      fightsPerFighterBonus = 90 + (avgFightsPerFighter - 10); // 90-95 for 10-15 fights
    } else if (avgFightsPerFighter >= 5) {
      fightsPerFighterBonus = 70 + (avgFightsPerFighter - 5) * 4; // 70-90 for 5-10 fights
    } else {
      // More punitive scoring for low fight counts
      fightsPerFighterBonus = Math.max(0, Math.min(40, avgFightsPerFighter * 8)); // Up to 40 for 0-5 fights
    }

    return {
      competitive: competitiveScore,
      fightDistribution: fightDistributionScore,
      unlucky: unluckyScore,
      lucky: luckyScore,
      fightsPerFighter: fightsPerFighterBonus
    };
  }

  static combineWeightedScores(scores) {
    if (!scores) return 0;

    const weights = {
      competitive: 0.4,
      fightDistribution: 0.25,
      unlucky: 0.1,
      lucky: 0.1,
      fightsPerFighter: 0.15
    };

    return Math.round(
      (scores.competitive * weights.competitive) +
      (scores.fightDistribution * weights.fightDistribution) +
      (scores.unlucky * weights.unlucky) +
      (scores.lucky * weights.lucky) +
      (scores.fightsPerFighter * weights.fightsPerFighter)
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
        description: `Fight range of ${metrics.fightDistribution?.fightRange?.toFixed(2) || 0} and CV of ${metrics.fightDistribution?.fightDistributionCV?.toFixed(2) || 0} indicates ${this.getDistributionDescription(metrics.fightDistribution)}`,
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
      fightsPerFighter: {
        score: scores.fightsPerFighter,
        description: `Average of ${metrics.fightDistribution?.avgFightsPerFighter?.toFixed(1) || 0} fights per fighter (${scores.fightsPerFighter >= 95 ? 'excellent' : scores.fightsPerFighter >= 85 ? 'very good' : scores.fightsPerFighter >= 75 ? 'good' : 'fair'} fight count)`,
        impact: this.getScoreImpact(scores.fightsPerFighter)
      }
    };

    return explanations;
  }

  static getCorrelationDescription(correlation) {
    if (!correlation) return 'no skill-win correlation';
    if (correlation < 0.3) return 'very poor skill-win correlation';
    if (correlation < 0.5) return 'poor skill-win correlation';
    if (correlation < 0.8) return 'good skill-win correlation';
    if (correlation < 0.9) return 'very strong skill-win correlation';
    return 'extremely strong skill-win correlation';
  }

  static getDistributionDescription(distribution) {
    if (!distribution) return 'no fight distribution data';
    
    const cv = distribution.fightDistributionCV || 0;
    const range = distribution.fightRange || 0;
    const avgFights = distribution.avgFightsPerFighter || 0;
    
    let cvDescription = cv < 0.4 
      ? 'excellent fight distribution'
      : cv < 0.5
      ? 'good fight distribution'
      : cv < 0.6
      ? 'fair fight distribution'
      : 'poor fight distribution';
    
    let fightCountDescription = avgFights >= 15
      ? 'excellent fight count'
      : avgFights >= 10
      ? 'good fight count'
      : avgFights >= 5
      ? 'fair fight count'
      : 'low fight count';
    
    return `${cvDescription} with ${fightCountDescription} (${avgFights.toFixed(1)} fights per fighter)`;
  }

  static getScoreImpact(score) {
    if (score >= 95) return 'excellent';
    if (score >= 85) return 'very good';
    if (score >= 75) return 'good';
    if (score >= 65) return 'fair';
    if (score >= 55) return 'poor';
    return 'very poor';
  }

  static calculateOptimizedScore(metrics) {
    const scores = this.calculateFairnessScores(metrics);
    if (!scores) return 0;
    return this.combineWeightedScores(scores);
  }
} 