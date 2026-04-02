import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('apollo module source contract', () => {
  it('defines Apollo client setup with auth and websocket links', () => {
    const source = readFileSync(resolve(__dirname, './apollo.ts'), 'utf8')

    expect(source).toContain('ApolloClient')
    expect(source).toContain('HttpLink')
    expect(source).toContain('GraphQLWsLink')
    expect(source).toContain('createClient')
    expect(source).toContain('import.meta.env.VITE_HASURA_URL')
    expect(source).toContain('Authorization')
    expect(source).toContain('tasks: { keyFields: ["id"] }')
    expect(source).toContain('workflow_statuses: { keyFields: ["id"] }')
  })
})
