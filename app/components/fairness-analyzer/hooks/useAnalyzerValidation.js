'use client';

import { useMemo } from 'react';

function useAnalyzerValidation(config) {
  return useMemo(() => {
    const errors = [];

    // Time options validation
    if (config.timeOptions.length === 0) {
      errors.push('Please select at least one time option');
    }

    // Pit options validation
    if (config.pitOptions.length === 0) {
      errors.push('Please select at least one pit option');
    }

    // Fighter count validation
    if (!config.fighterCount || config.fighterCount < 4) {
      errors.push('Fighter count must be at least 4');
    }

    if (config.fighterCount > 60) {
      errors.push('Fighter count cannot exceed 60');
    }

    // Iterations validation
    if (!config.iterations || config.iterations < 1) {
      errors.push('Iterations must be at least 1');
    }

    if (config.iterations > 100) {
      errors.push('Iterations cannot exceed 100');
    }

    // Distribution validation
    if (!config.distribution) {
      errors.push('Please select a skill distribution');
    }

    return {
      errors,
      isValid: errors.length === 0
    };
  }, [config]);
}

export default useAnalyzerValidation; 