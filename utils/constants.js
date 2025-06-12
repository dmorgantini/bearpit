export const DEFAULT_CONFIG = {
  numberOfPits: 1,
  roundDurationMinutes: 15,
  skillMultiplier: 3.0,
  fatigueMultiplier: 0.001,
  useShortestQueue: false,
  baseSimulChance: 0.20,
  simulReductionPerLevel: 0.015,
  averageFightDurationSeconds: 30,
  fightDurationVariance: 10,
  fightDurationVariancePerLevel: 5,
  restPeriodSeconds: 30,
  retirementStreakLength: null,
  maxRetirements: 3,
};

export const SWORD_AND_BOARD_CONFIG = {
  baseSimulChance: 0.15,
  simulReductionPerLevel: 0.010,
  averageFightDurationSeconds: 30,
  fightDurationVariance: 10,
  fightDurationVariancePerLevel: 1,
}

export const SINGLE_SHORT_CONFIG = {
  baseSimulChance: 0.30,
  simulReductionPerLevel: 0.015,
  averageFightDurationSeconds: 15,
  fightDurationVariance: 8,
  fightDurationVariancePerLevel: 3,
}

export const FLO_CONFIG = {
  baseSimulChance: 0.40,
  simulReductionPerLevel: 0.05,
  averageFightDurationSeconds: 15,
  fightDurationVariance: 8,
  fightDurationVariancePerLevel: 4,
}