/**
 * Fight calculation utilities for tournament simulation
 */

/**
 * Calculate fight outcome probabilities between two fighters
 * @param {Object} fighter1 - First fighter
 * @param {Object} fighter2 - Second fighter
 * @param {Object} config - Tournament configuration
 * @param {Object} currentChampion - Current champion (for fatigue calculation)
 * @returns {Object} Probabilities for fighter1 win, fighter2 win, and simul
 */
export function calculateFightOutcomeProbabilities(fighter1, fighter2, config, currentChampion = null) {
  const baseProbability = calculateBaseProbability(fighter1, fighter2, config, currentChampion);
  const simulProbability = calculateSimulProbability(fighter1, fighter2, config);
  
  const remainingProbability = 1 - simulProbability;
  
  return {
    fighter1Win: clampProbability(baseProbability * remainingProbability),
    fighter2Win: clampProbability((1 - baseProbability) * remainingProbability),
    simul: clampProbability(simulProbability)
  };
}

/**
 * Calculate base win probability for fighter1 vs fighter2
 * @param {Object} fighter1 - First fighter
 * @param {Object} fighter2 - Second fighter
 * @param {Object} config - Tournament configuration
 * @param {Object} currentChampion - Current champion (for fatigue calculation)
 * @returns {number} Base probability (0-1) that fighter1 wins
 */
function calculateBaseProbability(fighter1, fighter2, config, currentChampion = null) {
  const skillDifference = fighter1.level - fighter2.level;
  const baseMultiplier = Math.pow(config.skillMultiplier, skillDifference);
  let baseProbability = baseMultiplier / (1 + baseMultiplier);

  // Apply fatigue if fighter1 is the current champion
  if (currentChampion === fighter1) {
    const fatigueReduction = fighter1.currentStreak * config.fatigueMultiplier;
    baseProbability = Math.max(0.01, baseProbability - fatigueReduction);
  }

  return clampProbability(baseProbability);
}

/**
 * Calculate simultaneous defeat (simul) probability
 * @param {Object} fighter1 - First fighter
 * @param {Object} fighter2 - Second fighter
 * @param {Object} config - Tournament configuration
 * @returns {number} Probability (0-1) of simultaneous defeat
 */
function calculateSimulProbability(fighter1, fighter2, config) {
  const levelDifference = Math.abs(fighter1.level - fighter2.level);
  let simulProbability = config.baseSimulChance || 0.1;
  
  const simulReduction = levelDifference * (config.simulReductionPerLevel || 0.02);
  return Math.max(0.01, simulProbability - simulReduction);
}

/**
 * Generate fight duration based on configuration
 * @param {Object} config - Tournament configuration
 * @returns {number} Fight duration in seconds
 */
export function generateFightDurationInSeconds(config) {
  // Base parameters for normal distribution
  const meanDuration = config.meanFightDurationSeconds || 20;
  const stdDev = config.fightDurationStdDev || 12;
  
  // Parameters for outlier generation
  const outlierChance = config.outlierChance || 0.2;
  const minDuration = config.minFightDurationSeconds || 5;
  const maxDuration = config.maxFightDurationSeconds || 61;
  
  // Generate a random number from normal distribution
  const generateNormalRandom = () => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + meanDuration;
  };

  // Determine if we should generate an outlier
  let isOutlier = Math.random() < outlierChance;
  let duration;
  
  if (isOutlier) {
    // For outliers, use a weighted distribution favoring shorter durations
    const random = Math.random();
    if (random < 0.8) { // 80% chance of short duration
      duration = minDuration + Math.floor(Math.random() * 10); // 5-15 seconds
    } else { // 20% chance of long duration
      duration = maxDuration - Math.floor(Math.random() * 20); // 41-61 seconds
    }
  } else {
    // Generate normal distribution duration
    duration = generateNormalRandom();
  }
  
  // Clamp to valid range
  duration = Math.max(minDuration, Math.min(maxDuration, duration));
  duration = Math.round(duration);

  return duration;
}

/**
 * Determine fight outcome based on probabilities and random roll
 * @param {Object} probabilities - Fight outcome probabilities
 * @returns {Object} Outcome with type ('win' or 'simul') and winner index if applicable
 */
export function determineFightOutcome(probabilities) {
  const randomValue = Math.random();
  
  if (randomValue < probabilities.fighter1Win) {
    return { type: 'win', winnerIndex: 1 };
  } else if (randomValue < probabilities.fighter1Win + probabilities.fighter2Win) {
    return { type: 'win', winnerIndex: 2 };
  } else {
    return { type: 'simul' };
  }
}

/**
 * Calculate skill-based multiplier for win probability
 * @param {number} skillDifference - Level difference between fighters
 * @param {number} skillMultiplier - Skill multiplier from config
 * @returns {number} Skill-based probability multiplier
 */
export function calculateSkillMultiplier(skillDifference, skillMultiplier) {
  const baseMultiplier = Math.pow(skillMultiplier, skillDifference);
  return baseMultiplier / (1 + baseMultiplier);
}

/**
 * Clamp probability to valid range (0.01 to 0.99)
 * @param {number} probability - Raw probability value
 * @returns {number} Clamped probability
 */
function clampProbability(probability) {
  return Math.min(0.99, Math.max(0.01, probability));
}