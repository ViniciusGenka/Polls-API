const authService = require("../services/auth.service");
const authUserValidation = require("../validations/authUser.validation");
const BadRequestError = require("../errors/badRequest.error");
const UnauthorizedError = require("../errors/unauthorized.error");

const authenticateUser = async (req, res, next) => {
  try {
    const { error, value } = authUserValidation.validate(req.body);
    if (error) {
      throw new BadRequestError(error.message);
    }

    const { accessToken, refreshToken } = await authService.authenticateUser(
      value.email,
      value.password
    );

    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};

const refreshTokens = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken == null) {
      throw new UnauthorizedError("Refresh token not found");
    }

    const { newAccessToken, newRefreshToken } = await authService.refreshTokens(
      refreshToken
    );

    res.cookie("accessToken", newAccessToken, { httpOnly: true });
    res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};

const deauthenticateUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    await authService.revokeRefreshToken(refreshToken);
    console.log(`revokei o rf ${refreshToken} porque o usuário deslogou`);

    res.clearCookie("accessToken", { httpOnly: true });
    res.clearCookie("refreshToken", { httpOnly: true });
    res.status(200).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  authenticateUser,
  refreshTokens,
  deauthenticateUser,
};
