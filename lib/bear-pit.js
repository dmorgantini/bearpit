import {
  calculateFightOutcomeProbabilities,
  determineFightOutcome,
  generateFightDuration
} from './fight-calculations.js';

export class BearPit {
  constructor(pitId, config, tournamentSimulator = null) {
    this.pitId = pitId;
    this.config = config;
    this.tournamentSimulator = tournamentSimulator;
    this.currentChampion = null;
    this.fights = [];
    this.totalFights = 0;
    this.totalSimuls = 0;
    this.elapsedTime = 0;
    this.isActive = true;
    this.currentFightEndTime = null;
    this.currentFightStartTime = null;
    this.currentFighter1 = null;
    this.currentFighter2 = null;
  }

  tryRunFight(queueManager) {
    if (!this._canStartNewFight()) {
      this.isActive = false;
      return false;
    }

    if (this._isFightInProgress()) {
      if (this._isFightComplete()) {
        this.resolveFight(queueManager);
      }
      return true;
    }

    return this.startNewFight(queueManager);
  }

  _canStartNewFight() {
    return this.isActive && this.elapsedTime < this.config.roundDurationMinutes;
  }

  _isFightInProgress() {
    return this.currentFightEndTime !== null;
  }

  _isFightComplete() {
    return this.elapsedTime >= this.currentFightEndTime;
  }

  startNewFight(queueManager) {
    // Use QueueManager's method to get fighters
    const fighters = queueManager.getFightersForFight(this.pitId, this.elapsedTime, this.currentChampion);
    if (!fighters) return false;

    const { fighter1, fighter2 } = fighters;
    this._initializeFight(fighter1, fighter2);
    
    return true;
  }

  _initializeFight(fighter1, fighter2) {
    // Use helper function for fight duration calculation
    const fightDuration = generateFightDuration(fighter1, fighter2, this.config);
    this.currentFightStartTime = this.elapsedTime;
    this.currentFightEndTime = this.elapsedTime + fightDuration;
    this.currentFighter1 = fighter1;
    this.currentFighter2 = fighter2;
  }

  resolveFight(queueManager) {
    const { fighter1, fighter2, fightDuration } = {
      fighter1: this.currentFighter1,
      fighter2: this.currentFighter2,
      fightDuration: this.currentFightEndTime - this.currentFightStartTime
    };

    this.elapsedTime = this.currentFightEndTime;
    this.currentFightEndTime = null;
    this.currentFightStartTime = null;
    this.currentFighter1 = null;
    this.currentFighter2 = null;

    // Use helper function for probability calculation
    const probabilities = calculateFightOutcomeProbabilities(
      fighter1, 
      fighter2, 
      this.config, 
      this.currentChampion
    );
    
    // Use helper function for outcome determination
    const outcome = determineFightOutcome(probabilities);

    fighter1.recordFight(probabilities.fighter1Win, probabilities.fighter2Win);
    fighter2.recordFight(probabilities.fighter2Win, probabilities.fighter1Win);
    fighter1.recordFightTime(fightDuration);
    fighter2.recordFightTime(fightDuration);
    
    const { winner } = this._processOutcome(
      outcome, 
      fighter1, 
      fighter2, 
      fightDuration, 
      queueManager
    );

    this._handleRetirement(outcome, winner);
    this._recordFightResult(fighter1, fighter2, outcome, winner, fightDuration, probabilities);
    
    this.totalFights++;
    this._checkRoundComplete();
  }
  _processOutcome(outcome, fighter1, fighter2, fightDuration, queueManager) {
    const restPeriodMinutes = (this.config.restPeriodSeconds || 30) / 60;

    if (outcome.type === 'simul') {
      return this._processSimul(fighter1, fighter2, restPeriodMinutes, queueManager);
    } else {
      return this._processWin(outcome, fighter1, fighter2, fightDuration, restPeriodMinutes, queueManager);
    }
  }

  _processSimul(fighter1, fighter2, restPeriodMinutes, queueManager) {
    fighter1.simul(fighter2);
    fighter2.simul(fighter1);
    this.totalSimuls++;

    // Use QueueManager's method to handle post-fight management
    this.currentChampion = queueManager.handlePostFightFighters(
      'simul', fighter1, fighter2, null, null, this.pitId, this.elapsedTime, restPeriodMinutes
    );

    return { winner: null, loser: null };
  }

  _processWin(outcome, fighter1, fighter2, fightDuration, restPeriodMinutes, queueManager) {
    const winner = outcome.winnerIndex === 1 ? fighter1 : fighter2;
    const loser = outcome.winnerIndex === 1 ? fighter2 : fighter1;

    winner.win(fightDuration, loser);
    loser.lose(winner);

    // Use QueueManager's method to handle post-fight management
    this.currentChampion = queueManager.handlePostFightFighters(
      'win', fighter1, fighter2, winner, loser, this.pitId, this.elapsedTime, restPeriodMinutes
    );

    return { winner, loser };
  }

  _handleRetirement(outcome, winner) {
    if (outcome.type !== 'win' || !this.config.retirementStreakLength || 
        !winner || winner.currentStreak < this.config.retirementStreakLength) {
      return;
    }

    if (this.tournamentSimulator?.retireFighter) {
      this._handleCoordinatedRetirement(winner);
    } else {
      this._handleFallbackRetirement(winner);
    }
  }

  _handleCoordinatedRetirement(winner) {
    const retired = this.tournamentSimulator.retireFighter(winner, this.elapsedTime);
    
    if (retired) {
      console.log(`🏆 ${winner.name} reaches target streak of ${this.config.retirementStreakLength} and retires from pit ${this.pitId} at ${this.elapsedTime.toFixed(1)}min after ${winner.totalFights} fights! (${this.tournamentSimulator.retiredCount}/${this.config.maxRetirements})`);
      this.currentChampion = null;
    } else {
      console.log(`⚠️ ${winner.name} reaches ${this.config.retirementStreakLength} wins but retirement cap (${this.config.maxRetirements}) is full! Continues fighting.`);
    }
  }

  _handleFallbackRetirement(winner) {
    console.log(`🏆 ${winner.name} reaches target streak of ${this.config.retirementStreakLength} and retires from pit ${this.pitId} at ${this.elapsedTime.toFixed(1)}min after ${winner.totalFights} fights!`);
    winner.retire(this.elapsedTime);
    this.currentChampion = null;
  }

  _recordFightResult(fighter1, fighter2, outcome, winner, fightDuration, probabilities) {
    this.fights.push({
      time: this.elapsedTime.toFixed(1),
      fighter1: fighter1.name,
      fighter2: fighter2.name,
      outcome: outcome.type,
      winner: outcome.type === 'win' ? winner.name : null,
      duration: (fightDuration * 60).toFixed(0),
      streak: outcome.type === 'win' ? winner.currentStreak : 0,
      retired: !!(outcome.type === 'win' && winner.isRetired),
      probabilities: {
        fighter1Win: probabilities.fighter1Win.toFixed(3),
        fighter2Win: probabilities.fighter2Win.toFixed(3),
        simul: probabilities.simul.toFixed(3)
      },
      unlucky: {
        fighter1Unlucky: probabilities.fighter1Win < 0.1,
        fighter2Unlucky: probabilities.fighter2Win < 0.1
      }
    });
  }

  _checkRoundComplete() {
    if (this.elapsedTime >= this.config.roundDurationMinutes) {
      this.isActive = false;
    }
  }

  getResult() {
    return {
      pitId: this.pitId,
      champion: this.currentChampion ? {
        name: this.currentChampion.name,
        level: this.currentChampion.level,
        currentStreak: this.currentChampion.currentStreak,
        longestStreak: this.currentChampion.longestStreak,
        timeInPit: this.currentChampion.timeInPit,
        timeAsChampion: this.currentChampion.timeAsChampion
      } : null,
      totalFights: this.totalFights,
      totalSimuls: this.totalSimuls,
      duration: this.elapsedTime,
      fights: this.fights,
      isActive: this.isActive
    };
  }
}