# Boffer Foam Sports Tournament Simulator

A JavaScript simulation for bear pit style tournaments commonly used in boffer foam sports.

## Tournament Format

- **Single Round**: All fighters participate in one 15-minute round
- **Multiple Pits**: Simultaneous bear pits running concurrently
- **Queue Management**: Fighters can use shared queue or join shortest queue when defeated
- **Winner Determination**: Fighter with longest streak across all pits wins the round

## Features

- Configurable fighter levels (Warrior 1-10)
- Skill-based combat with configurable multipliers
- Fatigue system that reduces win chances with longer streaks
- Simultaneous multiple bear pits
- Two queue strategies: shared queue or shortest queue
- Detailed fight logging and statistics

## Usage

```javascript
const TournamentSimulator = require('./tournament-simulator');

const config = {
  fighters: [
    { name: 'Fighter1', level: 5 },
    { name: 'Fighter2', level: 7 },
    // ... more fighters
  ],
  numberOfPits: 3,
  roundDurationMinutes: 15,
  skillMultiplier: 2.0,
  fatigueMultiplier: 0.05,
  useShortestQueue: false // false = shared queue, true = shortest queue
};

const simulator = new TournamentSimulator(config);
const results = simulator.runRound();
```