import { afterEach, describe, expect, it, vi } from 'vitest'
import { authLogger, redactSensitive } from '../utils/logger'

describe('authLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redacts sensitive fields from metadata', () => {
    expect(
      redactSensitive({
        username: 'demo.user',
        password: 'Secret1!',
        otp: '123456',
        token: 'abc.def.ghi',
        nested: { confirmPassword: 'Secret1!' },
      }),
    ).toEqual({
      username: 'demo.user',
      password: '[REDACTED]',
      otp: '[REDACTED]',
      token: '[REDACTED]',
      nested: { confirmPassword: '[REDACTED]' },
    })
  })

  it('logs auth events without exposing secrets', () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    authLogger.info('sign_in_attempt', { username: 'demo', password: 'Secret1!' })
    authLogger.warn('otp_verification_failure', { code: '123456' })
    authLogger.error('session_error', { token: 'jwt-token' })

    expect(infoSpy).toHaveBeenCalledWith(
      '[auth][info] sign_in_attempt',
      expect.objectContaining({
        event: 'sign_in_attempt',
        username: 'demo',
        password: '[REDACTED]',
      }),
    )
    expect(warnSpy).toHaveBeenCalledWith(
      '[auth][warn] otp_verification_failure',
      expect.objectContaining({ code: '[REDACTED]' }),
    )
    expect(errorSpy).toHaveBeenCalledWith(
      '[auth][error] session_error',
      expect.objectContaining({ token: '[REDACTED]' }),
    )
  })
})
