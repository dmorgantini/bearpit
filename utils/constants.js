export const DEFAULT_CONFIG = {
  numberOfPits: 1,
  roundDurationMinutes: 15,
  skillMultiplier: 3.0,
  fatigueMultiplier: 0.001,
  useShortestQueue: false,
  baseSimulChance: 0.20,
  simulReductionPerLevel: 0.015,
  meanFightDurationSeconds: 20,
  fightDurationStdDev: 12,
  outlierChance: 0.1,
  minFightDurationSeconds: 5,
  maxFightDurationSeconds: 60,
  restPeriodSeconds: 30,
  retirementStreakLength: null,
  maxRetirements: 3,
  simulationTimeStepSeconds: 1,
};

export const SWORD_AND_BOARD_CONFIG = {
  baseSimulChance: 0.15,
  simulReductionPerLevel: 0.010,
  meanFightDurationSeconds: 20,
  fightDurationStdDev: 12,
  outlierChance: 0.1,
  minFightDurationSeconds: 5,
  maxFightDurationSeconds: 60,
}

export const GREAT_CONFIG = {
  baseSimulChance: 0.20,
  meanFightDurationSeconds: 20,
  fightDurationStdDev: 12,
  outlierChance: 0.1,
  minFightDurationSeconds: 5,
  maxFightDurationSeconds: 60,
}

export const FLO_CONFIG = {
  baseSimulChance: 0.40,
  meanFightDurationSeconds: 20,
  fightDurationStdDev: 12,
  outlierChance: 0.1,
  minFightDurationSeconds: 5,
  maxFightDurationSeconds: 60,
}