const bcrypt = require("bcrypt");
const hashUserPassword = (password) => {
  return bcrypt.hash(password, 10);
};

module.exports = hashUserPassword;
