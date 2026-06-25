import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import PasswordInput from '../components/PasswordInput';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { getPasswordStrength } from '../utils/validators';

export default function ResetPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [errors, setErrors]         = useState({});
  const [apiError, setApiError]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);

  function validateAll() {
    const { score } = getPasswordStrength(password);
    const errs = {};
    if (score < 4) errs.password = 'Password must meet all requirements.';
    if (password !== confirm) errs.confirm = 'Passwords do not match.';
    else if (!confirm) errs.confirm = 'Please confirm your password.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateAll();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await resetPassword(password);
      setSuccess(true);
      setTimeout(() => navigate('/signin', {
        state: { successMsg: 'Your password has been updated. Please sign in with your new password.' }
      }), 1800);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout showLang={false}>
      <div className="card card-sm">
        {/* Icon */}
        <div style={{ textAlign:'center', marginBottom:'var(--space-5)' }}>
          <div style={{ width:56,height:56,borderRadius:'50%',background:'var(--blue-muted)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" style={{stroke:'var(--blue)',fill:'none',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round'}}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h1 className="card-heading" style={{ marginBottom:0 }}>Set a New Password</h1>
        </div>

        <p className="card-subtext" style={{ marginTop:0 }}>
          Choose a strong password you haven't used before.
        </p>

        {success  && <Alert type="success">Password updated! Redirecting to Sign In…</Alert>}
        {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <PasswordInput
            id="newPassword"
            label="New Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: null })); }}
            onBlur={() => {}}
            error={errors.password}
            autoComplete="new-password"
            showStrength
            required
          />
          <PasswordInput
            id="confirmPassword"
            label="Confirm New Password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((er) => ({ ...er, confirm: null })); }}
            onBlur={() => setErrors((er) => ({ ...er, confirm: password !== confirm ? 'Passwords do not match.' : null }))}
            error={errors.confirm}
            autoComplete="new-password"
            required
          />

          <button type="submit" className="btn btn-primary mt-4" disabled={loading || success}>
            {loading ? <><span className="spinner" />&nbsp;Updating…</> : 'Update Password'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
