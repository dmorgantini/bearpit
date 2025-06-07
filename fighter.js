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
    this.timeAsChampion = 0; // NEW: Time spent specifically as champion
    this.currentPitId = null;
    this.isInQueue = true;
    this.isChampion = false;
    this.unluckyFights = 0; // Fights where they had <10% win chance
    this.totalFights = 0; // Total fights participated in
    this.availableAfterTime = 0; // Time when fighter can fight again (in minutes)
    this.isRetired = false; // NEW: Whether fighter has been retired after reaching target streak
    this.retiredAt = null; // NEW: Time when fighter was retired
    this.retiredAfterFights = null; // NEW: Number of fights when retired
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
  }

  // NEW: Record time spent in any fight (win, lose, or simul)
  recordFightTime(fightDuration) {
    this.timeInPit += fightDuration;
  }

  win(timeHeld) {
    this.currentStreak++;
    this.totalWins++;
    this.timeAsChampion += timeHeld; // Time as champion only
    // timeInPit is now recorded separately via recordFightTime()
    if (this.currentStreak > this.longestStreak) {
      this.longestStreak = this.currentStreak;
    }
  }

  lose() {
    this.currentStreak = 0;
    this.totalLosses++;
    this.isChampion = false;
  }

  simul() {
    this.currentStreak = 0;
    this.totalSimuls++;
    this.isChampion = false;
  }

  recordFight(winProbability) {
    this.totalFights++;
    if (winProbability < 0.1) { // Less than 10% chance to win
      this.unluckyFights++;
    }
  }

  // NEW: Retire the fighter after reaching target streak
  retire(currentTime) {
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
}