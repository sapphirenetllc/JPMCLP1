// Shared in-memory storage for all serverless functions
// Note: This persists during the same deployment but resets between function invocations
export const sharedStorage = {
  fallbackLogs: [],
  
  addLog(logData) {
    this.fallbackLogs.push(logData);
    // Keep only last 1000 logs to avoid memory issues
    if (this.fallbackLogs.length > 1000) {
      this.fallbackLogs = this.fallbackLogs.slice(-1000);
    }
  },
  
  getLogs(filters = {}) {
    let logs = [...this.fallbackLogs];
    
    if (filters.status) {
      logs = logs.filter(log => log.status === filters.status);
    }
    if (filters.username) {
      const regex = new RegExp(filters.username, 'i');
      logs = logs.filter(log => regex.test(log.username));
    }
    
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  
  getAllLogs() {
    return [...this.fallbackLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },
  
  clearLogs() {
    this.fallbackLogs = [];
  }
};
