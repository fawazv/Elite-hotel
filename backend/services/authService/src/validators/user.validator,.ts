import Joi from 'joi'

// / Custom error messages for better UX
const customErrorMessages = {
  'string.empty': '{#label} is required',
  'string.min': '{#label} should have at least {#limit} characters',
  'string.max': '{#label} should have at most {#limit} characters',
  'string.email': 'Please enter a valid email address',
  'string.pattern.base': '{#label} does not match the required pattern',
  'any.required': '{#label} is required',
  'string.alphanum': '{#label} should only contain alpha-numeric characters',
}

const signUpSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(50)
    .pattern(
      new RegExp(
        '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
      )
    )
    .when('type', {
      is: 'signup', // If type is "signup"
      then: Joi.required(), // Make password required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages({
      ...customErrorMessages,
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    }),

  role: Joi.string()
    .valid('receptionist', 'housekeeper')
    .when('type', {
      is: 'signup', // If type is "signup"
      then: Joi.required(), // Make role required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages({
      'any.only': 'Role must be one of [receptionist, housekeeper]',
      'any.required': 'Role is a required field',
    }),

  fullName: Joi.string()
    .min(2)
    .max(50)
    .when('type', {
      is: 'signup', // If type is "signup"
      then: Joi.required(), // Make fullName required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages(customErrorMessages),

  phoneNumber: Joi.string()
    .pattern(
      new RegExp('^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$')
    )
    .when('type', {
      is: 'signup', // If type is "signup"
      then: Joi.required(), // Make phoneNumber required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages({
      'string.pattern.base': 'Phone number should be a 10 digit number',
      'any.required': 'Phone number is a required field',
    }),

  email: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/)) // Only allow .com domains
    .email({ tlds: { allow: false } }) // Don't validate TLDs (top-level domains)
    .required() // Email is always required
    .messages(customErrorMessages),
})

const signInSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'org'] } })
    .required()
    .messages({
      'string.email': 'Email must be a valid email',
      'any.required': 'Email is a required field',
    }),

  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    .required()
    .messages({
      'string.pattern.base':
        'Password should be alphanumeric and between 3 to 30 characters',
      'any.required': 'Password is a required field',
    }),

  role: Joi.string()
    .valid('receptionist', 'housekeeper', 'admin')
    .required()
    .messages({
      'any.only': 'Role must be one of [receptionist, housekeeper]',
      'any.required': 'Role is a required field',
    }),
})

export { signUpSchema, signInSchema }
