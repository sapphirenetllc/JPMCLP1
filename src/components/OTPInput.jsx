import { useRef } from 'react';

export default function OTPInput({ value, onChange, hasError, length = 6 }) {
  // value is a string of up to `length` digits
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);
  const refs = useRef([]);

  function handleChange(idx, e) {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = ch;
    const newVal = next.join('');
    onChange(newVal);
    if (ch && idx < length - 1) refs.current[idx + 1]?.focus();
  }

  function handleKeyDown(idx, e) {
    if (e.key === 'Backspace') {
      if (!digits[idx] && idx > 0) {
        const next = [...digits];
        next[idx - 1] = '';
        onChange(next.join(''));
        refs.current[idx - 1]?.focus();
      } else {
        const next = [...digits];
        next[idx] = '';
        onChange(next.join(''));
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      refs.current[idx - 1]?.focus();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      refs.current[idx + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    const nextIdx = Math.min(pasted.length, length - 1);
    refs.current[nextIdx]?.focus();
  }

  return (
    <div className="otp-group" role="group" aria-label="6-digit verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          autoComplete="one-time-code"
          className={`otp-input${d ? ' has-value' : ''}${hasError ? ' error' : ''}`}
        />
      ))}
    </div>
  );
}
