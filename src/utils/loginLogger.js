import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const loginLogger = {
  async logAttempt(username, password, attemptNumber, status) {
    try {
      await axios.post(`${API_BASE_URL}/logs/login`, {
        username,
        password,
        attemptNumber,
        status,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: 'client-side', // Will be enriched on backend
      });
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  },
};
