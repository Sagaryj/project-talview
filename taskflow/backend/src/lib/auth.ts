import crypto from "crypto"
import bcrypt from "bcryptjs"

const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "taskflow-dev-jwt-secret-fallback-2026"
const HASURA_CLAIMS_NAMESPACE = "https://hasura.io/jwt/claims"

type HasuraClaims = {
  "x-hasura-default-role": "user"
  "x-hasura-allowed-roles": ["user"]
  "x-hasura-user-id": string
}

interface AuthPayload {
  userId: number
  email: string
  exp: number
  iat: number
  [HASURA_CLAIMS_NAMESPACE]: HasuraClaims
}

function toBase64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
}

function fromBase64Url(input: string) {
  const normalized = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=")

  return Buffer.from(normalized, "base64").toString("utf8")
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export async function verifyPassword(password: string, storedHash: string) {
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    return bcrypt.compare(password, storedHash)
  }

  const [salt, originalHash] = storedHash.split(":")
  if (!salt || !originalHash) return false

  const candidateHash = crypto.scryptSync(password, salt, 64).toString("hex")
  return crypto.timingSafeEqual(
    Buffer.from(candidateHash, "hex"),
    Buffer.from(originalHash, "hex")
  )
}

export function createAuthToken(userId: number, email: string) {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const payload = toBase64Url(
    JSON.stringify({
      userId,
      email,
      iat: now,
      exp: now + 60 * 60 * 24 * 7,
      [HASURA_CLAIMS_NAMESPACE]: {
        "x-hasura-default-role": "user",
        "x-hasura-allowed-roles": ["user"],
        "x-hasura-user-id": String(userId)
      }
    } satisfies AuthPayload)
  )

  const signature = toBase64Url(
    crypto.createHmac("sha256", TOKEN_SECRET).update(`${header}.${payload}`).digest()
  )

  return `${header}.${payload}.${signature}`
}

export function verifyAuthToken(token: string) {
  const [header, payload, signature] = token.split(".")
  if (!header || !payload || !signature) return null

  const expectedSignature = toBase64Url(
    crypto.createHmac("sha256", TOKEN_SECRET).update(`${header}.${payload}`).digest()
  )

  if (signature !== expectedSignature) return null

  const decoded = JSON.parse(fromBase64Url(payload)) as AuthPayload

  if (decoded.exp < Math.floor(Date.now() / 1000)) {
    return null
  }

  return decoded
}
