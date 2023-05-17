import * as Joi from 'joi';

export const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('localhost').default('localhost'),
  PORT: Joi.number().required().default(3000),
  DB_PORT: Joi.number(),
  DB_USERNAME: Joi.string(),
  DB_PASSWORD: Joi.string(),
  DB_NAME: Joi.string(),
  SALT_ROUNDS: Joi.number().required(),
});
