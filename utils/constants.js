
export const DEFAULT_CONFIG = {
  numberOfPits: 1,
  roundDurationMinutes: 15,
  skillMultiplier: 3.0,
  fatigueMultiplier: 0.001,
  useShortestQueue: false,
  baseSimulChance: 0.15,
  simulReductionPerLevel: 0.015,
  averageFightDurationSeconds: 30,
  fightDurationVariance: 10,
  restPeriodSeconds: 30,
  retirementStreakLength: null,
  maxRetirements: 3,
};

export const TOURNAMENT_MODES = {
  TRADITIONAL: 'traditional',
  RETIREMENT_RACE: 'retirement_race',
};

export const FIGHTER_LEVELS = {
  MIN: 1,
  MAX: 10,
};

export const OUTCOMES = {
  WIN: 'win',
  LOSS: 'loss',
  SIMUL: 'simul',
};