import {BearPit} from '../bear-pit.js';
import {vi} from 'vitest';

// Mock Fighter class
class MockFighter {
  constructor(name, level) {
    this.name = name;
    this.level = level;
    this.currentStreak = 0;
    this.totalFights = 0;
    this.isChampion = false;
    this.currentPitId = null;
    this.isRetired = false;
  }

  recordFight() {
    this.totalFights++;
  }

  recordFightTime() {
  }

  win() {
    this.currentStreak++;
  }

  lose() {
    this.currentStreak = 0;
  }

  simul() {
    this.currentStreak = 0;
  }
}

// Mock QueueManager
class MockQueueManager {
  constructor() {
    this.fighters = [];
  }

  getNextFighter() {
    return this.fighters.shift() || null;
  }

  addFighter(fighter) {
    this.fighters.push(fighter);
  }
}

describe('BearPit', () => {
  let bearPit;
  let config;
  let queueManager;

  beforeEach(() => {
    config = {
      skillMultiplier: 2.0,
      fatigueMultiplier: 0.05,
      baseSimulChance: 0.1,
      simulReductionPerLevel: 0.02,
      averageFightDurationSeconds: 30,
      fightDurationVariance: 10,
      roundDurationMinutes: 15,
      restPeriodSeconds: 30
    };
    bearPit = new BearPit(1, config);
    queueManager = new MockQueueManager();
  });

  describe('constructor', () => {
    test('initializes with correct default values', () => {
      expect(bearPit.pitId).toBe(1);
      expect(bearPit.config).toBe(config);
      expect(bearPit.currentChampion).toBeNull();
      expect(bearPit.fights).toEqual([]);
      expect(bearPit.totalFights).toBe(0);
      expect(bearPit.elapsedTime).toBe(0);
      expect(bearPit.isActive).toBe(true);
    });
  });

  describe('calculateFightOutcomeProbabilities', () => {
    test('calculates probabilities for equal level fighters', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);

      const result = bearPit.calculateFightOutcomeProbabilities(fighter1, fighter2);

      expect(result.fighter1Win).toBeCloseTo(0.45, 2); // ~50% minus simul chance
      expect(result.fighter2Win).toBeCloseTo(0.45, 2);
      expect(result.simul).toBeCloseTo(0.1, 2);
      expect(result.fighter1Win + result.fighter2Win + result.simul).toBeCloseTo(1.0, 2);
    });

    test('higher level fighter has advantage', () => {
      const fighter1 = new MockFighter('Strong', 5);
      const fighter2 = new MockFighter('Weak', 2);

      const result = bearPit.calculateFightOutcomeProbabilities(fighter1, fighter2);

      expect(result.fighter1Win).toBeCloseTo(0.85, 1); // Higher level fighter has higher chance
      expect(result.fighter2Win).toBeCloseTo(0.10, 1); // Lower level fighter has lower chance
      expect(result.simul).toBeCloseTo(0.05, 1); // Reduced simul chance due to level difference
      expect(result.fighter1Win + result.fighter2Win + result.simul).toBeCloseTo(1.0, 2);
    });

    test('applies fatigue to current champion', () => {
      const champion = new MockFighter('Champion', 5);
      const challenger = new MockFighter('Challenger', 5);
      champion.currentStreak = 3;
      bearPit.currentChampion = champion;

      const result = bearPit.calculateFightOutcomeProbabilities(champion, challenger);

      // Champion (fighter1) has fatigue penalty of 0.15 (3 streak * 0.05 multiplier)
      // Base probability 0.45 - 0.15 fatigue = 0.30
      expect(result.fighter1Win).toBeCloseTo(0.315, 2);
      expect(result.fighter2Win).toBeCloseTo(0.59, 2);
      expect(result.simul).toBeCloseTo(0.10, 2);
      expect(result.fighter1Win + result.fighter2Win + result.simul).toBeCloseTo(1.0, 2);

    });
  });

  describe('generateFightDuration', () => {
    test('generates duration within expected range', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);

      const duration = bearPit.generateFightDuration(fighter1, fighter2);
      
      // Duration should be within configured range
      const minDuration = (config.averageFightDurationSeconds - config.fightDurationVariance) / 60;
      const maxDuration = (config.averageFightDurationSeconds + config.fightDurationVariance) / 60;
      expect(duration).toBeGreaterThanOrEqual(minDuration);
      expect(duration).toBeLessThanOrEqual(maxDuration);
      // Verify it's within 2 standard deviations of mean
      expect(Math.abs(duration - config.averageFightDurationSeconds / 60))
        .toBeLessThanOrEqual(2 * config.fightDurationVariance / 60);
    });

    test('generates different durations on multiple calls', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);

      const durations = Array.from({length: 10}, () =>
        bearPit.generateFightDuration(fighter1, fighter2)
      );

      // Should have some variance
      const uniqueDurations = new Set(durations);
      expect(uniqueDurations.size).toBeGreaterThan(1);
    });
  });

  describe('tryRunFight', () => {
    test('returns false when pit is inactive', () => {
      bearPit.isActive = false;

      const result = bearPit.tryRunFight(queueManager);

      expect(result).toBe(false);
    });

    test('returns false when round time exceeded', () => {
      bearPit.elapsedTime = 20; // Exceeds 15 minute round

      const result = bearPit.tryRunFight(queueManager);

      expect(result).toBe(false);
      expect(bearPit.isActive).toBe(false);
    });

    test('starts fight when fighters available and no current fight', () => {
      queueManager.fighters = [
        new MockFighter('Fighter1', 3),
        new MockFighter('Fighter2', 3)
      ];

      const result = bearPit.tryRunFight(queueManager);

      expect(result).toBe(true);
      expect(bearPit.currentFightEndTime).toBeGreaterThan(0);
    });

    test('returns false when insufficient fighters available', () => {
      queueManager.fighters = [new MockFighter('Fighter1', 3)]; // Only one fighter

      const result = bearPit.tryRunFight(queueManager);

      expect(result).toBe(false);
    });
  });

  describe('startNewFight', () => {
    test('uses two fighters from queue when no champion', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);
      queueManager.fighters = [fighter1, fighter2];

      const result = bearPit.startNewFight(queueManager);

      expect(result).toBe(true);
      expect(bearPit.currentFighter1).toBe(fighter1);
      expect(bearPit.currentFighter2).toBe(fighter2);
      expect(queueManager.fighters).toHaveLength(0);
    });

    test('uses champion and challenger when champion exists', () => {
      const champion = new MockFighter('Champion', 5);
      const challenger = new MockFighter('Challenger', 3);
      bearPit.currentChampion = champion;
      queueManager.fighters = [challenger];

      const result = bearPit.startNewFight(queueManager);

      expect(result).toBe(true);
      expect(bearPit.currentFighter1).toBe(champion);
      expect(bearPit.currentFighter2).toBe(challenger);
    });
  });

  describe('getResult', () => {
    test('returns correct pit result structure', () => {
      const result = bearPit.getResult();

      expect(result).toHaveProperty('pitId', 1);
      expect(result).toHaveProperty('champion');
      expect(result).toHaveProperty('totalFights', 0);
      expect(result).toHaveProperty('totalSimuls', 0);
      expect(result).toHaveProperty('duration', 0);
      expect(result).toHaveProperty('fights');
      expect(result).toHaveProperty('isActive', true);
    });

    test('includes champion info when champion exists', () => {
      const champion = new MockFighter('Champion', 5);
      champion.currentStreak = 3;
      champion.longestStreak = 5;
      bearPit.currentChampion = champion;

      const result = bearPit.getResult();

      expect(result.champion).toMatchObject({
        name: 'Champion',
        level: 5,
        currentStreak: 3,
        longestStreak: 5
      });
    });
  });

  describe('resolveFight', () => {
    test('resolves fight and updates statistics', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);
      bearPit.currentFighter1 = fighter1;
      bearPit.currentFighter2 = fighter2;
      bearPit.currentFightStartTime = 0;
      bearPit.currentFightEndTime = 0.5;

      // Mock Math.random to ensure fighter1 wins
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.1); // Low value ensures fighter1 win

      bearPit.resolveFight(queueManager);

      expect(bearPit.totalFights).toBe(1);
      expect(bearPit.fights).toHaveLength(1);
      expect(bearPit.currentChampion).toBe(fighter1);
      expect(queueManager.fighters).toContain(fighter2);

      Math.random = originalRandom;
    });


    test('handles simul outcome correctly', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);
      bearPit.currentFighter1 = fighter1;
      const originalStreak1 = fighter1.currentStreak;
      const originalStreak2 = fighter2.currentStreak;
      bearPit.currentFighter2 = fighter2;
      bearPit.currentFightStartTime = 0;
      bearPit.currentFightEndTime = 0.5;

      // Mock Math.random to ensure simul
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.95); // High value for simul

      bearPit.resolveFight(queueManager);

      expect(bearPit.totalSimuls).toBe(1);
      expect(fighter1.currentStreak).toBe(originalStreak1);
      expect(fighter2.currentStreak).toBe(originalStreak2);
      expect(queueManager.fighters).toContain(fighter1);
      expect(queueManager.fighters).toContain(fighter2);

      Math.random = originalRandom;
    });

    test('handles fighter2 win correctly', () => {
      const fighter1 = new MockFighter('Fighter1', 3);
      const fighter2 = new MockFighter('Fighter2', 3);
      bearPit.currentFighter1 = fighter1;
      bearPit.currentFighter2 = fighter2;
      bearPit.currentFightStartTime = 0;
      bearPit.currentFightEndTime = 0.5;

      // Mock Math.random to ensure fighter2 wins
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.7); // Middle value for fighter2 win

      bearPit.resolveFight(queueManager);

      expect(bearPit.currentChampion).toBe(fighter2);
      expect(fighter2.currentStreak).toBe(1);
      expect(fighter1.currentStreak).toBe(0);
      expect(queueManager.fighters).toContain(fighter1);

      Math.random = originalRandom;
    });

    test('extends champion streak on win', () => {
      const champion = new MockFighter('Champion', 5);
      champion.currentStreak = 3;
      const challenger = new MockFighter('Challenger', 3);
      bearPit.currentChampion = champion;
      bearPit.currentFighter1 = champion;
      bearPit.currentFighter2 = challenger;
      bearPit.currentFightStartTime = 0;
      bearPit.currentFightEndTime = 0.5;

      // Mock Math.random to ensure champion wins
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.1);

      bearPit.resolveFight(queueManager);

      expect(champion.currentStreak).toBe(4);
      expect(bearPit.currentChampion).toBe(champion);
      expect(queueManager.fighters).toContain(challenger);

      Math.random = originalRandom;
    });
  });
});