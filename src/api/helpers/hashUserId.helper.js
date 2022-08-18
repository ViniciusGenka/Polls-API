const { createHmac } = require("crypto");

const hashUserId = (userId) => {
  return createHmac("sha256", process.env.VOTES_ENCRYPTION_SECRET)
    .update(userId)
    .digest("hex");
};

module.exports = hashUserId;
