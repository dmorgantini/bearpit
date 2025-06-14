import TournamentSimulator from '../lib/tournament-simulator.js';
import { FairnessAnalyzer } from '../lib/fairness-analyzer.js';

// Listen for messages from the main thread
self.addEventListener('message', async (e) => {
  const { type, config } = e.data;
  
  try {
    switch (type) {
      case 'runTournament':
        const simulator = new TournamentSimulator(config);
        const result = simulator.runRound();
        self.postMessage({ type: 'tournamentComplete', result });
        break;
        
      case 'runFairnessAnalysis':
        const analyzer = new FairnessAnalyzer(
          config.fighterCount,
          config.distribution,
          config.baseConfig
        );
        const results = analyzer.analyzeFairness(
          config.timeOptions,
          config.pitOptions,
          config.iterations
        );
        self.postMessage({ type: 'analysisComplete', result: results });
        break;
        
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message });
  }
}); 