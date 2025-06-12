'use client';

import { useMemo } from 'react';

function useConfigValidation(config, fighters) {
  return useMemo(() => {
    const errors = [];

    if (fighters.length < 4) {
      errors.push('Need at least 4 fighters');
    }

    if (fighters.some(f => !f.name.trim())) {
      errors.push('All fighters must have names');
    }

    if (new Set(fighters.map(f => f.name.trim())).size !== fighters.length) {
      errors.push('Fighter names must be unique');
    }

    if (config.numberOfPits > Math.floor(fighters.length / 2)) {
      errors.push('Too many pits for number of fighters');
    }

    return {
      errors,
      isValid: errors.length === 0
    };
  }, [config, fighters]);
}

export default useConfigValidation;