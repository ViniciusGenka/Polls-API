const mongoose = require("mongoose");

const connect = () => {
  mongoose.connect(process.env.DATABASE_URL);
  const connection = mongoose.connection;
  connection.on("error", (err) => console.log(err));
  connection.once("open", () => console.log("Connected to database"));
};

module.exports = { connect };
