import Joi from "joi";

const signUpSchema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,30}$"))
    .when("type", {
      is: "signup", // If type is "signup"
      then: Joi.required(), // Make password required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages({
      "string.pattern.base":
        "Password should be alphanumeric and between 3 to 30 characters",
      "any.required": "Password is a required field",
    }),

  role: Joi.string()
    .valid("receptionist", "housekeeper")
    .when("type", {
      is: "signup", // If type is "signup"
      then: Joi.required(), // Make role required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages({
      "any.only": "Role must be one of [receptionist, housekeeper]",
      "any.required": "Role is a required field",
    }),

  fullName: Joi.string()
    .min(1)
    .max(100)
    .when("type", {
      is: "signup", // If type is "signup"
      then: Joi.required(), // Make fullName required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages({
      "string.base": "Name should be a type of text",
      "string.empty": "Name cannot be an empty field",
      "string.min": "Name should have a minimum length of {#limit}",
      "string.max": "Name should have a maximum length of {#limit}",
      "any.required": "Name is a required field",
    }),

  phoneNumber: Joi.string()
    .pattern(new RegExp("^[0-9]{10}$"))
    .when("type", {
      is: "signup", // If type is "signup"
      then: Joi.required(), // Make phoneNumber required
      otherwise: Joi.optional(), // Otherwise, make it optional
    })
    .messages({
      "string.pattern.base": "Phone number should be a 10 digit number",
      "any.required": "Phone number is a required field",
    }),

  email: Joi.string()
    .pattern(new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.com$/)) // Only allow .com domains
    .email({ minDomainSegments: 2 })
    .required() // Email is always required
    .messages({
      "string.pattern.base": "Email must end with .com",
      "string.email": "Email must be a valid email",
      "any.required": "Email is a required field",
    }),

  otp: Joi.string()
    .length(6)
    .required() // OTP is always required
    .messages({
      "string.length": "OTP must be exactly 6 characters",
      "any.required": "OTP is a required field",
    }),

  type: Joi.string()
    .valid("signup", "forgetPassword")
    .required() // Type is always required
    .messages({
      "any.only": "Type must be one of [signup, forgetPassword]",
      "any.required": "Type is a required field",
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
});

export { signUpSchema, signInSchema };
