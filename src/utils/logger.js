const SENSITIVE_KEYS = new Set([
  'password',
  'confirmpassword',
  'newpassword',
  'code',
  'otp',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'sessiontoken',
  'bearertoken',
]);

const REDACTED = '[REDACTED]';

function isSensitiveKey(key) {
  return SENSITIVE_KEYS.has(String(key).toLowerCase());
}

export function redactSensitive(value, seen = new WeakSet()) {
  if (value == null || typeof value !== 'object') return value;
  if (seen.has(value)) return value;

  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, val]) => [
      key,
      isSensitiveKey(key) ? REDACTED : redactSensitive(val, seen),
    ]),
  );
}

function write(level, event, meta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    category: 'auth',
    event,
    ...(meta ? redactSensitive(meta) : {}),
  };

  const prefix = `[auth][${level}] ${event}`;

  if (level === 'error') {
    console.error(prefix, entry);
    return;
  }

  if (level === 'warn') {
    console.warn(prefix, entry);
    return;
  }

  console.info(prefix, entry);
}

export const authLogger = {
  info(event, meta) {
    write('info', event, meta);
  },
  warn(event, meta) {
    write('warn', event, meta);
  },
  error(event, meta) {
    write('error', event, meta);
  },
};
