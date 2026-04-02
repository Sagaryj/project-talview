import { createAuthToken, hashPassword, verifyAuthToken, verifyPassword } from './auth'

describe('auth utilities', () => {
  it('hashes and verifies a password', async () => {
    const password = 'secret123'
    const hash = hashPassword(password)

    expect(hash).not.toBe(password)
    await expect(verifyPassword(password, hash)).resolves.toBe(true)
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false)
  })

  it('creates a token with Hasura claims and verifies it', () => {
    const token = createAuthToken(42, 'user@example.com')
    const payload = verifyAuthToken(token)

    expect(payload).not.toBeNull()
    expect(payload?.userId).toBe(42)
    expect(payload?.email).toBe('user@example.com')
    expect(payload?.['https://hasura.io/jwt/claims']).toEqual({
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      'x-hasura-user-id': '42'
    })
  })

  it('rejects a tampered token', () => {
    const token = createAuthToken(7, 'tamper@example.com')
    const tamperedToken = `${token.slice(0, -1)}x`

    expect(verifyAuthToken(tamperedToken)).toBeNull()
  })
})
