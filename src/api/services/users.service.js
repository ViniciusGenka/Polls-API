const User = require("../models/user.model.js");
const votesService = require("../services/votes.service");
const hashUserId = require("../helpers/hashUserId.helper");
const hashUserPassword = require("../helpers/hashUserPassword.helper");
const BadRequestError = require("../errors/badRequest.error");
const NotFoundError = require("../errors/notFound.error");

const paginateUsers = async (page, limit, query) => {
  if (page == null || page <= 0) {
    throw new BadRequestError(
      `You must provide a valid page number as a query`
    );
  }

  if (limit == null || limit <= 0) {
    throw new BadRequestError(
      `You must provide a valid limit number as a query`
    );
  }

  if (limit > 100) {
    throw new BadRequestError(`You cannot query more than 100 users at once`);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const sort = { createdAt: "descending" };
  const pagination = {};

  const numberOfDocuments = await User.countDocuments(query);
  if (numberOfDocuments == 0) {
    throw new NotFoundError(`Users not found`);
  }

  const numberOfPages =
    numberOfDocuments % limit === 0
      ? numberOfDocuments / limit
      : Math.ceil(numberOfDocuments / limit);
  if (page > numberOfPages) {
    throw new NotFoundError(`Page not found`);
  }

  pagination.resources = await User.find(query)
    .limit(limit)
    .skip(startIndex)
    .sort(sort);

  if (startIndex > 0) {
    pagination.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  if (endIndex < numberOfDocuments) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  pagination.last = {
    page: Math.ceil(limit < numberOfDocuments ? numberOfDocuments / limit : 1),
    limit: limit,
  };

  return pagination;
};

const findOneUser = async (filter) => {
  const user = await User.findOne(filter);
  if (user == null) {
    throw new NotFoundError("User not found");
  }
  return user;
};

const findManyUsers = async (filter) => {
  const users = await User.find(filter);
  if (users.length === 0) {
    throw new NotFoundError("Users not found");
  }
  return users;
};

const findOneUserAndUpdate = async (conditions, update, options) => {
  const user = await User.findOneAndUpdate(conditions, update, options);
  if (user == null) {
    throw new NotFoundError("User not found");
  }
  return user;
};

const checkAvailabilityOfUserData = async (userData) => {
  if (!userData.hasOwnProperty("email") && !userData.hasOwnProperty("username"))
    return;

  const filter = { $or: [] };
  if (userData.email != null) {
    filter["$or"].push({ email: userData.email });
  }

  if (userData.username != null) {
    filter["$or"].push({ username: userData.username });
  }

  const result = await User.find(filter);

  if (result.length > 0) {
    if (result[0].email == userData.email) {
      throw new BadRequestError(`Email ${userData.email} is not available`);
    }

    if (result[0].username == userData.username) {
      throw new BadRequestError(
        `Username ${userData.username} is not available`
      );
    }
  }
};

const createUser = async (userData) => {
  await checkAvailabilityOfUserData(userData);

  const hashedPassword = await hashUserPassword(userData.password);

  let newUser = await User.create({
    name: userData.name,
    username: userData.username,
    email: userData.email,
    password: hashedPassword,
  });

  newUser = newUser.toObject();
  delete newUser.password;

  return newUser;
};

const updateUser = async (userId, update) => {
  await checkAvailabilityOfUserData(update);

  if (update.hasOwnProperty("password")) {
    const hashedPassword = await hashUserPassword(update.password);
    update.password = hashedPassword;
  }

  let updatedUser = await findOneUserAndUpdate({ _id: userId }, update, {
    returnOriginal: false,
  });

  return updatedUser;
};

const deleteUser = async (userId) => {
  const hashedUserId = hashUserId(userId);
  let deletedUser = await User.findByIdAndDelete({ _id: userId });

  if (deletedUser == null) {
    throw new BadRequestError(`User with id ${userId} does not exist`);
  }

  await votesService.deleteManyVoteDocuments({ userId: hashedUserId });

  deletedUser = deletedUser.toObject();
  delete deletedUser.password;

  return deletedUser;
};

const deleteAllUsers = async () => {
  const deletedUsers = await User.deleteMany({});
  return deletedUsers;
};

module.exports = {
  paginateUsers,
  findOneUser,
  findManyUsers,
  findOneUserAndUpdate,
  createUser,
  updateUser,
  deleteUser,
  deleteAllUsers,
};
