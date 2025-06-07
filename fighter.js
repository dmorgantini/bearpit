export class Fighter {
  constructor(name, level) {
    this.name = name;
    this.level = level;
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.totalWins = 0;
    this.totalLosses = 0;
    this.totalSimuls = 0;
    this.timeInPit = 0; // Total time spent in actual fights (win, lose, or simul)
    this.timeAsChampion = 0; // Time spent specifically as champion
    this.currentPitId = null;
    this.isInQueue = true;
    this.isChampion = false;
    this.unluckyFights = 0; // Fights where they had <10% win chance
    this.totalFights = 0; // Total fights participated in
    this.availableAfterTime = 0; // Time when fighter can fight again (in minutes)
    this.isRetired = false; // Whether fighter has been retired after reaching target streak
    this.retiredAt = null; // Time when fighter was retired
    this.retiredAfterFights = null; // Number of fights when retired
    
    // Award tracking
    this.earnedAward = false; // Did they earn an award this tournament?
    
    // NEW: Elimination tracking
    this.eliminatedByAwardWinner = 0; // Times defeated by someone who already earned an award
    this.eliminationsWhileAwardWinner = 0; // Times they defeated someone while having earned an award
  }

  reset() {
    this.currentStreak = 0;
    this.longestStreak = 0;
    this.totalWins = 0;
    this.totalLosses = 0;
    this.totalSimuls = 0;
    this.timeInPit = 0;
    this.timeAsChampion = 0;
    this.currentPitId = null;
    this.isInQueue = true;
    this.isChampion = false;
    this.unluckyFights = 0;
    this.totalFights = 0;
    this.availableAfterTime = 0;
    this.isRetired = false;
    this.retiredAt = null;
    this.retiredAfterFights = null;
    this.earnedAward = false;
    this.eliminatedByAwardWinner = 0;
    this.eliminationsWhileAwardWinner = 0;
  }

  // Record time spent in any fight (win, lose, or simul)
  recordFightTime(fightDuration) {
    this.timeInPit += fightDuration;
  }

  win(timeHeld, defeatedOpponent = null) {
    this.currentStreak++;
    this.totalWins++;
    this.timeAsChampion += timeHeld; // Time as champion only
    // timeInPit is now recorded separately via recordFightTime()
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
    
    // Check for award (only if not already earned and not retired)
    if (!this.earnedAward && !this.isRetired && this.isEligibleForAward()) {
      this.earnedAward = true;
    }
    
    // NEW: Track elimination while having earned award
    if (this.earnedAward && defeatedOpponent) {
      this.eliminationsWhileAwardWinner++;
    }
  }

  lose(winner = null) {
    this.currentStreak = 0;
    this.totalLosses++;
    this.isChampion = false;
    
    // NEW: Track elimination by award winner
    if (winner && winner.earnedAward) {
      this.eliminatedByAwardWinner++;
    }
  }

  simul(opponent = null) {
    this.currentStreak = 0;
    this.totalSimuls++;
    this.isChampion = false;
    
    // NEW: Track simul with award winner (could be considered elimination)
    if (opponent && opponent.earnedAward) {
      this.eliminatedByAwardWinner++;
    }
  }

  recordFight(winProbability) {
    this.totalFights++;
    if (winProbability < 0.1) { // Less than 10% chance to win
      this.unluckyFights++;
    }
  }

  // Retire the fighter after reaching target streak
  retire(currentTime) {
    // FIXED: Check for award based on longest streak before retiring
    if (!this.earnedAward && this.longestStreak >= this.getAwardThreshold()) {
      this.earnedAward = true;
    }
    
    this.isRetired = true;
    this.retiredAt = currentTime;
    this.retiredAfterFights = this.totalFights;
    this.isChampion = false;
    this.isInQueue = false;
  }

  // Set when this fighter can fight again (currentTime + rest period)
  setRestPeriod(currentTime, restPeriodMinutes = 0.5) { // 30 seconds = 0.5 minutes
    this.availableAfterTime = currentTime + restPeriodMinutes;
  }

  // Check if fighter is available to fight at the given time
  isAvailableAt(currentTime) {
    return !this.isRetired && currentTime >= this.availableAfterTime;
  }

  getUnluckyPercentage() {
    if (this.totalFights === 0) return 0;
    return (this.unluckyFights / this.totalFights) * 100;
  }

  // Check if fighter is currently eligible for an award based on their streak
  isEligibleForAward() {
    const awardThreshold = this.getAwardThreshold();
    return this.currentStreak >= awardThreshold;
  }

  // Get the award threshold for this fighter
  getAwardThreshold() {
    return (2 * this.level) + 1;
  }

  // FIXED: Check if fighter has earned award based on their best performance
  hasEarnedAward() {
    return this.earnedAward || this.longestStreak >= this.getAwardThreshold();
  }

  // Check if this fighter can theoretically earn an award given retirement rules
  canEarnAward(retirementThreshold) {
    if (!retirementThreshold) return true; // No retirement = can always earn award
    
    const awardThreshold = this.getAwardThreshold();
    return awardThreshold < retirementThreshold; // Can earn award if award threshold is lower than retirement
  }

  // Check eligibility status for analysis
  getAwardEligibilityStatus(retirementThreshold) {
    if (!retirementThreshold) {
      return {
        canEarnAward: true,
        earnedAward: this.hasEarnedAward(), // FIXED: Use hasEarnedAward()
        reason: 'No retirement system'
      };
    }

    const awardThreshold = this.getAwardThreshold();
    
    if (awardThreshold >= retirementThreshold) {
      return {
        canEarnAward: false,
        earnedAward: false,
        reason: `Level too high (needs ${awardThreshold} wins, retires at ${retirementThreshold})`
      };
    }

    return {
      canEarnAward: true,
      earnedAward: this.hasEarnedAward(), // FIXED: Use hasEarnedAward()
      reason: `Eligible (needs ${awardThreshold} wins, retires at ${retirementThreshold})`
    };
  }

  // NEW: Get elimination rate by award winners
  getEliminationByAwardWinnerRate() {
    if (this.totalLosses + this.totalSimuls === 0) return 0;
    return (this.eliminatedByAwardWinner / (this.totalLosses + this.totalSimuls)) * 100;
  }
}