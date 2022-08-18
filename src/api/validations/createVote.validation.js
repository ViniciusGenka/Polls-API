const Joi = require("joi");

const createVoteSchema = Joi.object({
  pollId: Joi.string().pattern(new RegExp("^[0-9a-fA-F]{24}$")).required(),
  optionId: Joi.string().pattern(new RegExp("^[0-9a-fA-F]{24}$")).required(),
  voteVisibility: Joi.string().valid("public", "private").required(),
});

module.exports = createVoteSchema;
