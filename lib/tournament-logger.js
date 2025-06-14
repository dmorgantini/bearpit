// Simple event-based logger that can be used by both lib and UI
class TournamentLogger {
  constructor() {
    this.listeners = new Set();
    this.logs = [];
    this.enabled = true;
    this.logCounter = 0;
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  log(...args) {
    if (!this.enabled) return;

    const timestamp = new Date().toLocaleTimeString();
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    const logEntry = {
      timestamp,
      message,
      id: `${Date.now()}-${++this.logCounter}`,
      type: this.detectLogType(message)
    };

    this.logs.push(logEntry);

    // Also log to console if no listeners or in development
    if (this.listeners.size === 0 || process?.env?.NODE_ENV === 'development') {
      console.log(...args);
    }

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(logEntry);
      } catch (e) {
        console.error('Logger listener error:', e);
      }
    });
  }

  detectLogType(message) {
    if (message.includes('=== TOURNAMENT ROUND STARTING ===')) return 'header';
    if (message.includes('🏆') || message.includes('TOURNAMENT WINNER')) return 'winner';
    if (message.includes('Pit ') && message.includes(':')) return 'pit';
    if (message.includes('Time ') && message.includes('min:')) return 'progress';
    if (message.includes('🏁') || message.includes('Retired')) return 'retirement';
    if (message.includes('Fighters:') || message.includes('Pits:') || message.includes('Round Duration:')) return 'config';
    if (message.includes('--- Round Completed ---') || message.includes('=== ROUND RESULTS ===')) return 'summary';
    return 'info';
  }

  clear() {
    this.logs = [];
    this.logCounter = 0;
    this.listeners.forEach(listener => {
      try {
        listener(null, 'clear');
      } catch (e) {
        console.error('Logger listener error on clear:', e);
      }
    });
  }

  getAllLogs() {
    return [...this.logs];
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

export {TournamentLogger};