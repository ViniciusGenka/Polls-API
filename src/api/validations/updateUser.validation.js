const Joi = require("joi");

const updateUserSchema = Joi.object({
  name: Joi.string().pattern(
    new RegExp("^[a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÒÖÚÇÑ ]{1,50}$")
  ),
  username: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9_]{1,15}$"))
    .lowercase(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
    })
    .max(320)
    .trim()
    .lowercase(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{10,60}$")),
}).or("name", "username", "email", "password");

module.exports = updateUserSchema;
