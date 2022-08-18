const Joi = require("joi");

const createUserSchema = Joi.object({
  name: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÒÖÚÇÑ ]{1,50}$"))
    .required(),
  username: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9_]{1,15}$"))
    .required()
    .lowercase(),
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

module.exports = createUserSchema;
