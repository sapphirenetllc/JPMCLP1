export default function FormInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  helper,
  placeholder,
  autoComplete,
  showHelp = false,
  helpTitle = '',
  required = false,
  inputMode,
  maxLength,
  disabled = false,
}) {
  return (
    <div className="form-group">
      <div className="field-label-row">
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span aria-hidden="true" style={{ color: 'var(--error)', marginLeft: 2 }}>*</span>}
        </label>
        {showHelp && (
          <span
            className="help-icon"
            role="img"
            aria-label={helpTitle}
            title={helpTitle}
            tabIndex={0}
          >?</span>
        )}
      </div>
      <div className="input-wrap">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          aria-required={required}
          aria-describedby={error ? `${id}-error` : helper ? `${id}-helper` : undefined}
          aria-invalid={!!error}
          className={`form-input${error ? ' has-error' : ''}`}
        />
      </div>
      {error  && <p id={`${id}-error`}  className="field-error-text" role="alert">{errorIcon}{error}</p>}
      {!error && helper && <p id={`${id}-helper`} className="field-helper">{helper}</p>}
    </div>
  );
}

const errorIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" style={{ stroke:'currentColor', fill:'none', strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round', flexShrink:0 }}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
