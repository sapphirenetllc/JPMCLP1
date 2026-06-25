import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import OTPInput from '../components/OTPInput';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

const RESEND_SECONDS = 30;

export default function VerifyCode() {
  const { verifyOTP, flow } = useAuth();
  const navigate = useNavigate();

  const [code, setCode]         = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [timer, setTimer]       = useState(RESEND_SECONDS);
  const [resent, setResent]     = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timer === 0) return;
    const id = setTimeout(() => setTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const maskedDest = flow?.masked ?? flow?.email ?? 'your registered contact';

  async function handleSubmit(e) {
    e.preventDefault();
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await verifyOTP(code);
      setSuccess(true);
      setTimeout(() => {
        navigate(result.next === 'dashboard' ? '/dashboard' : '/reset-password', { replace: true });
      }, 1000);
    } catch (err) {
      setError(err.message);
      setCode('');
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    setTimer(RESEND_SECONDS);
    setResent(true);
    setCode('');
    setError('');
    setTimeout(() => setResent(false), 3000);
  }

  const flowLabel = flow?.type === 'register'
    ? 'We sent a 6-digit code to confirm your email.'
    : `We sent a 6-digit reset code to ${maskedDest}.`;

  return (
    <AuthLayout showLang={false}>
      <div className="card card-sm">
        {/* Icon */}
        <div className="flex-center mb-5" style={{ flexDirection:'column', gap:12 }}>
          <div style={{
            width:60, height:60, borderRadius:'50%', background:'var(--blue-muted)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" style={{stroke:'var(--blue)',fill:'none',strokeWidth:1.8,strokeLinecap:'round',strokeLinejoin:'round'}}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.58 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6 6l1.37-1.37a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 15.92z"/>
            </svg>
          </div>
          <h1 className="card-heading" style={{ marginBottom:0 }}>Verify Your Identity</h1>
        </div>

        <p className="card-subtext" style={{ marginBottom: 'var(--space-6)', marginTop:0 }}>
          {flowLabel} Enter the code below to continue.
        </p>

        {success && <Alert type="success">Identity verified! Redirecting…</Alert>}
        {error   && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}
        {resent  && <Alert type="info">A new code has been sent.</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <OTPInput value={code} onChange={setCode} hasError={!!error} />

          <button type="submit" className="btn btn-primary" disabled={loading || success}>
            {loading ? <><span className="spinner" />&nbsp;Verifying…</> : 'Verify Code'}
          </button>
        </form>

        <div className="resend-row mt-4">
          {timer > 0 ? (
            <>Didn't receive it? Resend in <span className="resend-timer">{timer}s</span></>
          ) : (
            <button className="link link-sm" onClick={handleResend}>Resend Code</button>
          )}
        </div>

        <div className="text-center mt-4">
          <Link to="/signin" className="link link-sm">← Back to Sign In</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
