export class QueueManager {
  constructor(fighters, numberOfPits, useShortestQueue = false, shuffleInitialOrder = true) {
    this.useShortestQueue = useShortestQueue;
    this.numberOfPits = numberOfPits;
    
    // Optionally shuffle fighters for random initial order
    const orderedFighters = shuffleInitialOrder ? this.shuffleArray([...fighters]) : [...fighters];

    if (useShortestQueue) {
      // Individual queues per pit
      this.queues = [];
      for (let i = 0; i < numberOfPits; i++) {
        this.queues.push([]);
      }
      // Distribute fighters evenly across queues initially
      orderedFighters.forEach((fighter, index) => {
        const queueIndex = index % numberOfPits;
        this.queues[queueIndex].push(fighter);
        fighter.currentPitId = queueIndex;
      });
    } else {
      // Single shared queue
      this.sharedQueue = orderedFighters;
      this.queues = null;
    }
  }

  shuffleArray(array) {
    // Fisher-Yates shuffle algorithm
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  getNextFighter(pitId, currentTime) {
    if (this.useShortestQueue) {
      // Get from specific pit queue - find first available fighter
      const queue = this.queues[pitId];
      for (let i = 0; i < queue.length; i++) {
        if (queue[i].isAvailableAt(currentTime)) {
          const fighter = queue.splice(i, 1)[0]; // Remove from queue
          fighter.isInQueue = false;
          return fighter;
        }
      }
      return null; // No available fighters in this queue
    } else {
      // Get from shared queue - find first available fighter
      for (let i = 0; i < this.sharedQueue.length; i++) {
        if (this.sharedQueue[i].isAvailableAt(currentTime)) {
          const fighter = this.sharedQueue.splice(i, 1)[0]; // Remove from queue
          fighter.isInQueue = false;
          return fighter;
        }
      }
      return null; // No available fighters in shared queue
    }
  }

  addFighter(fighter, originalPitId = null, currentTime = 0, restPeriodMinutes = 0.5) {
    fighter.isInQueue = true;
    fighter.isChampion = false;
    
    // Set the rest period - fighter can't fight again for 30 seconds (0.5 minutes)
    fighter.setRestPeriod(currentTime, restPeriodMinutes);

    if (this.useShortestQueue) {
      // Find shortest queue
      let shortestQueueIndex = 0;
      let shortestLength = this.queues[0].length;

      for (let i = 1; i < this.queues.length; i++) {
        if (this.queues[i].length < shortestLength) {
          shortestLength = this.queues[i].length;
          shortestQueueIndex = i;
        }
      }

      this.queues[shortestQueueIndex].push(fighter);
      fighter.currentPitId = shortestQueueIndex;
    } else {
      // Add to shared queue
      this.sharedQueue.push(fighter);
      fighter.currentPitId = null;
    }
  }

  hasAvailableFighters(pitId = null, currentTime = 0) {
    if (this.useShortestQueue && pitId !== null) {
      return this.queues[pitId].some(fighter => fighter.isAvailableAt(currentTime));
    } else if (!this.useShortestQueue) {
      return this.sharedQueue.some(fighter => fighter.isAvailableAt(currentTime));
    }

    // Check if any queue has available fighters
    return this.queues.some(queue => queue.some(fighter => fighter.isAvailableAt(currentTime)));
  }

  getQueueStatus(currentTime = 0) {
    if (this.useShortestQueue) {
      return this.queues.map((queue, index) => ({
        pitId: index,
        total: queue.length,
        available: queue.filter(fighter => fighter.isAvailableAt(currentTime)).length,
        resting: queue.filter(fighter => !fighter.isAvailableAt(currentTime)).length
      }));
    } else {
      const available = this.sharedQueue.filter(fighter => fighter.isAvailableAt(currentTime)).length;
      const resting = this.sharedQueue.filter(fighter => !fighter.isAvailableAt(currentTime)).length;
      return [{
        pitId: 'shared', 
        total: this.sharedQueue.length,
        available: available,
        resting: resting
      }];
    }
  }

  // Get detailed info about fighters and their rest status
  getDetailedStatus(currentTime = 0) {
    const allFighters = this.useShortestQueue 
      ? this.queues.flat() 
      : this.sharedQueue;
    
    return allFighters.map(fighter => ({
      name: fighter.name,
      level: fighter.level,
      availableAfter: fighter.availableAfterTime,
      isAvailable: fighter.isAvailableAt(currentTime),
      timeUntilAvailable: Math.max(0, fighter.availableAfterTime - currentTime)
    }));
  }
}