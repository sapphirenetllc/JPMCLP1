import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USERS, MOCK_OTP } from '../data/mockData';
import { authLogger } from '../utils/logger';

const AuthContext = createContext(null);

const SESSION_KEY = 'spectrum_session';
const FLOW_KEY    = 'spectrum_flow';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredValue(SESSION_KEY));
  const [flow, setFlow] = useState(() => readStoredValue(FLOW_KEY));   // { type, email, phone, username }
  const [loading, setLoading] = useState(false);

  // ── Sign In ──────────────────────────────────────────────
  const signIn = useCallback(async (username, password) => {
    authLogger.info('sign_in_attempt', { username: username.trim() });
    setLoading(true);
    try {
      await delay(900);
      const found = MOCK_USERS.find(
        (u) =>
          (u.username === username.trim() || u.email === username.trim()) &&
          u.password === password
      );
      if (!found) {
        authLogger.warn('sign_in_failure', { username: username.trim() });
        throw new Error('The username or password you entered is incorrect. Please try again.');
      }
      const session = { ...found };
      delete session.password;
      setUser(session);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      authLogger.info('sign_in_success', { userId: session.id, username: session.username });
      return session;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Sign Out ─────────────────────────────────────────────
  const signOut = useCallback(() => {
    authLogger.info('sign_out', { userId: user?.id, username: user?.username });
    setUser(null);
    setFlow(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(FLOW_KEY);
  }, [user]);

  const clearFlow = useCallback(() => {
    authLogger.info('auth_flow_cleared', { flowType: flow?.type });
    setFlow(null);
    sessionStorage.removeItem(FLOW_KEY);
  }, [flow]);

  // ── Create Account ───────────────────────────────────────
  const createAccount = useCallback(async (data) => {
    authLogger.info('register_started', {
      username: data.username,
      email: data.email,
      phone: data.phone,
    });
    setLoading(true);
    try {
      await delay(1100);
      // Check uniqueness (demo)
      const exists = MOCK_USERS.find(
        (u) => u.username === data.username || u.email === data.email
      );
      if (exists) {
        authLogger.warn('register_rejected', {
          username: data.username,
          email: data.email,
          reason: 'duplicate_identity',
        });
        throw new Error('That username or email is already in use.');
      }
      const newFlow = { type: 'register', email: data.email, phone: data.phone, tempUser: data };
      setFlow(newFlow);
      sessionStorage.setItem(FLOW_KEY, JSON.stringify(newFlow));
      authLogger.info('register_otp_sent', { email: data.email, phone: data.phone });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Start Password Reset ─────────────────────────────────
  const startPasswordReset = useCallback(async ({ identity, method }) => {
    authLogger.info('password_reset_started', { identity: identity.trim(), method });
    setLoading(true);
    try {
      await delay(800);
      const found = MOCK_USERS.find(
        (u) => u.username === identity.trim() || u.email === identity.trim()
      );
      // Always succeed for privacy — don't reveal if user exists
      const newFlow = {
        type: 'reset-password',
        identity,
        method,
        masked: found
          ? (method === 'email' ? found.emailMasked : found.phoneMasked)
          : (method === 'email' ? 'd***@mail.com' : '(***)***-****'),
      };
      setFlow(newFlow);
      sessionStorage.setItem(FLOW_KEY, JSON.stringify(newFlow));
      authLogger.info('password_reset_otp_sent', {
        method,
        destination: newFlow.masked,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Find Username ────────────────────────────────────────
  const findUsername = useCallback(async ({ identity }) => {
    authLogger.info('username_lookup_started', { identity: identity.trim() });
    setLoading(true);
    try {
      await delay(800);
      const found = MOCK_USERS.find(
        (u) => u.email === identity.trim() || u.phone === identity.trim()
      );
      const masked = found ? found.usernameMasked : 'n*t f****d';
      authLogger.info('username_lookup_completed', {
        identity: identity.trim(),
        found: !!found,
      });
      return masked;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Verify OTP ───────────────────────────────────────────
  const verifyOTP = useCallback(async (code) => {
    authLogger.info('otp_verification_attempt', { flowType: flow?.type });
    setLoading(true);
    try {
      await delay(800);
      if (code !== MOCK_OTP) {
        authLogger.warn('otp_verification_failure', { flowType: flow?.type });
        throw new Error('The code you entered is incorrect. Please try again.');
      }
    if (flow?.type === 'register' && flow?.tempUser) {
      // Auto sign-in new user
      const newUser = {
        id: 'u_new',
        ...flow.tempUser,
        plan: 'Spectrum Essential',
        billingDate: 'Jul 25, 2026',
        billAmount: '$49.99',
        dataUsed: '0 GB',
        dataTotal: '50 GB',
        dataPercent: 0,
        supportStatus: 'No open tickets',
        phoneMasked: flow.tempUser.phone.replace(/\d(?=\d{4})/g, '*'),
        emailMasked: flow.tempUser.email.replace(/(.{1}).+(@.+)/, '$1***$2'),
        usernameMasked: flow.tempUser.username.replace(/(.{1}).+(.{2})/, '$1***$2'),
        accountNumber: 'SP-' + Math.floor(Math.random() * 9000000 + 1000000),
      };
      delete newUser.password;
      setUser(newUser);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      clearFlow();
      authLogger.info('otp_verification_success', {
        flowType: 'register',
        userId: newUser.id,
        username: newUser.username,
      });
      return { next: 'dashboard' };
    }
    authLogger.info('otp_verification_success', { flowType: flow?.type ?? 'reset-password' });
    // reset-password flow → go to reset page
    return { next: 'reset-password' };
    } finally {
      setLoading(false);
    }
  }, [flow, clearFlow]);

  // ── Reset Password ───────────────────────────────────────
  const resetPassword = useCallback(async () => {
    authLogger.info('password_reset_completed', { flowType: flow?.type });
    setLoading(true);
    try {
      await delay(700);
      clearFlow();
      return true;
    } finally {
      setLoading(false);
    }
  }, [flow, clearFlow]);

  const value = {
    user,
    flow,
    loading,
    signIn,
    signOut,
    createAccount,
    startPasswordReset,
    findUsername,
    verifyOTP,
    resetPassword,
    clearFlow,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

function readStoredValue(key) {
  try {
    const saved = sessionStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (err) {
    authLogger.error('session_read_failure', { key, message: err.message });
    return null;
  }
}
