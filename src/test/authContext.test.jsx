import { render, cleanup, act } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { MOCK_OTP } from '../data/mockData'

let auth

function Probe() {
  const ctx = useAuth()

  useEffect(() => {
    auth = ctx
  }, [ctx])

  return null
}

async function settleTimers() {
  await act(async () => {
    await vi.runAllTimersAsync()
  })
}

function renderAuth() {
  auth = undefined
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  )
  return () => auth
}

beforeEach(() => {
  sessionStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  sessionStorage.clear()
})

describe('auth flows', () => {
  it('signs in with seeded credentials and persists the session', async () => {
    renderAuth()

    const promise = auth.signIn('spectrum.user', 'Spectrum@1234')
    await settleTimers()
    const session = await promise

    expect(session).not.toHaveProperty('password')
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user.username).toBe('spectrum.user')
    expect(sessionStorage.getItem('spectrum_session')).toContain('spectrum.user')
  })

  it('rejects bad sign-in credentials', async () => {
    renderAuth()

    const promise = auth.signIn('wrong', 'bad')
    const rejection = expect(promise).rejects.toThrow('The username or password you entered is incorrect. Please try again.')
    await settleTimers()
    await rejection
    expect(auth.isAuthenticated).toBe(false)
  })

  it('starts a register flow and completes it after OTP verification', async () => {
    renderAuth()

    const data = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      username: 'jane.doe',
      password: 'Strong1!',
      phone: '(555) 111-2222',
    }

    const createPromise = auth.createAccount(data)
    await settleTimers()
    await createPromise

    expect(auth.flow).toMatchObject({
      type: 'register',
      email: data.email,
      phone: data.phone,
    })

    const verifyPromise = auth.verifyOTP(MOCK_OTP)
    await settleTimers()
    const result = await verifyPromise

    expect(result).toEqual({ next: 'dashboard' })
    expect(auth.isAuthenticated).toBe(true)
    expect(auth.flow).toBe(null)
    expect(auth.user.username).toBe(data.username)
    expect(sessionStorage.getItem('spectrum_flow')).toBe(null)
    expect(sessionStorage.getItem('spectrum_session')).toContain(data.username)
  })

  it('starts a reset flow, verifies OTP, and clears flow after password reset', async () => {
    renderAuth()

    const resetPromise = auth.startPasswordReset({ identity: 'demo@spectrum.net', method: 'email' })
    await settleTimers()
    await resetPromise

    expect(auth.flow).toMatchObject({
      type: 'reset-password',
      masked: 'd***@spectrum.net',
    })

    const verifyPromise = auth.verifyOTP(MOCK_OTP)
    await settleTimers()
    const verifyResult = await verifyPromise

    expect(verifyResult).toEqual({ next: 'reset-password' })

    const updatePromise = auth.resetPassword('NewPass1!')
    await settleTimers()
    const updated = await updatePromise

    expect(updated).toBe(true)
    expect(auth.flow).toBe(null)
    expect(sessionStorage.getItem('spectrum_flow')).toBe(null)
  })

  it('masks the username lookup result from identity data', async () => {
    renderAuth()

    const promise = auth.findUsername({ identity: '(555) 012-7890' })
    await settleTimers()
    const masked = await promise

    expect(masked).toBe('s*******r.user')
  })
})