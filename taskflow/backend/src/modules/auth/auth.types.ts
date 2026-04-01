export interface AuthUser {
  id: number
  name: string
  email: string
}

export interface AuthPayload {
  token: string
  user: AuthUser
}

export interface AuthInput {
  name?: unknown
  email?: unknown
  password?: unknown
}

export interface MePayload {
  user: AuthUser
}
