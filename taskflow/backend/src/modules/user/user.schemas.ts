import Joi from 'joi'

export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required()
})
