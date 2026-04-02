import Joi from 'joi'

export const moveTaskWithActivityLogSchema = Joi.object({
  taskId: Joi.number().integer().positive().required(),
  targetStatusId: Joi.number().integer().positive().required()
})
