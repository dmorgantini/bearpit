export const generateFightersFromDistribution = (count, distribution) => {
  const newFighters = [];
  let currentIndex = 0;
  
  for (const [level, weight] of Object.entries(distribution)) {
    const quantity = Math.round(count * weight);
    for (let i = 0; i < quantity && currentIndex < count; i++) {
      newFighters.push({
        name: `Fighter${currentIndex + 1}`,
        level: parseInt(level)
      });
      currentIndex++;
    }
  }
  
  // Fill remaining slots with level 1 if needed
  while (newFighters.length < count) {
    newFighters.push({
      name: `Fighter${newFighters.length + 1}`,
      level: 1
    });
  }
  
  return newFighters.slice(0, count);
};

export function formatTime(minutes) {
  return `${minutes.toFixed(1)}m`;
}

export function formatPercentage(value) {
  if (!value) return '-';
  return `${value.toFixed(1)}%`;
}