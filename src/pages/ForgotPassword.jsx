import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { validate, rules } from '../utils/validators';

export default function ForgotPassword() {
  const { startPasswordReset } = useAuth();
  const navigate = useNavigate();

  const [identity, setIdentity] = useState('');
  const [method, setMethod]     = useState('email');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate(identity, [rules.required]);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await startPasswordReset({ identity, method });
      navigate('/verify', { state: { flow: 'reset-password' } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout showLang={false}>
      <div className="card card-sm">
        <h1 className="card-heading">Reset Your Password</h1>
        <p className="card-subtext" style={{ marginTop:0 }}>
          Enter your username or email and we'll send a verification code to reset your password.
        </p>

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            id="identity"
            label="Username or Email Address"
            value={identity}
            onChange={(e) => { setIdentity(e.target.value); setError(''); }}
            onBlur={() => {}}
            error={error && !identity.trim() ? error : ''}
            autoComplete="username"
            autoCapitalize="none"
            showHelp
            helpTitle="Enter the username or email associated with your Spectrum account"
            required
          />

          {/* Delivery method */}
          <div className="form-group">
            <p className="field-label" style={{ marginBottom: 10 }}>How would you like to receive your code?</p>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { id:'method-email', val:'email', label:'Email', sub:'Send to your registered email address' },
                { id:'method-sms',   val:'sms',   label:'Text Message (SMS)', sub:'Send to your registered mobile number' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  htmlFor={opt.id}
                  style={{
                    display:'flex', alignItems:'center', gap:12,
                    padding:'12px 14px',
                    border: `1.5px solid ${method === opt.val ? 'var(--blue-accent)' : 'var(--gray-300)'}`,
                    borderRadius:'var(--radius-md)',
                    cursor:'pointer',
                    background: method === opt.val ? 'var(--blue-muted)' : 'var(--white)',
                    transition:'all 0.15s',
                  }}
                >
                  <input
                    id={opt.id}
                    type="radio"
                    name="method"
                    value={opt.val}
                    checked={method === opt.val}
                    onChange={() => setMethod(opt.val)}
                    style={{ accentColor:'var(--blue)', width:16, height:16, flexShrink:0 }}
                  />
                  <span>
                    <span style={{ fontSize:14, fontWeight:600, color:'var(--gray-800)', display:'block' }}>{opt.label}</span>
                    <span style={{ fontSize:12, color:'var(--gray-500)' }}>{opt.sub}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
            {loading ? <><span className="spinner" />&nbsp;Sending Code…</> : 'Send Reset Code'}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link to="/signin" className="link link-sm">← Back to Sign In</Link>
          <span className="sep">·</span>
          <Link to="/forgot-username" className="link link-sm">Find Username</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
