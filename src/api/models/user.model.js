const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 50,
    },
    username: {
      type: String,
      required: true,
      lowercase: true,
      maxLength: 15,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      maxLength: 320,
    },
    password: {
      type: String,
      required: true,
      minLength: 10,
      maxLength: 60,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
