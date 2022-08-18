const usersService = require("../services/users.service");
const pollsService = require("../services/polls.service");
const votesService = require("../services/votes.service");
const authService = require("../services/auth.service");
const hashUserId = require("../helpers/hashUserId.helper");
const createUserValidation = require("../validations/createUser.validation");
const updateUserValidation = require("../validations/updateUser.validation");
const BadRequestError = require("../errors/badRequest.error");
const ForbiddenError = require("../errors/forbidden.error");

const paginatePublicVotes = async (req, res, next) => {
  try {
    const page = Number.isNaN(Number(req.query.page))
      ? null
      : parseInt(req.query.page);
    const limit = Number.isNaN(Number(req.query.limit))
      ? null
      : parseInt(req.query.limit);

    const hashedUserId = hashUserId(req.params.id);
    const query = { userId: hashedUserId, voteVisibility: "public" };

    const publicVotes = await votesService.paginateVotes(page, limit, query);
    res.json(publicVotes);
  } catch (err) {
    next(err);
  }
};

const paginatePrivateVotes = async (req, res, next) => {
  try {
    const page = Number.isNaN(Number(req.query.page))
      ? null
      : parseInt(req.query.page);
    const limit = Number.isNaN(Number(req.query.limit))
      ? null
      : parseInt(req.query.limit);
    const userId = req.params.id;

    if (userId !== res.locals.payload["_id"]) {
      throw new ForbiddenError("You are not allowed to access this votes");
    }

    const hashedUserId = hashUserId(req.params.id);
    const query = { userId: hashedUserId, voteVisibility: "private" };

    const privateVotes = await votesService.paginateVotes(page, limit, query);
    res.json(privateVotes);
  } catch (err) {
    next(err);
  }
};

const paginateCreatedPolls = async (req, res, next) => {
  try {
    const page = Number.isNaN(Number(req.query.page))
      ? null
      : parseInt(req.query.page);
    const limit = Number.isNaN(Number(req.query.limit))
      ? null
      : parseInt(req.query.limit);

    const userId = req.params.id;
    const query = { creator: userId };

    const createdPolls = await pollsService.paginatePolls(page, limit, query);
    res.json(createdPolls);
  } catch (err) {
    next(err);
  }
};

const paginateAllUsers = async (req, res, next) => {
  try {
    const page = Number.isNaN(Number(req.query.page))
      ? null
      : parseInt(req.query.page);
    const limit = Number.isNaN(Number(req.query.limit))
      ? null
      : parseInt(req.query.limit);

    const users = await usersService.paginateUsers(page, limit);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const findOneUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    if (userId == null) {
      throw new BadRequestError(
        `User ids must be provided as a param ":id" or a query "?ids="`
      );
    }

    let user = await usersService.findOneUser({ _id: userId });
    if (user == null) {
      return res.json(user);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

const findManyUsersById = async (req, res, next) => {
  try {
    const commaSeparatedIds = req.query.ids;
    if (commaSeparatedIds == null || commaSeparatedIds.length == 0) {
      throw new BadRequestError(
        `User ids must be provided as a param ":id" or a query "?ids="`
      );
    }

    const idsList = commaSeparatedIds.split(",");
    const users = await usersService.findManyUsers({
      _id: { $in: idsList },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

const findOneUserByUsername = async (req, res, next) => {
  try {
    const username = req.params.username;
    if (username == null) {
      throw new BadRequestError(
        `Users usernames must be provided as a param ":username" or a query "?usernames="`
      );
    }

    let user = await usersService.findOneUser({ username: username });
    if (user == null) {
      return res.json(user);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};

const findManyUsersByUsername = async (req, res, next) => {
  try {
    const commaSeparatedUsernames = req.query.usernames;
    if (
      commaSeparatedUsernames == null ||
      commaSeparatedUsernames.length == 0
    ) {
      throw new BadRequestError(
        `Users usernames must be provided as a param ":username" or a query "?usernames="`
      );
    }

    const usernamesList = commaSeparatedUsernames.split(",");
    const users = await usersService.findManyUsers({
      username: { $in: usernamesList },
    });

    res.json(users);
  } catch (err) {
    next(err);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { error, value } = createUserValidation.validate(req.body);
    if (error) {
      throw new BadRequestError(error.message);
    }

    const newUser = await usersService.createUser(value);
    const { accessToken, refreshToken } = await authService.authenticateUser(
      value.email,
      value.password
    );

    res.cookie("accessToken", accessToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { error, value } = updateUserValidation.validate(req.body);
    if (error) {
      throw new BadRequestError(error.message);
    }

    const userId = res.locals.payload["_id"];

    const updatedUser = await usersService.updateUser(userId, value);

    const payloadData = ["email", "name", "username"];
    const payloadDataWillUpdate = Object.getOwnPropertyNames(value).some(
      (property) => payloadData.includes(property)
    );
    if (payloadDataWillUpdate) {
      const payload = {
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
      };

      const { newAccessToken, newRefreshToken } =
        authService.updatePayloadOfTokens(payload);

      res.cookie("accessToken", newAccessToken, { httpOnly: true });
      res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
      await authService.revokeRefreshToken(res.locals.refreshToken);
      console.log(
        `revokei o rf ${res.locals.refreshToken} porque o usuário atualizou os dados!`
      );
    }

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = res.locals.payload["_id"];
    const deletedUser = await usersService.deleteUser(userId);
    console.log(
      `revokei o rf ${res.locals.payload["refreshToken"]} porque o usuário foi deletado`
    );
    await authService.revokeRefreshToken(res.locals.payload["refreshToken"]);

    res.json(deletedUser);
  } catch (err) {
    next(err);
  }
};

const deleteAllUsers = async (req, res, next) => {
  try {
    const result = await usersService.deleteAllUsers();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  paginatePublicVotes,
  paginatePrivateVotes,
  paginateCreatedPolls,
  paginateAllUsers,
  findOneUserById,
  findManyUsersById,
  findOneUserByUsername,
  findManyUsersByUsername,
  createUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
};
