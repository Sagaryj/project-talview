import dotenv from 'dotenv'

dotenv.config({ path: '../.env' })
dotenv.config()

export const config = {
  port: Number(process.env.API_PORT || 4000)
} as const
 
