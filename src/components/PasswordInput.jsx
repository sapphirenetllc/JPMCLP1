import { useState } from 'react';
import { passwordRules, getPasswordStrength } from '../utils/validators';

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  helper,
  autoComplete = 'current-password',
  showStrength = false,
  required = false,
  disabled = false,
}) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;

  const strengthColors = ['', 'active-weak', 'active-fair', 'active-good', 'active-strong'];

  return (
    <div className="form-group">
      <div className="field-label-row">
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span aria-hidden="true" style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
        </label>
      </div>
      <div className="input-wrap">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-required={required}
          aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
          aria-invalid={!!error}
          className={`form-input form-input-pr${error ? ' has-error' : ''}`}
        />
        <button
          type="button"
          className="eye-toggle"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {error && <p id={`${id}-error`} className="field-error-text" role="alert">{errorIcon}{error}</p>}
      {!error && helper && <p id={`${id}-helper`} className="field-helper">{helper}</p>}

      {showStrength && value && (
        <div style={{ marginTop: 10 }}>
          <div className="strength-bar">
            {[1,2,3,4].map((i) => (
              <div
                key={i}
                className={`strength-seg ${i <= (strength?.score ?? 0) ? strengthColors[strength.score] : ''}`}
              />
            ))}
          </div>
          <div className="strength-label">
            {passwordRules.map((rule) => {
              const passed = rule.test(value);
              return (
                <span key={rule.id} className={`strength-rule${passed ? ' passed' : ''}`}>
                  {passed ? <CheckIcon /> : <DotIcon />}
                  {rule.label}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const EyeIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
);
const DotIcon = () => (
  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></svg>
);
const errorIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" style={{ stroke:'currentColor', fill:'none', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', flexShrink:0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
