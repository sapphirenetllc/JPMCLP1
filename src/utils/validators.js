// ─── Validators ─────────────────────────────────────────────

export const rules = {
  required: (v) => (v && v.trim() !== '') || 'This field is required.',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email address.',
  minLen: (n) => (v) => (v && v.length >= n) || `Must be at least ${n} characters.`,
  maxLen: (n) => (v) => (v && v.length <= n) || `Must be no more than ${n} characters.`,
  username: (v) =>
    /^[a-zA-Z0-9._-]{3,30}$/.test(v) ||
    'Username may only contain letters, numbers, dots, underscores, or hyphens (3–30 chars).',
  phone: (v) =>
    /^[\d\s()+-]{7,15}$/.test(v) || 'Enter a valid phone number.',
  noSpace: (v) => !/\s/.test(v) || 'No spaces allowed.',
};

// Password strength rules
export const passwordRules = [
  { id: 'len',  label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper',label: 'One uppercase letter',  test: (v) => /[A-Z]/.test(v) },
  { id: 'num',  label: 'One number',             test: (v) => /\d/.test(v) },
  { id: 'spec', label: 'One special character',  test: (v) => /[!@#$%^&*(),.?":{}|<>_-]/.test(v) },
];

export function getPasswordStrength(password) {
  const passed = passwordRules.filter((r) => r.test(password)).length;
  if (!password) return { score: 0, label: '' };
  if (passed === 1) return { score: 1, label: 'Weak' };
  if (passed === 2) return { score: 2, label: 'Fair' };
  if (passed === 3) return { score: 3, label: 'Good' };
  return { score: 4, label: 'Strong' };
}

// Run a chain of validator functions; return first error or null
export function validate(value, validators) {
  for (const fn of validators) {
    const result = fn(value);
    if (result !== true) return result;
  }
  return null;
}

// Validate a whole form object: { fieldName: validators[] }
// Returns { fieldName: errorString | null }
export function validateForm(fields) {
  const errors = {};
  for (const [key, { value, validators }] of Object.entries(fields)) {
    errors[key] = validate(value, validators);
  }
  return errors;
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}
