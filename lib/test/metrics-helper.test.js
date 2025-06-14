import { MetricsHelper } from '../metrics-helper.js';

describe('MetricsHelper', () => {
  describe('createEmptyMetrics', () => {
    it('should create an empty metrics object with all required fields', () => {
      const metrics = MetricsHelper.createEmptyMetrics();
      
      expect(metrics).toHaveProperty('fightDistribution');
      expect(metrics).toHaveProperty('competitiveBalance');
      expect(metrics).toHaveProperty('efficiency');
      expect(metrics).toHaveProperty('realism');
      expect(metrics).toHaveProperty('rawStats');
      expect(metrics.retirement).toBeNull();

      // Check fight distribution fields
      expect(metrics.fightDistribution).toHaveProperty('avgFightsPerFighter');
      expect(metrics.fightDistribution).toHaveProperty('fightDistributionCV');
      expect(metrics.fightDistribution).toHaveProperty('minFights');
      expect(metrics.fightDistribution).toHaveProperty('maxFights');

      // Check competitive balance fields
      expect(metrics.competitiveBalance).toHaveProperty('skillWinCorrelation');
      expect(metrics.competitiveBalance).toHaveProperty('unluckyFighterRate');

      // Check efficiency fields
      expect(metrics.efficiency).toHaveProperty('timeEfficiency');
      expect(metrics.efficiency).toHaveProperty('fightsPerMinute');
      expect(metrics.efficiency).toHaveProperty('simulRate');

      // Check realism fields
      expect(metrics.realism).toHaveProperty('excessiveFightRate');
      expect(metrics.realism).toHaveProperty('impossibleFightRate');
      expect(metrics.realism).toHaveProperty('insufficientRest');
      expect(metrics.realism).toHaveProperty('unrealisticTotalFights');

      // Check raw stats fields
      expect(metrics.rawStats).toHaveProperty('totalFights');
      expect(metrics.rawStats).toHaveProperty('totalSimuls');
      expect(metrics.rawStats).toHaveProperty('roundDuration');
    });
  });

  describe('accumulateMetrics', () => {
    it('should accumulate metrics from multiple results', () => {
      const avgMetrics = MetricsHelper.createEmptyMetrics();
      const metrics1 = {
        fightDistribution: { avgFightsPerFighter: 5, fightDistributionCV: 0.2 },
        competitiveBalance: { skillWinCorrelation: 0.4, unluckyFighterRate: 0.1 },
        efficiency: { timeEfficiency: 0.8, fightsPerMinute: 2, simulRate: 0.05 },
        realism: { excessiveFightRate: true, impossibleFightRate: false },
        rawStats: { totalFights: 100, totalSimuls: 5, roundDuration: 60 }
      };
      const metrics2 = {
        fightDistribution: { avgFightsPerFighter: 6, fightDistributionCV: 0.3 },
        competitiveBalance: { skillWinCorrelation: 0.5, unluckyFighterRate: 0.2 },
        efficiency: { timeEfficiency: 0.9, fightsPerMinute: 3, simulRate: 0.06 },
        realism: { excessiveFightRate: false, impossibleFightRate: true },
        rawStats: { totalFights: 120, totalSimuls: 6, roundDuration: 60 }
      };

      MetricsHelper.accumulateMetrics(avgMetrics, metrics1);
      MetricsHelper.accumulateMetrics(avgMetrics, metrics2);

      expect(avgMetrics.fightDistribution.avgFightsPerFighter).toBe(11);
      expect(avgMetrics.fightDistribution.fightDistributionCV).toBe(0.5);
      expect(avgMetrics.competitiveBalance.skillWinCorrelation).toBe(0.9);
      expect(avgMetrics.competitiveBalance.unluckyFighterRate).toBeCloseTo(0.3, 1);
      expect(avgMetrics.efficiency.timeEfficiency).toBeCloseTo(1.7, 1);
      expect(avgMetrics.efficiency.fightsPerMinute).toBe(5);
      expect(avgMetrics.efficiency.simulRate).toBe(0.11);
      expect(avgMetrics.realism.excessiveFightRate).toBe(1);
      expect(avgMetrics.realism.impossibleFightRate).toBe(1);
      expect(avgMetrics.rawStats.totalFights).toBe(220);
      expect(avgMetrics.rawStats.totalSimuls).toBe(11);
      expect(avgMetrics.rawStats.roundDuration).toBe(120);
    });

    it('should handle retirement metrics when present', () => {
      const avgMetrics = MetricsHelper.createEmptyMetrics();
      avgMetrics.retirement = {
        retiredCount: 0,
        maxRetirements: 0,
        targetStreak: 0,
        averageRetirementTime: 0,
        averageRetirementFights: 0,
        retirementSuccess: 0
      };

      const metrics = {
        fightDistribution: { avgFightsPerFighter: 5 },
        competitiveBalance: { skillWinCorrelation: 0.4 },
        efficiency: { timeEfficiency: 0.8 },
        realism: { excessiveFightRate: false },
        rawStats: { totalFights: 100 },
        retirement: {
          retiredCount: 2,
          maxRetirements: 3,
          targetStreak: 5,
          averageRetirementTime: 30,
          averageRetirementFights: 10,
          retirementSuccess: 0.5
        }
      };

      MetricsHelper.accumulateMetrics(avgMetrics, metrics);

      expect(avgMetrics.retirement.retiredCount).toBe(2);
      expect(avgMetrics.retirement.maxRetirements).toBe(3);
      expect(avgMetrics.retirement.targetStreak).toBe(5);
      expect(avgMetrics.retirement.averageRetirementTime).toBe(30);
      expect(avgMetrics.retirement.averageRetirementFights).toBe(10);
      expect(avgMetrics.retirement.retirementSuccess).toBe(0.5);
    });
  });

  describe('normalizeMetrics', () => {
    it('should normalize metrics by dividing by count', () => {
      const avgMetrics = {
        fightDistribution: { avgFightsPerFighter: 10, fightDistributionCV: 0.4 },
        competitiveBalance: { skillWinCorrelation: 0.8, unluckyFighterRate: 0.2 },
        efficiency: { timeEfficiency: 1.6, fightsPerMinute: 4 },
        realism: { excessiveFightRate: 2, impossibleFightRate: 1 },
        rawStats: { totalFights: 200, totalSimuls: 10 },
        retirement: {
          retiredCount: 4,
          maxRetirements: 6,
          averageRetirementTime: 60,
          retirementSuccess: 1.0
        }
      };

      MetricsHelper.normalizeMetrics(avgMetrics, 2);

      expect(avgMetrics.fightDistribution.avgFightsPerFighter).toBe(5);
      expect(avgMetrics.fightDistribution.fightDistributionCV).toBe(0.2);
      expect(avgMetrics.competitiveBalance.skillWinCorrelation).toBe(0.4);
      expect(avgMetrics.competitiveBalance.unluckyFighterRate).toBe(0.1);
      expect(avgMetrics.efficiency.timeEfficiency).toBe(0.8);
      expect(avgMetrics.efficiency.fightsPerMinute).toBe(2);
      expect(avgMetrics.realism.excessiveFightRate).toBe(1);
      expect(avgMetrics.realism.impossibleFightRate).toBe(0.5);
      expect(avgMetrics.rawStats.totalFights).toBe(100);
      expect(avgMetrics.rawStats.totalSimuls).toBe(5);
      expect(avgMetrics.retirement.retiredCount).toBe(2);
      expect(avgMetrics.retirement.maxRetirements).toBe(3);
      expect(avgMetrics.retirement.averageRetirementTime).toBe(30);
      expect(avgMetrics.retirement.retirementSuccess).toBe(0.5);
    });

    it('should handle null averageRetirementTime when zero', () => {
      const avgMetrics = {
        fightDistribution: { avgFightsPerFighter: 10 },
        competitiveBalance: { skillWinCorrelation: 0.8 },
        efficiency: { timeEfficiency: 1.6 },
        realism: { excessiveFightRate: 2 },
        rawStats: { totalFights: 200 },
        retirement: {
          retiredCount: 0,
          maxRetirements: 0,
          averageRetirementTime: 0,
          retirementSuccess: 0
        }
      };

      MetricsHelper.normalizeMetrics(avgMetrics, 2);

      expect(avgMetrics.retirement.averageRetirementTime).toBeNull();
    });
  });

  describe('averageMetrics', () => {
    it('should calculate average metrics from multiple results', () => {
      const configResults = [
        {
          metrics: {
            fightDistribution: { avgFightsPerFighter: 5, fightDistributionCV: 0.2 },
            competitiveBalance: { skillWinCorrelation: 0.4, unluckyFighterRate: 0.1 },
            efficiency: { timeEfficiency: 0.8, fightsPerMinute: 2 },
            realism: { excessiveFightRate: true, impossibleFightRate: false },
            rawStats: { totalFights: 100, totalSimuls: 5, roundDuration: 60 }
          }
        },
        {
          metrics: {
            fightDistribution: { avgFightsPerFighter: 6, fightDistributionCV: 0.3 },
            competitiveBalance: { skillWinCorrelation: 0.5, unluckyFighterRate: 0.2 },
            efficiency: { timeEfficiency: 0.9, fightsPerMinute: 3 },
            realism: { excessiveFightRate: false, impossibleFightRate: true },
            rawStats: { totalFights: 120, totalSimuls: 6, roundDuration: 60 }
          }
        }
      ];

      const avgMetrics = MetricsHelper.averageMetrics(configResults);

      expect(avgMetrics.fightDistribution.avgFightsPerFighter).toBe(5.5);
      expect(avgMetrics.fightDistribution.fightDistributionCV).toBe(0.25);
      expect(avgMetrics.competitiveBalance.skillWinCorrelation).toBe(0.45);
      expect(avgMetrics.competitiveBalance.unluckyFighterRate).toBeCloseTo(0.15, 2);
      expect(avgMetrics.efficiency.timeEfficiency).toBeCloseTo(0.85, 2);
      expect(avgMetrics.efficiency.fightsPerMinute).toBe(2.5);
      expect(avgMetrics.realism.excessiveFightRate).toBe(0.5);
      expect(avgMetrics.realism.impossibleFightRate).toBe(0.5);
      expect(avgMetrics.rawStats.totalFights).toBe(110);
      expect(avgMetrics.rawStats.totalSimuls).toBe(5.5);
      expect(avgMetrics.rawStats.roundDuration).toBe(60);
    });

    it('should handle retirement metrics when present in any result', () => {
      const configResults = [
        {
          metrics: {
            fightDistribution: { avgFightsPerFighter: 5 },
            competitiveBalance: { skillWinCorrelation: 0.4 },
            efficiency: { timeEfficiency: 0.8 },
            realism: { excessiveFightRate: false },
            rawStats: { totalFights: 100 },
            retirement: {
              retiredCount: 2,
              maxRetirements: 3,
              targetStreak: 5,
              averageRetirementTime: 30,
              averageRetirementFights: 10,
              retirementSuccess: 0.5
            }
          }
        },
        {
          metrics: {
            fightDistribution: { avgFightsPerFighter: 6 },
            competitiveBalance: { skillWinCorrelation: 0.5 },
            efficiency: { timeEfficiency: 0.9 },
            realism: { excessiveFightRate: false },
            rawStats: { totalFights: 120 },
            retirement: null
          }
        }
      ];

      const avgMetrics = MetricsHelper.averageMetrics(configResults);

      expect(avgMetrics.retirement).not.toBeNull();
      expect(avgMetrics.retirement.retiredCount).toBe(1);
      expect(avgMetrics.retirement.maxRetirements).toBe(1.5);
      expect(avgMetrics.retirement.targetStreak).toBe(2.5);
      expect(avgMetrics.retirement.averageRetirementTime).toBe(15);
      expect(avgMetrics.retirement.averageRetirementFights).toBe(5);
      expect(avgMetrics.retirement.retirementSuccess).toBe(0.25);
    });
  });
}); 