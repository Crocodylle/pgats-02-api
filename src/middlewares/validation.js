const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Schemas de validação
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nome deve ter pelo menos 2 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'any.required': 'Nome é obrigatório'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email deve ter um formato válido',
    'any.required': 'Email é obrigatório'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Senha deve ter pelo menos 6 caracteres',
    'any.required': 'Senha é obrigatória'
  })
});

const transferSchema = Joi.object({
  toAccount: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'Conta deve ter exatamente 6 dígitos',
    'string.pattern.base': 'Conta deve conter apenas números',
    'any.required': 'Conta de destino é obrigatória'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.positive': 'Valor deve ser maior que zero',
    'any.required': 'Valor é obrigatório'
  }),
  description: Joi.string().max(255).optional().messages({
    'string.max': 'Descrição deve ter no máximo 255 caracteres'
  })
});

const favoriteSchema = Joi.object({
  account: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    'string.length': 'Conta deve ter exatamente 6 dígitos',
    'string.pattern.base': 'Conta deve conter apenas números',
    'any.required': 'Conta é obrigatória'
  })
});

module.exports = {
  validateRequest,
  loginSchema,
  registerSchema,
  transferSchema,
  favoriteSchema
};
