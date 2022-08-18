const Poll = require("../models/poll.model.js");
const BadRequestError = require("../errors/badRequest.error");
const ForbiddenError = require("../errors/forbidden.error");
const NotFoundError = require("../errors/notFound.error");

const paginatePolls = async (page, limit, query) => {
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
    throw new BadRequestError(`You cannot query more than 100 polls at once`);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const sort = { createdAt: "descending" };
  const pagination = {};

  const numberOfDocuments = await Poll.countDocuments(query);
  if (numberOfDocuments == 0) {
    throw new NotFoundError(`Polls not found`);
  }

  const numberOfPages =
    numberOfDocuments % limit === 0
      ? numberOfDocuments / limit
      : Math.ceil(numberOfDocuments / limit);
  if (page > numberOfPages) {
    throw new NotFoundError(`Page not found`);
  }

  pagination.resources = await Poll.find(query)
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

const findOnePoll = async (filter) => {
  const poll = await Poll.findOne(filter);
  if (poll == null) {
    throw new NotFoundError("Poll not found");
  }
  return poll;
};

const findManyPolls = async (filter) => {
  const polls = await Poll.find(filter).sort({ createdAt: "descending" });
  if (polls.length === 0) {
    throw new NotFoundError("Polls not found");
  }
  return polls;
};

const findOnePollAndUpdate = async (conditions, update, options) => {
  const poll = await Poll.findOneAndUpdate(conditions, update, options);
  if (poll == null) {
    throw new NotFoundError("Poll not found");
  }
  return poll;
};

const createPoll = async (title, options, creator) => {
  const poll = Poll.create({
    title: title,
    options: options,
    creator: creator,
  });

  return poll;
};

const deletePoll = async (pollId, userId) => {
  const deletedPoll = await Poll.findOneAndDelete({
    _id: pollId,
    creator: userId,
  });

  if (deletedPoll == null) {
    throw new ForbiddenError(`You are not allowed to delete this poll`);
  }

  return deletedPoll;
};

const deleteAllPolls = async () => {
  const deletedPolls = await Poll.deleteMany({});
  return deletedPolls;
};

const incrementVoteQuantity = async (pollId, optionId, incValue) => {
  const updatedPoll = await Poll.findOneAndUpdate(
    { pollId: pollId, "options._id": optionId },
    {
      $inc: { voteQuantity: incValue, "options.$.voteQuantity": incValue },
    },
    {
      returnOriginal: true,
    }
  );
  if (updatedPoll == null) {
    throw new NotFoundError("Poll not found");
  }
  return updatedPoll;
};

module.exports = {
  paginatePolls,
  findOnePoll,
  findManyPolls,
  findOnePollAndUpdate,
  createPoll,
  deletePoll,
  deleteAllPolls,
  incrementVoteQuantity,
};
