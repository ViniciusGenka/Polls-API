const { Schema, model } = require("mongoose");

const OptionsSchema = new Schema({
  content: {
    type: String,
    required: true,
    immutable: true,
  },
  voteQuantity: {
    type: Number,
    default: 0,
    validate: (v) => v === 0,
  },
});

const PollSchema = new Schema({
  title: {
    type: String,
    required: true,
    immutable: true,
  },
  options: {
    type: [OptionsSchema],
    validate: (v) => Array.isArray(v) && v.length > 0,
  },
  voteQuantity: {
    type: Number,
    default: 0,
    validate: (v) => v === 0,
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    immutable: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

module.exports = model("Poll", PollSchema);
