import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { validate, rules } from '../utils/validators';

export default function ForgotUsername() {
  const { findUsername } = useAuth();
  const navigate = useNavigate();

  const [identity, setIdentity] = useState('');
  const [accountNum, setAccountNum] = useState('');
  const [error, setError]   = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate(identity, [rules.required]);
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const masked = await findUsername({ identity });
      setResult(masked);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <AuthLayout showLang={false}>
        <div className="card card-sm text-center">
          <div style={{ width:56,height:56,borderRadius:'50%',background:'var(--success-bg)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto var(--space-5)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" style={{stroke:'var(--success)',fill:'none',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round'}}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 className="card-heading">Username Found</h1>
          <p className="card-subtext" style={{marginTop:0}}>
            We found a Spectrum account associated with your information. Your username is:
          </p>
          <div style={{
            background:'var(--gray-100)', border:'1px solid var(--gray-200)',
            borderRadius:'var(--radius-md)', padding:'14px 20px',
            fontFamily:'monospace', fontSize:18, fontWeight:700,
            color:'var(--navy)', marginBottom:'var(--space-6)', letterSpacing:2,
          }}>
            {result}
          </div>
          <p style={{fontSize:13,color:'var(--gray-500)',marginBottom:'var(--space-6)'}}>
            For security, we show only a partial username. Please sign in to view full account details.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/signin')}>Go to Sign In</button>
          <div className="mt-4">
            <Link to="/forgot-password" className="link link-sm">Forgot Password instead?</Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout showLang={false}>
      <div className="card card-sm">
        <h1 className="card-heading">Find Your Username</h1>
        <p className="card-subtext" style={{ marginTop:0 }}>
          Enter the email or phone number associated with your account.
        </p>

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            id="identity"
            label="Email Address or Phone Number"
            value={identity}
            onChange={(e) => { setIdentity(e.target.value); setError(''); }}
            onBlur={() => {}}
            error={error && !identity.trim() ? error : ''}
            helper="Enter the email or mobile number on your account."
            autoComplete="email"
            required
          />
          <FormInput
            id="accountNum"
            label="Account Number (optional)"
            value={accountNum}
            onChange={(e) => setAccountNum(e.target.value)}
            helper="Helps us find your account faster. Found on your bill."
          />

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? <><span className="spinner" />&nbsp;Searching…</> : 'Find Username'}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link to="/signin" className="link link-sm">← Back to Sign In</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
