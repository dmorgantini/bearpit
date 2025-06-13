import { QueueManager } from '../queue-manager.js';
import { Fighter } from '../fighter.js';

describe('QueueManager', () => {
  let fighters;
  let queueManager;

  beforeEach(() => {
    // Create test fighters
    fighters = [
      new Fighter('Fighter1', 100, 10),
      new Fighter('Fighter2', 100, 10),
      new Fighter('Fighter3', 100, 10),
      new Fighter('Fighter4', 100, 10)
    ];
  });

  describe('Initialization', () => {
    test('should initialize with shared queue by default', () => {
      queueManager = new QueueManager(fighters, 2);
      expect(queueManager.useShortestQueue).toBe(false);
      expect(queueManager.sharedQueue).toBeDefined();
      expect(queueManager.queues).toBeNull();
    });

    test('should initialize with shortest queue when specified', () => {
      queueManager = new QueueManager(fighters, 2, true);
      expect(queueManager.useShortestQueue).toBe(true);
      expect(queueManager.queues).toBeDefined();
      expect(queueManager.queues.length).toBe(2);
    });

    test('should distribute fighters evenly across queues in shortest queue mode', () => {
      queueManager = new QueueManager(fighters, 2, true);
      expect(queueManager.queues[0].length).toBe(2);
      expect(queueManager.queues[1].length).toBe(2);
    });
  });

  describe('Fighter Management', () => {
    beforeEach(() => {
      queueManager = new QueueManager(fighters, 2);
    });

    test('should add fighter to queue', () => {
      const fighter = new Fighter('NewFighter', 100, 10);
      queueManager.addFighter(fighter);
      expect(queueManager.sharedQueue).toContain(fighter);
      expect(fighter.isInQueue).toBe(true);
    });

    test('should get next available fighter', () => {
      const fighter = queueManager.getNextFighter(0, 0);
      expect(fighter).toBeDefined();
      expect(fighter.isInQueue).toBe(false);
      expect(queueManager.sharedQueue).not.toContain(fighter);
    });

    test('should not get fighter if none are available', () => {
      fighters.forEach(fighter => fighter.setRestPeriod(0, 1));
      const fighter = queueManager.getNextFighter(0, 0);
      expect(fighter).toBeNull();
    });
  });

  describe('Champion Management', () => {
    beforeEach(() => {
      queueManager = new QueueManager(fighters, 2);
    });

    test('should handle first fight correctly', () => {
      const result = queueManager.getFightersForFight(0, 0);
      expect(result).toBeDefined();
      expect(result.fighter1).toBeDefined();
      expect(result.fighter2).toBeDefined();
    });

    test('should handle champion defense correctly', () => {
      const champion = fighters[0];
      champion.isChampion = true;
      const result = queueManager.getFightersForFight(0, 0, champion);
      expect(result).toBeDefined();
      expect(result.fighter1).toBe(champion);
      expect(result.fighter2).toBeDefined();
    });

    test('should handle post-fight outcome correctly', () => {
      const fighter1 = fighters[0];
      const fighter2 = fighters[1];
      const winner = fighter1;
      const loser = fighter2;

      const newChampion = queueManager.handlePostFightFighters(
        'win',
        fighter1,
        fighter2,
        winner,
        loser,
        0,
        0,
        0.5
      );

      expect(newChampion).toBe(winner);
      expect(winner.isChampion).toBe(true);
      expect(loser.isInQueue).toBe(true);
    });
  });

  describe('Queue Status', () => {
    beforeEach(() => {
      queueManager = new QueueManager(fighters, 2);
    });

    test('should report correct queue status', () => {
      const status = queueManager.getQueueStatus(0);
      expect(status).toBeDefined();
      expect(status[0].total).toBe(4);
      expect(status[0].available).toBe(4);
      expect(status[0].resting).toBe(0);
    });

    test('should report correct queue status with resting fighters', () => {
      fighters[0].setRestPeriod(0, 1);
      const status = queueManager.getQueueStatus(0);
      expect(status[0].resting).toBe(1);
      expect(status[0].available).toBe(3);
    });
  });
});
