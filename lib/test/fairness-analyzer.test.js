import { FairnessAnalyzer } from '../fairness-analyzer.js';
import { generateFightersFromDistribution } from '../../utils/helpers.js';
import { distributions } from '../distributions.js';

describe('FairnessAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    // Create a small test set of fighters using the bell curve distribution
    const testFighters = generateFightersFromDistribution(10, distributions.find(d => d.name === 'Bell Curve').dist);
    analyzer = new FairnessAnalyzer(testFighters);
  });

  describe('constructor', () => {
    it('should accept an array of fighters', () => {
      const fighters = generateFightersFromDistribution(5, distributions.find(d => d.name === 'Newbie Heavy').dist);
      const analyzer = new FairnessAnalyzer(fighters);
      expect(analyzer.baseFighters).toHaveLength(5);
    });

    it('should accept a fighter count and generate fighters with default pyramid distribution', () => {
      const analyzer = new FairnessAnalyzer(5);
      expect(analyzer.baseFighters).toHaveLength(5);
      // Verify the distribution matches pyramid
      const levelCounts = {};
      analyzer.baseFighters.forEach(f => {
        levelCounts[f.level] = (levelCounts[f.level] || 0) + 1;
      });
      expect(levelCounts[1]).toBeGreaterThan(0); // Should have some level 1 fighters
    });

    it('should accept a custom level distribution', () => {
      const customDist = distributions.find(d => d.name === 'Two Tier').dist;
      const analyzer = new FairnessAnalyzer(10, customDist);
      expect(analyzer.baseFighters).toHaveLength(10);
      // Verify the distribution matches two tier
      const levelCounts = {};
      analyzer.baseFighters.forEach(f => {
        levelCounts[f.level] = (levelCounts[f.level] || 0) + 1;
      });
      expect(levelCounts[1]).toBeGreaterThan(0); // Should have beginners
      expect(levelCounts[5]).toBeGreaterThan(0); // Should have veterans
    });
  });

  describe('calculateFairnessMetrics', () => {
    it('should calculate basic fairness metrics', () => {
      const mockResults = {
        fighterStats: [
          { name: 'Fighter1', level: 1, totalFights: 5, totalWins: 3, totalLosses: 2, totalSimuls: 0, unluckyPercentage: 20 },
          { name: 'Fighter2', level: 2, totalFights: 5, totalWins: 4, totalLosses: 1, totalSimuls: 0, unluckyPercentage: 10 }
        ],
        roundDuration: 10,
        totalFights: 10,
        totalSimuls: 0,
        tournamentPlacements: { 'Fighter1': 2, 'Fighter2': 1 },
        overallWinner: { name: 'Fighter2', level: 2, totalWins: 4, totalLosses: 1, totalSimuls: 0 },
        config: { numberOfPits: 1 },
        pitResults: [{ duration: 10 }]
      };

      const metrics = analyzer.calculateFairnessMetrics(mockResults);

      expect(metrics.fightDistribution).toBeDefined();
      expect(metrics.competitiveBalance).toBeDefined();
      expect(metrics.efficiency).toBeDefined();
      expect(metrics.rawStats).toBeDefined();
    });
  });

  describe('analyzeFairness', () => {
    it('should analyze fairness across different configurations', () => {
      const results = analyzer.analyzeFairness([10], [1], [false], 2);
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('configuration');
      expect(results[0]).toHaveProperty('averageMetrics');
      expect(results[0]).toHaveProperty('competitiveFairnessScore');
      expect(results[0]).toHaveProperty('optimizedScore');
    });
  });

  describe('getLevelDistribution', () => {
    it('should return a formatted string of level distribution', () => {
      const fighters = generateFightersFromDistribution(10, distributions.find(d => d.name === 'Flat').dist);
      const analyzer = new FairnessAnalyzer(fighters);
      const distribution = analyzer.getLevelDistribution();
      
      // Should contain level counts
      expect(distribution).toMatch(/L\d+:\d+/);
      // Should be sorted by level
      const levels = distribution.split(', ').map(s => parseInt(s.split(':')[0].substring(1)));
      expect(levels).toEqual([...levels].sort((a, b) => a - b));
    });
  });

  
}); 