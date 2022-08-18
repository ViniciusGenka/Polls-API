const Joi = require("joi");

const createPollSchema = Joi.object({
  title: Joi.string()
    .pattern(
      new RegExp(
        "^[a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÒÖÚÇÑ@#$%^&*()_+-=;:,.? ]{1,50}$"
      )
    )
    .required(),
  options: Joi.array()
    .items(
      Joi.object({
        content: Joi.string()
          .pattern(
            new RegExp(
              "^[a-zA-Z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÒÖÚÇÑ@#$%^&*()_+-=;:,.? ]{1,50}$"
            )
          )
          .required(),
      })
    )
    .required(),
});

module.exports = createPollSchema;
