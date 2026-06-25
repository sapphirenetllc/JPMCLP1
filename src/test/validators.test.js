import { describe, expect, it } from 'vitest'
import { getPasswordStrength, hasErrors, passwordRules, rules, validate, validateForm } from '../utils/validators'

describe('validator helpers', () => {
  it('validates required, email, username, phone, and spacing rules', () => {
    expect(rules.required('')).toBe('This field is required.')
    expect(rules.required('   ')).toBe('This field is required.')
    expect(rules.required('ok')).toBe(true)

    expect(rules.email('not-an-email')).toBe('Enter a valid email address.')
    expect(rules.email('demo@spectrum.net')).toBe(true)

    expect(rules.username('ab')).toBe('Username may only contain letters, numbers, dots, underscores, or hyphens (3–30 chars).')
    expect(rules.username('spectrum.user')).toBe(true)

    expect(rules.phone('555-12')).toBe('Enter a valid phone number.')
    expect(rules.phone('(555) 012-7890')).toBe(true)

    expect(rules.noSpace('no spaces')).toBe('No spaces allowed.')
    expect(rules.noSpace('nospaces')).toBe(true)
  })

  it('scores password strength using the rule set', () => {
    expect(passwordRules).toHaveLength(4)
    expect(getPasswordStrength('')).toEqual({ score: 0, label: '' })
    expect(getPasswordStrength('abcdefgh')).toEqual({ score: 1, label: 'Weak' })
    expect(getPasswordStrength('Abcdefgh')).toEqual({ score: 2, label: 'Fair' })
    expect(getPasswordStrength('Abcdefg1')).toEqual({ score: 3, label: 'Good' })
    expect(getPasswordStrength('Abcdefg1!')).toEqual({ score: 4, label: 'Strong' })
  })

  it('returns the first validation error for a field and detects form errors', () => {
    expect(validate('', [rules.required, rules.email])).toBe('This field is required.')
    expect(validate('demo', [rules.required, rules.email])).toBe('Enter a valid email address.')
    expect(validate('demo@spectrum.net', [rules.required, rules.email])).toBe(null)

    const errors = validateForm({
      email: { value: 'bad', validators: [rules.required, rules.email] },
      username: { value: 'spectrum.user', validators: [rules.required, rules.username] },
    })

    expect(errors).toEqual({
      email: 'Enter a valid email address.',
      username: null,
    })
    expect(hasErrors(errors)).toBe(true)
    expect(hasErrors({ email: null, username: null })).toBe(false)
  })
})