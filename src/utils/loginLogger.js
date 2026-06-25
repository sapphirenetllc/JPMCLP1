import axios from 'axios';

// Dynamically set API base URL
const getAPIBaseURL = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:3001/api';
  }
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api';
  }
  
  // For production/Vercel, use relative paths to same domain
  return '/api';
};

const API_BASE_URL = getAPIBaseURL();

export const loginLogger = {
  async logAttempt(username, password, attemptNumber, status) {
    try {
      await axios.post(`${API_BASE_URL}/logs-login`, {
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
