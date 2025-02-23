import Joi from "joi";

const signUpSchema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Password should be alphanumeric and between 3 to 30 characters",
      "any.required": "Password is a required field",
    }),

  role: Joi.string().valid("receptionist", "housekeeper").required().messages({
    "any.only": "Role must be one of [receptionist, housekeeper]",
    "any.required": "Role is a required field",
  }),

  fullName: Joi.string().min(1).max(100).required().messages({
    "string.base": "Name should be a type of text",
    "string.empty": "Name cannot be an empty field",
    "string.min": "Name should have a minimum length of {#limit}",
    "string.max": "Name should have a maximum length of {#limit}",
    "any.required": "Name is a required field",
  }),

  phoneNumber: Joi.string()
    .pattern(new RegExp("^[0-9]{10}$"))
    .required()
    .messages({
      "string.pattern.base": "Phone number should be a 10 digit number",
      "any.required": "Phone number is a required field",
    }),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
    .required()
    .messages({
      "string.email": "Email must be a valid email",
      "any.required": "Email is a required field",
    }),
  otp: Joi.string().length(6).required(),
  type: Joi.string().valid("signup", "forgotPassword").required(),
});

const registerAdminSchema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Password should be alphanumeric and between 3 to 30 characters",
      "any.required": "Password is a required field",
    }),

  role: Joi.string()
    .valid("Receptionalist", "Housekeeper")
    .required()
    .messages({
      "any.only": "Role must be one of [Receptionalist, Housekeeper]",
      "any.required": "Role is a required field",
    }),

  fullName: Joi.string().min(1).max(100).required().messages({
    "string.base": "Name should be a type of text",
    "string.empty": "Name cannot be an empty field",
    "string.min": "Name should have a minimum length of {#limit}",
    "string.max": "Name should have a maximum length of {#limit}",
    "any.required": "Name is a required field",
  }),

  phoneNumber: Joi.string()
    .pattern(new RegExp("^[0-9]{10}$"))
    .required()
    .messages({
      "string.pattern.base": "Phone number should be a 10 digit number",
      "any.required": "Phone number is a required field",
    }),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
    .required()
    .messages({
      "string.email": "Email must be a valid email",
      "any.required": "Email is a required field",
    }),
});

const signInSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
    .required()
    .messages({
      "string.email": "Email must be a valid email",
      "any.required": "Email is a required field",
    }),

  password: Joi.string().min(6).max(50).required().messages({
    "string.base": "Password should be a type of text",
    "string.empty": "Password cannot be empty",
    "string.min": "Password should have at least 6 characters",
    "string.max": "Password should have at most 50 characters",
    "any.required": "Password is required",
  }),

  role: Joi.string()
    .valid("Receptionalist", "Housekeeper")
    .required()
    .messages({
      "any.only": "Role must be one of [Receptionalist, Housekeeper]",
      "any.required": "Role is a required field",
    }),
});

export { signUpSchema, registerAdminSchema, signInSchema };
