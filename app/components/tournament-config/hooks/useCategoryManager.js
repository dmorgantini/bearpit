'use client';

import { useCallback } from 'react';
import { DEFAULT_CONFIG, SINGLE_SHORT_CONFIG, SWORD_AND_BOARD_CONFIG, FLO_CONFIG } from '../../../../utils/constants.js';

function useCategoryManager(config, setConfig, onConfigChange) {
  const handleCategoryChange = useCallback((selectedCategory) => {
    let categoryConfig;
    
    switch (selectedCategory) {
      case 'single-short':
        categoryConfig = SINGLE_SHORT_CONFIG;
        break;
      case 'sword-board':
        categoryConfig = SWORD_AND_BOARD_CONFIG;
        break;
      case 'flo':
        categoryConfig = FLO_CONFIG;
        break;
      default:
        categoryConfig = DEFAULT_CONFIG;
    }
    
    const newConfig = {...config, ...categoryConfig};
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  }, [config, setConfig, onConfigChange]);

  return { handleCategoryChange };
}

export default useCategoryManager;