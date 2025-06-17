'use client';

import { useMemo } from 'react';

function useConfigValidation(config, fighters) {
  return useMemo(() => {
    const errors = [];

    // Fighter validation
    if (fighters.length < 4) {
      errors.push('Need at least 4 fighters');
    }

    if (fighters.some(f => !f.name.trim())) {
      errors.push('All fighters must have names');
    }

    if (new Set(fighters.map(f => f.name.trim())).size !== fighters.length) {
      errors.push('Fighter names must be unique');
    }

    if (fighters.some(f => !f.level || f.level < 1 || f.level > 10)) {
      errors.push('All fighters must have valid levels (1-10)');
    }

    // Basic settings validation
    if (!config.numberOfPits || config.numberOfPits < 1) {
      errors.push('Number of pits must be at least 1');
    }

    if (config.numberOfPits > Math.floor(fighters.length / 2)) {
      errors.push('Too many pits for number of fighters');
    }

    if (!config.roundDurationMinutes || config.roundDurationMinutes < 5 || config.roundDurationMinutes > 60) {
      errors.push('Round duration must be between 5 and 60 minutes');
    }

    // Advanced settings validation
    if (!config.skillMultiplier || config.skillMultiplier < 1 || config.skillMultiplier > 10) {
      errors.push('Skill multiplier must be between 1 and 10');
    }

    if (!config.fatigueMultiplier || config.fatigueMultiplier < 0 || config.fatigueMultiplier > 0.1) {
      errors.push('Fatigue multiplier must be between 0 and 0.1');
    }

    if (!config.restPeriodSeconds || config.restPeriodSeconds < 10 || config.restPeriodSeconds > 120) {
      errors.push('Rest period must be between 10 and 120 seconds');
    }

    // Fight duration settings validation
    if (!config.meanFightDurationSeconds || config.meanFightDurationSeconds < 5 || config.meanFightDurationSeconds > 60) {
      errors.push('Mean fight duration must be between 5 and 60 seconds');
    }

    if (!config.fightDurationStdDev || config.fightDurationStdDev < 1 || config.fightDurationStdDev > 30) {
      errors.push('Fight duration standard deviation must be between 1 and 30 seconds');
    }

    if (!config.outlierChance || config.outlierChance < 0 || config.outlierChance > 0.5) {
      errors.push('Outlier chance must be between 0% and 50%');
    }

    if (!config.minFightDurationSeconds || config.minFightDurationSeconds < 1 || config.minFightDurationSeconds > 30) {
      errors.push('Minimum fight duration must be between 1 and 30 seconds');
    }

    if (!config.maxFightDurationSeconds || config.maxFightDurationSeconds < 30 || config.maxFightDurationSeconds > 120) {
      errors.push('Maximum fight duration must be between 30 and 120 seconds');
    }

    if (!config.simulationTimeStepSeconds || config.simulationTimeStepSeconds < 0.1 || config.simulationTimeStepSeconds > 10) {
      errors.push('Simulation time step must be between 0.1 and 10 seconds');
    }

    // Simul settings validation
    if (!config.baseSimulChance || config.baseSimulChance < 0 || config.baseSimulChance > 0.5) {
      errors.push('Base simul chance must be between 0% and 50%');
    }

    if (!config.simulReductionPerLevel || config.simulReductionPerLevel < 0 || config.simulReductionPerLevel > 0.5) {
      errors.push('Simul reduction per level must be between 0% and 50%');
    }

    // Retirement mode validation
    if (config.retirementStreakLength && (!config.maxRetirements || config.maxRetirements < 1 || config.maxRetirements > 10)) {
      errors.push('Max retirements must be between 1 and 10');
    }

    return {
      errors,
      isValid: errors.length === 0
    };
  }, [config, fighters]);
}

export default useConfigValidation;