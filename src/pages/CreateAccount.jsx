import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormInput from '../components/FormInput';
import PasswordInput from '../components/PasswordInput';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { validate, rules, getPasswordStrength } from '../utils/validators';

const initForm = {
  firstName: '', lastName: '', email: '', username: '',
  password: '', confirmPassword: '', phone: '', accountNumber: '', agree: false,
};

export default function CreateAccount() {
  const { createAccount } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]     = useState(initForm);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  function handleChange(field, val) {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }));
    setApiError('');
  }

  function touch(field, validators) {
    setErrors((e) => ({ ...e, [field]: validate(form[field], validators) }));
  }

  function validateAll() {
    const { score } = getPasswordStrength(form.password);
    return {
      firstName:       validate(form.firstName,       [rules.required, rules.minLen(2)]),
      lastName:        validate(form.lastName,        [rules.required, rules.minLen(2)]),
      email:           validate(form.email,           [rules.required, rules.email]),
      username:        validate(form.username,        [rules.required, rules.username]),
      password:        score < 4 ? 'Password must meet all requirements (8+ chars, uppercase, number, special).' : null,
      confirmPassword: form.password !== form.confirmPassword ? 'Passwords do not match.' : validate(form.confirmPassword, [rules.required]),
      phone:           validate(form.phone,           [rules.required, rules.phone]),
      agree:           !form.agree ? 'You must accept the terms to continue.' : null,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validateAll();
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setLoading(true);
    try {
      await createAccount(form);
      navigate('/verify', { state: { flow: 'register' } });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="card" style={{ maxWidth: 520 }}>
        <h1 className="card-heading">Create Your Account</h1>
        <p className="card-subtext">Join Spectrum to manage your services, billing, and more.</p>

        {apiError && <Alert type="error" onClose={() => setApiError('')}>{apiError}</Alert>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <FormInput id="firstName" label="First Name" value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => touch('firstName', [rules.required, rules.minLen(2)])}
              error={errors.firstName} autoComplete="given-name" required />
            <FormInput id="lastName" label="Last Name" value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => touch('lastName', [rules.required, rules.minLen(2)])}
              error={errors.lastName} autoComplete="family-name" required />
          </div>

          <FormInput id="email" label="Email Address" type="email" value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => touch('email', [rules.required, rules.email])}
            error={errors.email} autoComplete="email" inputMode="email"
            helper="We'll send a verification code here." required />

          <FormInput id="username" label="Username" value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            onBlur={() => touch('username', [rules.required, rules.username])}
            error={errors.username} autoComplete="username" autoCapitalize="none"
            helper="3–30 characters. Letters, numbers, dots, underscores, hyphens."
            showHelp helpTitle="Choose a unique username for your Spectrum account" required />

          <PasswordInput id="password" label="Password" value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => {}}
            error={errors.password} autoComplete="new-password"
            showStrength required />

          <PasswordInput id="confirmPassword" label="Confirm Password" value={form.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => setErrors((e) => ({ ...e, confirmPassword: form.password !== form.confirmPassword ? 'Passwords do not match.' : null }))}
            error={errors.confirmPassword} autoComplete="new-password" required />

          <FormInput id="phone" label="Phone Number" type="tel" value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => touch('phone', [rules.required, rules.phone])}
            error={errors.phone} autoComplete="tel" inputMode="tel"
            helper="Used for account verification and alerts." required />

          <FormInput id="accountNumber" label="Existing Account Number (optional)" value={form.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value)}
            error={errors.accountNumber} helper="If you have an existing Spectrum service account." />

          <div className="form-group">
            <div className="checkbox-row">
              <input
                id="agree"
                type="checkbox"
                className="form-checkbox"
                checked={form.agree}
                onChange={(e) => handleChange('agree', e.target.checked)}
                aria-required="true"
                aria-invalid={!!errors.agree}
              />
              <label htmlFor="agree" className="checkbox-label">
                I agree to the{' '}
                <Link to="/privacy" className="link link-sm">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="link link-sm">Privacy Policy</Link>.
              </label>
            </div>
            {errors.agree && <p className="field-error-text" role="alert" style={{marginTop:6}}>{errors.agree}</p>}
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
            {loading ? <><span className="spinner" />&nbsp;Creating Account…</> : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-5">
          <span style={{ fontSize:13, color:'var(--gray-500)' }}>Already have an account?{' '}</span>
          <Link to="/signin" className="link link-sm">Sign In</Link>
        </div>
      </div>
    </AuthLayout>
  );
}
