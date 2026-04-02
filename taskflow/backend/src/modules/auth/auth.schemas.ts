import Joi from 'joi'

const email = Joi.string().trim().email().required()
const password = Joi.string().min(6).max(128).required()

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email,
  password
})

export const loginSchema = Joi.object({
  email,
  password
})

export const startSignupSchema = signupSchema

export const verifySignupSchema = Joi.object({
  email,
  otp: Joi.string().trim().pattern(/^\d{6}$/).required()
})
