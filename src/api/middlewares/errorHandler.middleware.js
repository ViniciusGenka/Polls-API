const CustomAPIError = require("../errors/custom.error");
const mongoose = require("mongoose");
const errorHandler = (err, req, res, next) => {
  if (
    err instanceof CustomAPIError ||
    err instanceof mongoose.Error ||
    err instanceof SyntaxError
  ) {
    return res.status(err.statusCode || 400).json({ message: err.message });
  } else {
    return res.status(500).json({ message: err.stack });
  }
};

module.exports = errorHandler;
