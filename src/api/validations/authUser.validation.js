const Joi = require("joi");

const authUserSchema = Joi.object({
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .max(320)
    .trim()
    .lowercase()
    .required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{10,60}$")).required(),
});

module.exports = authUserSchema;
