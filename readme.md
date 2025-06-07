# Boffer Foam Sports Tournament Simulator

A sophisticated JavaScript simulation system for bear pit style tournaments commonly used in boffer foam sports. This simulator models realistic combat scenarios with skill-based fighting, fatigue systems, and multiple tournament formats.

## 🎯 Tournament Format

- **Bear Pit Style**: Continuous fighting with champions defending their position
- **Multiple Pits**: Run multiple simultaneous bear pits for larger events
- **Queue Management**: Flexible fighter queue strategies (shared or shortest queue)
- **Dual Tournament Modes**: Traditional longest-streak or retirement race formats
- **Realistic Combat**: Skill-based outcomes with fatigue and simulation mechanics

## ✨ Features

### Core Simulation
- Configurable fighter levels (Warrior 1-10) with skill-based combat
- Fatigue system that reduces win chances with longer streaks
- Simul (simultaneous defeat) mechanics with level-based probability
- Realistic fight durations with configurable variance
- Rest periods between fights for defeated fighters

### Tournament Modes
- **Traditional Mode**: 15-minute rounds, winner determined by longest streak
- **Retirement Race**: First fighters to reach target streak retire and place

### Advanced Analytics
- Comprehensive fairness analysis system
- Fight distribution and competitive balance metrics
- Performance correlation with skill levels
- Tournament configuration optimization tools

## 🚀 Quick Start

### Basic Usage
```
javascript import TournamentSimulator from "./tournament-simulator.js";
const config = { fighters: [ { name: 'Fighter1', level: 5 }, { name: 'Fighter2', level: 7 }, { name: 'Fighter3', level: 3 }, // ... more fighters ], numberOfPits: 2, roundDurationMinutes: 15, skillMultiplier: 3.0, fatigueMultiplier: 0.001 };
const simulator = new TournamentSimulator(config); 
const results = simulator.runRound();
``` 

### Run the Example
```
node index.js
``` 

## ⚙️ Configuration Options

### Basic Tournament Settings
- `fighters`: Array of fighter objects with `name` and `level` properties
- `numberOfPits`: Number of simultaneous bear pits (default: 1)
- `roundDurationMinutes`: Tournament duration in minutes (default: 15)
- `useShortestQueue`: Queue strategy - false for shared, true for shortest per pit

### Combat Mechanics
- `skillMultiplier`: Multiplier per level difference (default: 3.0)
- `fatigueMultiplier`: Win chance reduction per streak length (default: 0.001)
- `baseSimulChance`: Base probability of simultaneous defeat (default: 0.15)
- `simulReductionPerLevel`: Simul chance reduction per level difference (default: 0.015)

### Fight Timing
- `averageFightDurationSeconds`: Average fight length (default: 30)
- `fightDurationVariance`: Fight duration variance in seconds (default: 10)
- `restPeriodSeconds`: Minimum rest between fights (default: 30)

### Retirement Mode
- `retirementStreakLength`: Target wins to retire ('auto' for level-based, or integer)
- `maxRetirements`: Maximum fighters who can retire (default: 3)

## 🏆 Tournament Modes

### Traditional Mode
Standard bear pit tournament where fighters compete for the full duration, and the winner is determined by longest streak achieved.
```
javascript const traditionalConfig = { fighters: [...], roundDurationMinutes: 15, // retirementStreakLength not set };
``` 

### Retirement Race Mode
Competitive format where the first fighters to reach a target streak retire and place in order.
```
javascript const retirementConfig = { 
                                      fighters: [...],
                                      retirementStreakLength: 5, // or 'auto' for level-based
                                      maxRetirements: 3,
                                      roundDurationMinutes: 20
                                     };
``` 

## 📊 Analytics & Fairness Analysis

The simulator includes comprehensive analytics tools for tournament fairness analysis:
```
javascript import { FairnessAnalyzer } from "./fairness-analyzer.js";
const analyzer = new FairnessAnalyzer(fighterList, null, baseConfig); 
const results = analyzer.analyzeFairness( [10, 15, 20], // time options [1, 2, 3], // pit options [false], // queue strategies 50 // iterations );
latex_unknown_tag
``` 

### Key Metrics
- **Fight Distribution CV**: Primary fairness metric (lower = more fair)
- **Skill-Win Correlation**: Balance between skill and randomness
- **Time Efficiency**: Tournament resource utilization
- **Competitive Balance**: Analysis of level-based advantages

## 🛠️ Project Structure
```
bearpit/ 
    ├── tournament-simulator.js # Main tournament simulation engine 
    ├── bear-pit.js # Individual bear pit logic 
    ├── fighter.js # Fighter class with stats tracking 
    ├── queue-manager.js # Fighter queue management 
    ├── fairness-analyzer.js # Tournament fairness analysis 
    ├── distributions.js # Fighter level distributions 
    ├── fairness_analysis_runner.js # Batch analysis tools 
    ├── index.js # Example usage 
    └── package.json # Project configuration
``` 

## 📈 Example Output
```
=== TOURNAMENT ROUND STARTING === 
Fighters: 11 
Pits: 2 
Round Duration: 10 minutes 
Queue Strategy: Single shared queue 
Skill Multiplier: 3x per level 
Fatigue Multiplier: 0.001 per streak 
🏆 Retirement Streak: First 3 fighters to reach 13 wins retire
🏆 TOURNAMENT WINNER: Corsi (Level 8) 
🏁 First to reach 13 wins! 
⏱️ Retirement Time: 7.2 minutes 
⚔️ Fights to Victory: 15
📊 Final Stats: 13W/2L/0S
``` 

## 🎮 Realistic Boffer Mechanics

The simulator models authentic boffer combat including:
- **Skill-based outcomes** with configurable advantages per level
- **Fatigue effects** that increase with longer winning streaks
- **Simul mechanics** where fighters can simultaneously defeat each other
- **Rest periods** between fights for realistic pacing
- **Variable fight durations** based on configurable parameters

## 🤝 Contributing

This is a simulation tool designed for boffer foam sports communities. Contributions welcome for:
- Additional tournament formats
- Enhanced realism in combat modeling
- Performance optimizations
- Extended analytics capabilities

## 📝 License

ISC License

---

*Built for the boffer foam sports community to analyze and optimize tournament formats.*
```
