const jwt = require("jsonwebtoken");
const UnauthorizedError = require("../errors/unauthorized.error");
const redisService = require("../services/redis.service");

const auth = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    if (!accessToken) {
      throw new UnauthorizedError("User is not logged in");
    }
    if (!refreshToken) {
      throw new UnauthorizedError("User is not logged in");
    }

    const refreshTokenIsBlackListed = await redisService.checkIfKeyExists(
      refreshToken
    );

    if (refreshTokenIsBlackListed) {
      console.log("Token Blacklistado");
      throw new BadRequestError("Invalid refresh token");
    }

    const accessTokenIsValid = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET,
      (err, payload) => {
        if (err) {
          return false;
        } else {
          return payload;
        }
      }
    );

    if (accessTokenIsValid) {
      res.locals.accessToken = accessToken;
      res.locals.refreshToken = refreshToken;

      const payload = {
        _id: accessTokenIsValid["_id"],
        email: accessTokenIsValid["email"],
        name: accessTokenIsValid["name"],
        username: accessTokenIsValid["username"],
      };
      res.locals.payload = payload;
      next();
    } else {
      res.clearCookie("accessToken", { httpOnly: true });
      throw new UnauthorizedError("Invalid access token");
    }
  } catch (err) {
    next(err);
  }
};

module.exports = auth;
