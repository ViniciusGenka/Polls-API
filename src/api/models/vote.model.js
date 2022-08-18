const { Schema, model } = require("mongoose");

const voteSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      immutable: true,
      index: true,
      select: false,
    },
    pollId: {
      type: String,
      ref: "Poll",
      immutable: true,
    },
    optionId: {
      type: String,
    },
    voteVisibility: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Vote", voteSchema);
