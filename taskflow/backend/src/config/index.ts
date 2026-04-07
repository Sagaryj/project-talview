import dotenv from 'dotenv'
import Joi from 'joi'

dotenv.config({ path: '../.env' })
dotenv.config()

const envSchema = Joi.object({
  API_PORT: Joi.number().integer().min(1).max(65535).default(4000),
  AUTH_TOKEN_SECRET: Joi.string().min(16).optional(),
  AWS_REGION: Joi.string().trim().optional(),
  SES_FROM_EMAIL: Joi.string().trim().email().optional(),
  EMAIL_USER: Joi.string().trim().email().optional(),
  EMAIL_PASS: Joi.string().trim().optional(),
  TEMPORAL_ADDRESS: Joi.string().trim().optional(),
  HASURA_GRAPHQL_ADMIN_SECRET: Joi.string().trim().optional(),
  HASURA_ADMIN_SECRET: Joi.string().trim().optional(),
  POSTGRES_HOST: Joi.string().trim().optional(),
  POSTGRES_PORT: Joi.number().integer().min(1).max(65535).optional(),
  POSTGRES_DB: Joi.string().trim().optional(),
  POSTGRES_USER: Joi.string().trim().optional(),
  POSTGRES_PASSWORD: Joi.string().allow('').optional()
})
  .unknown(true)

const { error, value: env } = envSchema.validate(process.env, {
  abortEarly: false,
  convert: true
})

if (error) {
  throw new Error(`Invalid environment configuration: ${error.details.map((detail) => detail.message).join(', ')}`)
}

export const config = {
  port: Number(env.API_PORT)
} as const
