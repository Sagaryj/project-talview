import Joi from 'joi'

const taskEventRowSchema = Joi.object({
  id: Joi.alternatives(Joi.number(), Joi.string()).required(),
  user_id: Joi.alternatives(Joi.number(), Joi.string()).required(),
  title: Joi.string().required(),
  due_date: Joi.string().allow(null).required(),
  workflow_status_id: Joi.alternatives(Joi.number(), Joi.string(), Joi.allow(null)).required()
}).required()

export const taskCreatedEventSchema = Joi.object({
  event: Joi.object({
    op: Joi.string().valid('INSERT').required(),
    data: Joi.object({
      old: Joi.any().allow(null),
      new: taskEventRowSchema
    }).required()
  }).required()
}).unknown(true)

export const taskUpdatedEventSchema = Joi.object({
  event: Joi.object({
    op: Joi.string().valid('UPDATE').required(),
    data: Joi.object({
      old: taskEventRowSchema,
      new: taskEventRowSchema
    }).required()
  }).required()
}).unknown(true)

export const workflowStatusCreatedEventSchema = Joi.object({
  event: Joi.object({
    op: Joi.string().valid('INSERT').required(),
    data: Joi.object({
      old: Joi.any().allow(null),
      new: Joi.object({
        id: Joi.alternatives(Joi.number(), Joi.string()).required(),
        user_id: Joi.alternatives(Joi.number(), Joi.string()).required(),
        label: Joi.string().required(),
        color: Joi.string().required(),
        category: Joi.string().required(),
        system: Joi.boolean().required()
      }).required()
    }).required()
  }).required()
}).unknown(true)
