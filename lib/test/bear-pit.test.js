import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { BearPit } from '../bear-pit.js';
import { Fighter } from '../fighter.js';
import { QueueManager } from '../queue-manager.js';

describe('BearPit', () => {
  let bearPit;
  let config;
  let queueManager;
  let champion;
  let fighters;
  let originalRandom;

  beforeEach(() => {
    config = {
      skillMultiplier: 2.0,
      fatigueMultiplier: 0.05,
      baseSimulChance: 0.1,
      simulReductionPerLevel: 0.02,
      averageFightDurationSeconds: 30,
      fightDurationVariance: 10,
      roundDurationMinutes: 15,
      restPeriodSeconds: 30,
      retirementStreakLength: null
    };

    bearPit = new BearPit(1, config);

    // Create real fighters
    fighters = [
      new Fighter('Fighter1', 3),
      new Fighter('Fighter2', 3),
      new Fighter('Fighter3', 4)
    ];

    champion = new Fighter('Champion', 5);

    // Create real queue manager
    queueManager = new QueueManager(fighters, 1, false);

    originalRandom = Math.random;
  });

  afterEach(() => {
    Math.random = originalRandom;
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

    test('starts fight when fighters available', () => {
      const result = bearPit.tryRunFight(queueManager);

      expect(result).toBe(true);
      expect(bearPit.currentFightEndTime).toBeGreaterThan(0);
    });

    test('returns false when insufficient fighters available', () => {
      // Create queue with only one fighter
      const singleFighter = [new Fighter('Solo', 3)];
      const soloQueue = new QueueManager(singleFighter, 1, false);

      const result = bearPit.tryRunFight(soloQueue);

      expect(result).toBe(false);
    });
  });

  describe('startNewFight', () => {
    test('uses two fighters from queue when no champion', () => {
      const result = bearPit.startNewFight(queueManager);

      expect(result).toBe(true);
      expect(bearPit.currentFighter1).toBeDefined();
      expect(bearPit.currentFighter2).toBeDefined();
      expect(bearPit.currentFighter1.name).toMatch(/Fighter[123]/);
      expect(bearPit.currentFighter2.name).toMatch(/Fighter[123]/);
      expect(bearPit.currentFighter1).not.toBe(bearPit.currentFighter2);
    });

    test('uses champion and challenger when champion exists', () => {
      bearPit.currentChampion = champion;

      const result = bearPit.startNewFight(queueManager);

      expect(result).toBe(true);
      expect(bearPit.currentFighter1).toBe(champion);
      expect(bearPit.currentFighter2).toBeDefined();
      expect(bearPit.currentFighter2).not.toBe(champion);
    });

    test('sets fight timing correctly', () => {
      bearPit.elapsedTime = 5.0;

      bearPit.startNewFight(queueManager);

      expect(bearPit.currentFightStartTime).toBe(5.0);
      expect(bearPit.currentFightEndTime).toBeGreaterThan(5.0);
      expect(bearPit.currentFightEndTime).toBeLessThan(6.0);
    });
  });

  describe('resolveFight', () => {
    let fighter1;
    let fighter2;
    beforeEach(() => {
      // Set up a fight in progress
      fighter1 = new Fighter('TestF1', 3);
      fighter2 = new Fighter('TestF2', 3);
      bearPit.currentFighter1 = fighter1;
      bearPit.currentFighter2 = fighter2;
      bearPit.currentFightStartTime = 0;
      bearPit.currentFightEndTime = 0.5;
    });

    test('resolves fight and updates statistics', () => {
      Math.random = vi.fn(() => 0.1); // Fighter1 wins

      bearPit.resolveFight(queueManager);

      expect(bearPit.totalFights).toBe(1);
      expect(bearPit.fights).toHaveLength(1);
      expect(bearPit.currentChampion).toBe(fighter1);
    });

    test('handles simul outcome correctly', () => {
      Math.random = vi.fn(() => 0.95); // Simul

      bearPit.resolveFight(queueManager);

      expect(bearPit.totalSimuls).toBe(1);
      expect(bearPit.currentChampion).toBeNull();
    });

    test('handles fighter2 win correctly', () => {
      Math.random = vi.fn(() => 0.7); // Fighter2 wins

      bearPit.resolveFight(queueManager);

      expect(bearPit.currentChampion).toBe(fighter2);
      expect(bearPit.currentChampion.currentStreak).toBe(1);
    });

    test('clears fight state after resolution', () => {
      Math.random = vi.fn(() => 0.1);

      bearPit.resolveFight(queueManager);

      expect(bearPit.currentFightStartTime).toBeNull();
      expect(bearPit.currentFightEndTime).toBeNull();
      expect(bearPit.currentFighter1).toBeNull();
      expect(bearPit.currentFighter2).toBeNull();
    });

    test('updates elapsed time to fight end time', () => {
      bearPit.currentFightEndTime = 3.5;
      bearPit.elapsedTime = 2.0;

      Math.random = vi.fn(() => 0.1);

      bearPit.resolveFight(queueManager);

      expect(bearPit.elapsedTime).toBe(3.5);
    });

    test('records fight details correctly', () => {
      Math.random = vi.fn(() => 0.1); // Fighter1 wins

      bearPit.resolveFight(queueManager);

      const fightRecord = bearPit.fights[0];
      expect(fightRecord.fighter1).toBe('TestF1');
      expect(fightRecord.fighter2).toBe('TestF2');
      expect(fightRecord.outcome).toBe('win');
      expect(fightRecord.winner).toBe('TestF1');
      expect(fightRecord.probabilities).toBeDefined();
      expect(fightRecord.unlucky).toBeDefined();
    });
  });

  describe('retirement handling', () => {
    beforeEach(() => {
      config.retirementStreakLength = 3;

      // Mock tournament simulator
      bearPit.tournamentSimulator = {
        retiredCount: 0,
        maxRetirements: 3,
        retireFighter: vi.fn((fighter, time) => {
          if (bearPit.tournamentSimulator.retiredCount < bearPit.tournamentSimulator.maxRetirements) {
            fighter.retire(time);
            bearPit.tournamentSimulator.retiredCount++;
            return true;
          }
          return false;
        })
      };
    });

    test('handles retirement when streak target reached', () => {
      const fighter1 = new Fighter('Champion', 5);
      const fighter2 = new Fighter('Challenger', 3);
      fighter1.currentStreak = 2; // Will reach 3 after win

      bearPit.currentFighter1 = fighter1;
      bearPit.currentFighter2 = fighter2;
      bearPit.currentFightStartTime = 0;
      bearPit.currentFightEndTime = 0.5;

      Math.random = vi.fn(() => 0.1); // Fighter1 wins

      bearPit.resolveFight(queueManager);

      expect(fighter1.isRetired).toBe(true);
      expect(bearPit.tournamentSimulator.retiredCount).toBe(1);
      expect(bearPit.currentChampion).toBeNull();
    });

    test('does not retire when retirement cap reached', () => {
      bearPit.tournamentSimulator.retiredCount = 3; // At cap

      const fighter1 = new Fighter('Champion', 5);
      const fighter2 = new Fighter('Challenger', 3);
      fighter1.currentStreak = 2;

      bearPit.currentFighter1 = fighter1;
      bearPit.currentFighter2 = fighter2;
      bearPit.currentFightStartTime = 0;
      bearPit.currentFightEndTime = 0.5;

      Math.random = vi.fn(() => 0.1); // Fighter1 wins

      bearPit.resolveFight(queueManager);

      expect(fighter1.isRetired).toBe(false);
      expect(bearPit.tournamentSimulator.retiredCount).toBe(3);
      expect(bearPit.currentChampion).toBe(fighter1);
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
      const champion = new Fighter('Champion', 5);
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

    test('returns null champion when no champion', () => {
      const result = bearPit.getResult();

      expect(result.champion).toBeNull();
    });
  });

  describe('time management', () => {
    test('deactivates pit when round time exceeded', () => {
      bearPit.elapsedTime = 16;

      bearPit.tryRunFight(queueManager);

      expect(bearPit.isActive).toBe(false);
    });

    test('allows fights to start before round end', () => {
      bearPit.elapsedTime = 14.9;

      const result = bearPit.tryRunFight(queueManager);

      expect(result).toBe(true);
      expect(bearPit.currentFightEndTime).toBeGreaterThan(15);
    });
  });
});