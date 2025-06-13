import { FairnessCalculator } from '../fairness-calculator.js';

describe('FairnessCalculator', () => {
  describe('calculateFightDistribution', () => {
    it('should calculate fight distribution metrics correctly', () => {
      const fighterStats = [
        { totalFights: 5 },
        { totalFights: 3 },
        { totalFights: 7 }
      ];
      const roundDuration = 10;

      const result = FairnessCalculator.calculateFightDistribution(fighterStats, roundDuration);

      expect(result.avgFightsPerFighter).toBe(5);
      expect(result.fightDistributionCV).toBeGreaterThan(0);
      expect(result.minFights).toBe(3);
      expect(result.maxFights).toBe(7);
      expect(result.fightRange).toBe(4);
      expect(result.avgFightsPerMinute).toBe(0.5);
      expect(result.maxFightsPerMinute).toBe(0.7);
      expect(result.avgRestTimeBetweenFights).toBeDefined();
    });

    it('should handle empty fighter stats', () => {
      const result = FairnessCalculator.calculateFightDistribution([], 10);
      expect(result.avgFightsPerFighter).toBe(0);
      expect(result.fightDistributionCV).toBe(0);
    });
  });

  describe('calculateCompetitiveBalance', () => {
    it('should calculate competitive balance metrics correctly', () => {
      const fighterStats = [
        { name: 'Fighter1', level: 1, totalFights: 5, totalWins: 3, unluckyPercentage: 20, luckyPercentage: 80 },
        { name: 'Fighter2', level: 2, totalFights: 5, totalWins: 4, unluckyPercentage: 60, luckyPercentage: 40 }
      ];
      const tournamentPlacements = { 'Fighter1': 2, 'Fighter2': 1 };

      const result = FairnessCalculator.calculateCompetitiveBalance(fighterStats, tournamentPlacements);

      expect(result.skillWinCorrelation).toBeDefined();
      expect(result.unluckyFighterRate).toBe(0.5); // One fighter with >50% unlucky
      expect(result.luckyFighterRate).toBe(0.5); // One fighter with >50% lucky
    });
  });

  describe('calculateEfficiencyMetrics', () => {
    it('should calculate efficiency metrics correctly', () => {
      const results = {
        config: { numberOfPits: 2 },
        roundDuration: 10,
        totalFights: 20,
        totalSimuls: 5,
        pitResults: [{ duration: 8 }, { duration: 7 }]
      };

      const result = FairnessCalculator.calculateEfficiencyMetrics(results);

      expect(result.timeEfficiency).toBe(0.75); // (8 + 7) / (2 * 10)
      expect(result.fightsPerMinute).toBe(2);
      expect(result.simulRate).toBe(0.25);
    });
  });

  describe('calculateRealismFlags', () => {
    it('should identify unrealistic scenarios', () => {
      const fightDistribution = {
        avgFightsPerMinute: 10.0,
        maxFightsPerMinute: 15.0,
        avgRestTimeBetweenFights: 1.0
      };
      const results = {
        totalFights: 100,
        config: { numberOfPits: 2 },
        roundDuration: 10
      };

      const flags = FairnessCalculator.calculateRealismFlags(fightDistribution, results);

      expect(flags.excessiveFightRate).toBe(true);
      expect(flags.impossibleFightRate).toBe(true);
      expect(flags.insufficientRest).toBe(true);
      expect(flags.unrealisticTotalFights).toBe(true);
    });
  });

  describe('calculateWinnerLegitimacy', () => {
    it('should calculate winner legitimacy metrics', () => {
      const winner = {
        level: 3,
        totalWins: 8,
        totalLosses: 2,
        totalSimuls: 0
      };
      const fighterStats = [
        { level: 1 }, { level: 2 }, { level: 3 }, { level: 4 }, { level: 5 }
      ];

      const result = FairnessCalculator.calculateWinnerLegitimacy(winner, fighterStats);

      expect(result.levelRank).toBe(3);
      expect(result.winRateVsLevel).toBeCloseTo(0.8 / 0.3, 1);
    });

    it('should return null for no winner', () => {
      expect(FairnessCalculator.calculateWinnerLegitimacy(null, [])).toBeNull();
    });
  });

  describe('calculateRetirementMetrics', () => {
    it('should calculate retirement metrics correctly', () => {
      const results = {
        config: { retirementStreakLength: 3, maxRetirements: 2 },
        retiredCount: 1,
        maxRetirements: 2
      };
      const fighterStats = [
        { isRetired: true, retiredAt: 15, retiredAfterFights: 5 },
        { isRetired: false }
      ];

      const result = FairnessCalculator.calculateRetirementMetrics(results, fighterStats);

      expect(result.retiredCount).toBe(1);
      expect(result.maxRetirements).toBe(2);
      expect(result.targetStreak).toBe(3);
      expect(result.averageRetirementTime).toBe(15);
      expect(result.averageRetirementFights).toBe(5);
      expect(result.retirementSuccess).toBe(0.5);
    });

    it('should return null when retirement is not configured', () => {
      const results = { config: {} };
      expect(FairnessCalculator.calculateRetirementMetrics(results, [])).toBeNull();
    });
  });

  describe('calculateCorrelation', () => {
    it('should calculate Pearson correlation correctly', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 5, 4, 5];
      const correlation = FairnessCalculator.calculateCorrelation(x, y);
      expect(correlation).toBeCloseTo(0.8, 1);
    });

    it('should return 0 for empty arrays', () => {
      expect(FairnessCalculator.calculateCorrelation([], [])).toBe(0);
    });
  });

  describe('calculateCompetitiveFairness', () => {
    it('should calculate competitive fairness score correctly', () => {
      const metrics = {
        fightDistribution: { fightDistributionCV: 0.2 },
        competitiveBalance: { skillWinCorrelation: 0.5 }
      };

      const score = FairnessCalculator.calculateCompetitiveFairness(metrics);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should handle missing or invalid metrics', () => {
      const invalidCases = [
        {}, // Empty metrics
        { fightDistribution: {} }, // Missing CV
        { competitiveBalance: {} }, // Missing correlation
        { 
          fightDistribution: { fightDistributionCV: null },
          competitiveBalance: { skillWinCorrelation: undefined }
        }
      ];

      invalidCases.forEach(metrics => {
        const score = FairnessCalculator.calculateCompetitiveFairness(metrics);
        expect(score).not.toBeNaN();
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });

    it('should penalize poor fight distribution', () => {
      const metrics = {
        fightDistribution: { fightDistributionCV: 0.5 },
        competitiveBalance: { skillWinCorrelation: 0.5 }
      };

      const score = FairnessCalculator.calculateCompetitiveFairness(metrics);
      expect(score).toBeLessThan(100);
    });
  });

  describe('calculateOptimizedScore', () => {
    const baseMetrics = {
      fightDistribution: {
        fightDistributionCV: 0.2,
        avgFightsPerFighter: 5,
        fightRange: 2
      },
      competitiveBalance: {
        skillWinCorrelation: 0.5,
        unluckyFighterRate: 0.1,
        luckyFighterRate: 0.1
      },
      efficiency: {
        timeEfficiency: 0.8
      }
    };

    test.each([
      { fightRange: 1, expected: 'highest', minScore: 86 },
      { fightRange: 2, expected: 'high', minScore: 80 },
      { fightRange: 4, expected: 'medium', minScore: 65 },
      { fightRange: 8, expected: 'low', minScore: 35 },
      { fightRange: 16, expected: 'lowest', minScore: 5 }
    ])('should score fight range $fightRange as $expected with score >= $minScore', ({ fightRange, expected, minScore }) => {
      const metrics = {
        ...baseMetrics,
        fightDistribution: { ...baseMetrics.fightDistribution, fightRange }
      };
      const score = FairnessCalculator.calculateOptimizedScore(metrics);
      expect(score).toBeGreaterThanOrEqual(minScore);
    });

    test.each([
      { unluckyRate: 0.1, expected: 'high', minScore: 80 },
      { unluckyRate: 0.2, expected: 'medium', minScore: 65 },
      { unluckyRate: 0.3, expected: 'low', minScore: 35 },
      { unluckyRate: 0.4, expected: 'lowest', minScore: 5 }
    ])('should score unlucky rate $unluckyRate as $expected with score >= $minScore', ({ unluckyRate, expected, minScore }) => {
      const metrics = {
        ...baseMetrics,
        competitiveBalance: { ...baseMetrics.competitiveBalance, unluckyFighterRate: unluckyRate }
      };
      const score = FairnessCalculator.calculateOptimizedScore(metrics);
      expect(score).toBeGreaterThanOrEqual(minScore);
    });

    test.each([
      { luckyRate: 0.1, expected: 'high', minScore: 80 },
      { luckyRate: 0.2, expected: 'medium', minScore: 65 },
      { luckyRate: 0.3, expected: 'low', minScore: 35 },
      { luckyRate: 0.4, expected: 'lowest', minScore: 5 }
    ])('should score lucky rate $luckyRate as $expected with score >= $minScore', ({ luckyRate, expected, minScore }) => {
      const metrics = {
        ...baseMetrics,
        competitiveBalance: { ...baseMetrics.competitiveBalance, luckyFighterRate: luckyRate }
      };
      const score = FairnessCalculator.calculateOptimizedScore(metrics);
      expect(score).toBeGreaterThanOrEqual(minScore);
    });

    test.each([
      { correlation: 0.2, expected: 'low', maxScore: 70 },
      { correlation: 0.3, expected: 'medium-low', maxScore: 80 },
      { correlation: 0.4, expected: 'high', maxScore: 86 },
      { correlation: 0.5, expected: 'highest', maxScore: 88 },
      { correlation: 0.6, expected: 'high', maxScore: 86 },
      { correlation: 0.7, expected: 'medium-low', maxScore: 80 },
      { correlation: 0.8, expected: 'low', maxScore: 70 }
    ])('should score skill correlation $correlation as $expected with score <= $maxScore', ({ correlation, expected, maxScore }) => {
      const metrics = {
        ...baseMetrics,
        competitiveBalance: { ...baseMetrics.competitiveBalance, skillWinCorrelation: correlation }
      };
      const score = FairnessCalculator.calculateOptimizedScore(metrics);
      expect(score).toBeLessThanOrEqual(maxScore);
    });

    test('should combine multiple factors correctly for best case scenario', () => {
      const metrics = {
        fightDistribution: {
          fightDistributionCV: 0,
          avgFightsPerFighter: 1,
          fightRange: 0
        },
        competitiveBalance: {
          skillWinCorrelation: 0.5,
          unluckyFighterRate: 0,  
          luckyFighterRate: 0     
        },
        efficiency: {
          timeEfficiency: 1.0 
        }
      };
      const score = FairnessCalculator.calculateOptimizedScore(metrics);
      expect(score).toBeGreaterThanOrEqual(100);  
    });

    test('should show significant difference between good and bad scenarios', () => {
      const goodMetrics = {
        fightDistribution: {
          fightDistributionCV: 0.1,
          avgFightsPerFighter: 5,
          fightRange: 1
        },
        competitiveBalance: {
          skillWinCorrelation: 0.5,
          unluckyFighterRate: 0.05,
          luckyFighterRate: 0.05
        },
        efficiency: {
          timeEfficiency: 0.9
        }
      };

      const badMetrics = {
        fightDistribution: {
          fightDistributionCV: 0.5,
          avgFightsPerFighter: 5,
          fightRange: 8
        },
        competitiveBalance: {
          skillWinCorrelation: 0.2,
          unluckyFighterRate: 0.3,
          luckyFighterRate: 0.3
        },
        efficiency: {
          timeEfficiency: 0.3
        }
      };

      const goodScore = FairnessCalculator.calculateOptimizedScore(goodMetrics);
      const badScore = FairnessCalculator.calculateOptimizedScore(badMetrics);
      
      expect(goodScore).toBeGreaterThanOrEqual(88);
      expect(badScore).toBeLessThanOrEqual(30);
      expect(goodScore - badScore).toBeGreaterThanOrEqual(60); // Should show significant difference
    });
  });
}); 