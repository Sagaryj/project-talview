import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from,
  split
} from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { getMainDefinition } from "@apollo/client/utilities"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"
import { createClient } from "graphql-ws"

const HASURA_URL =
  import.meta.env.VITE_HASURA_URL || "http://localhost:8082/v1/graphql"

const AUTH_STORAGE_KEY = "taskflow-auth"

function getStoredAuthToken() {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!saved) return null

    const session = JSON.parse(saved) as { token?: string; expiresAt?: number } | null
    if (typeof session?.expiresAt === "number" && session.expiresAt <= Date.now()) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return typeof session?.token === "string" ? session.token : null
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

function getAuthHeaders() {
  const token = getStoredAuthToken()

  return token
    ? {
        Authorization: token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`
      }
    : {}
}

const httpLink = new HttpLink({
  uri: HASURA_URL
})

const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    ...getAuthHeaders()
  }
}))

const websocketUrl = HASURA_URL.replace(/^http/, "ws")

const wsLink = new GraphQLWsLink(
  createClient({
    url: websocketUrl,
    connectionParams: () => ({
      headers: getAuthHeaders()
    }),
    retryAttempts: 5,
    shouldRetry: () => true
  })
)

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  from([authLink, httpLink])
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      tasks: { keyFields: ["id"] },
      workflow_statuses: { keyFields: ["id"] },
      task_tags: { keyFields: ["id"] },
      activities: { keyFields: ["id"] }
    }
  })
})
