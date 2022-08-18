// const usersService = require("./users.service");
const User = require("../models/user.model");
const redisService = require("./redis.service");
const NotFoundError = require("../errors/notFound.error");

const BadRequestError = require("../errors/badRequest.error");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ms = require("ms");

const generateAccessToken = (payload) => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_LIFETIME,
  });

  return accessToken;
};

const generateRefreshToken = (payload) => {
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_LIFETIME,
  });

  return refreshToken;
};

const revokeRefreshToken = async (refreshToken) => {
  const expirationTime = ms(process.env.REFRESH_TOKEN_LIFETIME);
  await redisService.setKeyValuePairWithExpirationTime(refreshToken, 1, {
    PX: expirationTime,
  });
};

const authenticateUser = async (email, password) => {
  let user = await User.findOne({ email: email }).select(
    "+password -createdAt -updatedAt -__v"
  );

  if (user == null) {
    throw new NotFoundError("Incorrect email");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new BadRequestError(`Incorrect password`);
  }

  user = user.toObject();
  delete user.password;

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return { accessToken, refreshToken };
};

const refreshTokens = async (refreshToken) => {
  const refreshTokenIsBlackListed = await redisService.checkIfKeyExists(
    refreshToken
  );

  if (refreshTokenIsBlackListed) {
    console.log("Token Blacklistado");
    throw new BadRequestError("Invalid refresh token");
  }

  const tokens = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (err, payload) => {
      if (err) {
        throw new BadRequestError("Invalid refresh token");
      }

      const user = {
        _id: payload._id,
        name: payload.name,
        username: payload.username,
        email: payload.email,
      };

      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);

      return { newAccessToken, newRefreshToken };
    }
  );

  await revokeRefreshToken(refreshToken);
  console.log(
    `revokei o rf ${refreshToken} porque o usuário refreshou o token`
  );

  return tokens;
};

const updatePayloadOfTokens = (newPayload) => {
  const newAccessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);

  return { newAccessToken, newRefreshToken };
};

module.exports = {
  authenticateUser,
  refreshTokens,
  updatePayloadOfTokens,
  revokeRefreshToken,
};
