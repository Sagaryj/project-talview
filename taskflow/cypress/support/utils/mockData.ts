export interface MockUser {
  token: string
  user: {
    id: number
    name: string
    email: string
  }
}

export interface MockTask {
  id: number
  title: string
}

export function buildMockUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    token: 'mock-token',
    user: {
      id: 1,
      name: 'Cypress User',
      email: 'cypress@example.com',
      ...(overrides.user ?? {})
    },
    ...overrides
  }
}

export function buildMockTask(overrides: Partial<MockTask> = {}): MockTask {
  return {
    id: Date.now(),
    title: 'Mock task',
    ...overrides
  }
}
