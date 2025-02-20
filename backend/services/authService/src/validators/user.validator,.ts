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

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.base": "Username should be a type of text",
    "string.empty": "Username cannot be an empty field",
    "string.min": "Username should have a minimum length of {#limit}",
    "string.max": "Username should have a maximum length of {#limit}",
    "any.required": "Username is a required field",
  }),
  password: Joi.string().min(6).max(50).required().messages({
    "string.base": "Password should be a type of text",
    "string.empty": "Password cannot be empty",
    "string.min": "Password should have at least 6 characters",
    "string.max": "Password should have at most 50 characters",
    "any.required": "Password is required",
  }),
});

export { signUpSchema, registerAdminSchema, loginSchema };
