
import { DEFAULT_CONFIG } from './constants.js';

export function mergeConfig(userConfig = {}) {
  return { ...DEFAULT_CONFIG, ...userConfig };
}

export function generateFightersFromDistribution(count, distribution) {
  const fighters = [];
  let currentIndex = 0;
  
  for (const [level, quantity] of Object.entries(distribution)) {
    for (let i = 0; i < quantity && currentIndex < count; i++) {
      fighters.push({
        name: `Fighter${currentIndex + 1}`,
        level: parseInt(level)
      });
      currentIndex++;
    }
  }
  
  return fighters.slice(0, count);
}

export function formatTime(minutes) {
  return `${minutes.toFixed(1)}m`;
}

export function formatPercentage(value) {
  if (!value) return '-';
  return `${value.toFixed(1)}%`;
}