import { apolloClient } from "./apollo"
import {
  LOGIN_MUTATION,
  SIGNUP_MUTATION,
  START_SIGNUP_MUTATION,
  VERIFY_SIGNUP_MUTATION,
  UPDATE_CURRENT_USER_MUTATION
} from "../features/auth/graphql/mutations"
import { CURRENT_USER_QUERY } from "../features/auth/graphql/queries"

const AUTH_STORAGE_KEY = "taskflow-auth"
export const AUTH_SESSION_EVENT = "taskflow-auth-changed"

export interface AuthUser {
  id: number
  name: string
  email: string
  username?: string
  preferredLanguage?: string
  theme?: string
  profileRole?: string
  company?: string
  timezone?: string
}

export interface AuthSession {
  token: string
  user: AuthUser
}

interface AuthMutationResponse {
  login?: AuthSession
  signup?: AuthSession
  verifySignup?: AuthSession
}

interface StartSignupMutationResponse {
  startSignup?: {
    message: string
  }
}

interface CurrentUserRecord {
  id: number
  name: string
  username?: string | null
  email: string
  preferred_language?: string | null
  theme?: string | null
  profile_role?: string | null
  company?: string | null
  timezone?: string | null
}

interface CurrentUserQueryResponse {
  users?: CurrentUserRecord[]
}

interface UpdateCurrentUserMutationResponse {
  update_users?: {
    returning?: CurrentUserRecord[]
  }
}

export interface UpdateCurrentUserProfileInput {
  name: string
  username: string
  preferredLanguage: string
  theme: string
  profileRole: string
  company: string
  timezone: string
}

function dispatchAuthSessionChanged() {
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT))
}

function normalizeAuthUser(value: CurrentUserRecord | AuthUser): AuthUser {
  const preferredLanguage =
    "preferred_language" in value
      ? (value.preferred_language ?? undefined)
      : ("preferredLanguage" in value ? value.preferredLanguage : undefined)

  const profileRole =
    "profile_role" in value
      ? (value.profile_role ?? undefined)
      : ("profileRole" in value ? value.profileRole : undefined)

  return {
    id: value.id,
    name: value.name,
    username: "username" in value ? (value.username ?? undefined) : undefined,
    email: value.email,
    preferredLanguage,
    theme: value.theme ?? undefined,
    profileRole,
    company: "company" in value ? (value.company ?? undefined) : undefined,
    timezone: "timezone" in value ? (value.timezone ?? undefined) : undefined
  }
}

function isValidAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false

  const session = value as Partial<AuthSession>
  const user = session.user as Partial<AuthUser> | undefined

  return (
    typeof session.token === "string" &&
    !!user &&
    typeof user.id === "number" &&
    typeof user.name === "string" &&
    typeof user.email === "string"
  )
}

export function saveAuthSession(session: AuthSession) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
  dispatchAuthSessionChanged()
}

export function getAuthSession() {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!saved) return null

    const parsed = JSON.parse(saved) as unknown

    if (!isValidAuthSession(parsed)) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return null
    }

    return parsed
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function clearAuthSession() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  dispatchAuthSessionChanged()
}

export function requireAuthSession() {
  const session = getAuthSession()

  if (!session) {
    throw new Error("You must be logged in to continue")
  }

  return session
}

function updateStoredAuthUser(user: AuthUser) {
  const session = getAuthSession()
  if (!session) return

  saveAuthSession({
    ...session,
    user: {
      ...session.user,
      ...user
    }
  })
}

export async function login(email: string, password: string) {
  const { data } = await apolloClient.mutate<AuthMutationResponse>({
    mutation: LOGIN_MUTATION,
    variables: { email, password }
  })

  if (!data?.login || !isValidAuthSession(data.login)) {
    throw new Error("Login failed")
  }

  return data.login
}

export async function signup(name: string, email: string, password: string) {
  const { data } = await apolloClient.mutate<AuthMutationResponse>({
    mutation: SIGNUP_MUTATION,
    variables: { name, email, password }
  })

  if (!data?.signup || !isValidAuthSession(data.signup)) {
    throw new Error("Signup failed")
  }

  return data.signup
}

export async function startSignup(name: string, email: string, password: string) {
  const { data } = await apolloClient.mutate<StartSignupMutationResponse>({
    mutation: START_SIGNUP_MUTATION,
    variables: { name, email, password }
  })

  if (!data?.startSignup?.message) {
    throw new Error("Failed to start signup verification")
  }

  return data.startSignup.message
}

export async function verifySignup(email: string, otp: string) {
  const { data } = await apolloClient.mutate<AuthMutationResponse>({
    mutation: VERIFY_SIGNUP_MUTATION,
    variables: { email, otp }
  })

  if (!data?.verifySignup || !isValidAuthSession(data.verifySignup)) {
    throw new Error("Signup verification failed")
  }

  return data.verifySignup
}

export async function fetchCurrentUser() {
  const session = requireAuthSession()

  const { data } = await apolloClient.query<CurrentUserQueryResponse>({
    query: CURRENT_USER_QUERY,
    variables: { id: session.user.id },
    fetchPolicy: "network-only"
  })

  const user = data?.users?.[0]
  if (!user) {
    throw new Error("Failed to load current user")
  }

  const normalized = normalizeAuthUser(user)
  updateStoredAuthUser(normalized)
  return normalized
}

export async function updateCurrentUserProfile(input: UpdateCurrentUserProfileInput) {
  const session = requireAuthSession()

  let data: UpdateCurrentUserMutationResponse | undefined

  try {
    const response = await apolloClient.mutate<UpdateCurrentUserMutationResponse>({
      mutation: UPDATE_CURRENT_USER_MUTATION,
      variables: {
        id: session.user.id,
        changes: {
          name: input.name,
          username: input.username.trim() || null,
          preferred_language: input.preferredLanguage,
          theme: input.theme,
          profile_role: input.profileRole,
          company: input.company,
          timezone: input.timezone,
          updated_at: new Date().toISOString()
        }
      }
    })

    data = response.data
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : ""
    if (message.includes("username") && (message.includes("constraint") || message.includes("unique"))) {
      throw new Error("PROFILE_USERNAME_TAKEN")
    }

    throw error
  }

  const user = data?.update_users?.returning?.[0]
  if (!user) {
    throw new Error("Failed to update profile")
  }

  const normalized = normalizeAuthUser(user)
  updateStoredAuthUser(normalized)
  return normalized
}
