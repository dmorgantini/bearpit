export class MetricsHelper {
  static accumulateMetrics(avgMetrics, metrics) {
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

  static normalizeMetrics(avgMetrics, count) {
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

  static createEmptyMetrics() {
    return {
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
  }

  static averageMetrics(configResults) {
    const count = configResults.length;
    const avgMetrics = this.createEmptyMetrics();

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
} 