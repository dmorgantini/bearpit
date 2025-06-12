import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateFightOutcomeProbabilities,
  generateFightDuration,
  determineFightOutcome,
  calculateSkillMultiplier,
} from '../fight-calculations.js';

// Mock Fighter class for testing
class MockFighter {
  constructor(name, level) {
    this.name = name;
    this.level = level;
    this.currentStreak = 0;
    this.totalFights = 0;
  }
}

describe('Fight Calculations', () => {
  let config;
  let originalRandom;

  beforeEach(() => {
    config = {
      skillMultiplier: 2.0,
      fatigueMultiplier: 0.05,
      baseSimulChance: 0.1,
      simulReductionPerLevel: 0.02,
      averageFightDurationSeconds: 30,
      fightDurationVariance: 10,
      fightDurationVariancePerLevel: 0
    };
    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
  });

  describe('calculateFightOutcomeProbabilities', () => {
    test('calculates probabilities for equal level fighters', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);

      const result = calculateFightOutcomeProbabilities(fighter1, fighter2, config);

      expect(result.fighter1Win).toBeCloseTo(0.45, 2); // ~50% minus simul chance
      expect(result.fighter2Win).toBeCloseTo(0.45, 2);
      expect(result.simul).toBeCloseTo(0.1, 2);
      expect(result.fighter1Win + result.fighter2Win + result.simul).toBeCloseTo(1.0, 2);
    });

    test('higher level fighter has advantage', () => {
      const fighter1 = new MockFighter('Strong', 5);
      const fighter2 = new MockFighter('Weak', 2);

      const result = calculateFightOutcomeProbabilities(fighter1, fighter2, config);

      expect(result.fighter1Win).toBeGreaterThan(0.7); // Higher level fighter has higher chance
      expect(result.fighter2Win).toBeLessThan(0.2); // Lower level fighter has lower chance
      expect(result.simul).toBeLessThan(0.1); // Reduced simul chance due to level difference
      expect(result.fighter1Win + result.fighter2Win + result.simul).toBeCloseTo(1.0, 2);
    });

    test('applies fatigue to current champion', () => {
      const champion = new MockFighter('Champion', 5);
      const challenger = new MockFighter('Challenger', 5);
      champion.currentStreak = 3;

      const result = calculateFightOutcomeProbabilities(champion, challenger, config, champion);

      // Champion should have reduced win chance due to fatigue
      const resultNoFatigue = calculateFightOutcomeProbabilities(champion, challenger, config);
      expect(result.fighter1Win).toBeLessThan(resultNoFatigue.fighter1Win);
      expect(result.fighter2Win).toBeGreaterThan(resultNoFatigue.fighter2Win);
    });

    test('probabilities are clamped to valid range', () => {
      const veryWeak = new MockFighter('VeryWeak', 1);
      const veryStrong = new MockFighter('VeryStrong', 10);

      const result = calculateFightOutcomeProbabilities(veryWeak, veryStrong, config);

      expect(result.fighter1Win).toBeGreaterThanOrEqual(0.01);
      expect(result.fighter1Win).toBeLessThanOrEqual(0.99);
      expect(result.fighter2Win).toBeGreaterThanOrEqual(0.01);
      expect(result.fighter2Win).toBeLessThanOrEqual(0.99);
    });

    test('simul probability decreases with level difference', () => {
      const fighter1 = new MockFighter('Fighter1', 5);
      const fighter2Equal = new MockFighter('Fighter2Equal', 5);
      const fighter2Different = new MockFighter('Fighter2Different', 2);

      const equalResult = calculateFightOutcomeProbabilities(fighter1, fighter2Equal, config);
      const differentResult = calculateFightOutcomeProbabilities(fighter1, fighter2Different, config);

      expect(differentResult.simul).toBeLessThan(equalResult.simul);
    });
  });

  describe('generateFightDuration', () => {
    test('generates duration within expected range', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);

      const duration = generateFightDuration(fighter1, fighter2, config);
      
      // Duration should be within configured range
      const minDuration = (config.averageFightDurationSeconds - config.fightDurationVariance) / 60;
      const maxDuration = (config.averageFightDurationSeconds + config.fightDurationVariance) / 60;
      expect(duration).toBeGreaterThanOrEqual(minDuration);
      expect(duration).toBeLessThanOrEqual(maxDuration);
    });

    test('generates different durations on multiple calls', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);

      const durations = Array.from({length: 20}, () =>
        generateFightDuration(fighter1, fighter2, config)
      );

      // Should have some variance
      const uniqueDurations = new Set(durations);
      expect(uniqueDurations.size).toBeGreaterThan(1);
    });

    test('respects minimum duration', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);
      const configWithHighVariance = {
        ...config,
        averageFightDurationSeconds: 15,
        fightDurationVariance: 20 // Variance larger than average
      };

      const duration = generateFightDuration(fighter1, fighter2, configWithHighVariance);
      
      // Should not go below 10 seconds (converted to minutes)
      expect(duration).toBeGreaterThanOrEqual(10 / 60);
    });

    test('adjusts duration based on level difference when configured', () => {
      const configWithLevelVariance = {
        ...config,
        fightDurationVariancePerLevel: 5
      };

      const equalFighters = [new MockFighter('F1', 5), new MockFighter('F2', 5)];
      const differentFighters = [new MockFighter('F1', 5), new MockFighter('F2', 2)];

      // Generate multiple durations to see the effect
      const equalDurations = Array.from({length: 100}, () =>
        generateFightDuration(equalFighters[0], equalFighters[1], configWithLevelVariance)
      );
      const differentDurations = Array.from({length: 100}, () =>
        generateFightDuration(differentFighters[0], differentFighters[1], configWithLevelVariance)
      );

      const avgEqualDuration = equalDurations.reduce((a, b) => a + b, 0) / equalDurations.length;
      const avgDifferentDuration = differentDurations.reduce((a, b) => a + b, 0) / differentDurations.length;

      // Different level fighters should have different average duration
      expect(Math.abs(avgEqualDuration - avgDifferentDuration)).toBeGreaterThan(0.01);
    });
  });

  describe('determineFightOutcome', () => {
    test('determines fighter1 win correctly', () => {
      Math.random = vi.fn(() => 0.1); // Low value for fighter1 win

      const probabilities = {
        fighter1Win: 0.5,
        fighter2Win: 0.4,
        simul: 0.1
      };

      const outcome = determineFightOutcome(probabilities);

      expect(outcome.type).toBe('win');
      expect(outcome.winnerIndex).toBe(1);
    });

    test('determines fighter2 win correctly', () => {
      Math.random = vi.fn(() => 0.7); // Middle value for fighter2 win

      const probabilities = {
        fighter1Win: 0.3,
        fighter2Win: 0.6,
        simul: 0.1
      };

      const outcome = determineFightOutcome(probabilities);

      expect(outcome.type).toBe('win');
      expect(outcome.winnerIndex).toBe(2);
    });

    test('determines simul correctly', () => {
      Math.random = vi.fn(() => 0.95); // High value for simul

      const probabilities = {
        fighter1Win: 0.45,
        fighter2Win: 0.45,
        simul: 0.1
      };

      const outcome = determineFightOutcome(probabilities);

      expect(outcome.type).toBe('simul');
      expect(outcome.winnerIndex).toBeUndefined();
    });

    test('handles edge cases correctly', () => {
      Math.random = vi.fn(() => 0.5); // Exactly at boundary

      const probabilities = {
        fighter1Win: 0.5,
        fighter2Win: 0.4,
        simul: 0.1
      };

      const outcome = determineFightOutcome(probabilities);

      expect(outcome.type).toBe('win');
      expect(outcome.winnerIndex).toBe(2); // Should be fighter2 since 0.5 >= 0.5
    });
  });

  describe('calculateSkillMultiplier', () => {
    test('calculates skill advantage correctly', () => {
      // Fighter with 2 level advantage
      const result = calculateSkillMultiplier(2, 2.0);
      
      // Should favor the higher level fighter significantly
      expect(result).toBeGreaterThan(0.5);
      expect(result).toBeLessThan(1.0);
    });

    test('returns 0.5 for equal fighters', () => {
      const result = calculateSkillMultiplier(0, 2.0);
      expect(result).toBeCloseTo(0.5, 3);
    });

    test('skill disadvantage works correctly', () => {
      const advantage = calculateSkillMultiplier(2, 2.0);
      const disadvantage = calculateSkillMultiplier(-2, 2.0);
      
      expect(advantage).toBeCloseTo(1 - disadvantage, 3);
    });

    test('higher skill multiplier increases advantage', () => {
      const lowMultiplier = calculateSkillMultiplier(2, 1.5);
      const highMultiplier = calculateSkillMultiplier(2, 3.0);
      
      expect(highMultiplier).toBeGreaterThan(lowMultiplier);
    });
  });

  describe('edge cases and integration', () => {
    test('handles extreme level differences', () => {
      const veryWeak = new MockFighter('VeryWeak', 1);
      const veryStrong = new MockFighter('VeryStrong', 10);

      const probabilities = calculateFightOutcomeProbabilities(veryWeak, veryStrong, config);
      
      // Should still produce valid probabilities
      expect(probabilities.fighter1Win + probabilities.fighter2Win + probabilities.simul)
        .toBeCloseTo(1.0, 3);
      expect(probabilities.fighter1Win).toBeGreaterThan(0);
      expect(probabilities.fighter2Win).toBeGreaterThan(0);
    });

    test('handles maximum fatigue correctly', () => {
      const champion = new MockFighter('Champion', 5);
      const challenger = new MockFighter('Challenger', 5);
      champion.currentStreak = 50; // Extreme streak

      const probabilities = calculateFightOutcomeProbabilities(champion, challenger, config, champion);
      
      // Even with extreme fatigue, should maintain minimum probability
      expect(probabilities.fighter1Win).toBeGreaterThanOrEqual(0.01);
      expect(probabilities.fighter1Win + probabilities.fighter2Win + probabilities.simul)
        .toBeCloseTo(1.0, 2);
    });

    test('duration calculation handles all variance scenarios', () => {
      const fighter1 = new MockFighter('Fighter1', 1);
      const fighter2 = new MockFighter('Fighter2', 10);
      
      const configWithVariance = {
        ...config,
        fightDurationVariancePerLevel: 2
      };

      // Should not crash with extreme level differences
      const duration = generateFightDuration(fighter1, fighter2, configWithVariance);
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(10); // Reasonable upper bound
    });
  });
});