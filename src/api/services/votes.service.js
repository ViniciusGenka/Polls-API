const Vote = require("../models/vote.model");
const pollsService = require("./polls.service");
const hashUserId = require("../helpers/hashUserId.helper");
const BadRequestError = require("../errors/badRequest.error");
const NotFoundError = require("../errors/notFound.error");

const paginateVotes = async (page, limit, query) => {
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
    throw new BadRequestError(`You cannot query more than 100 votes at once`);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const sort = { updatedAt: "descending" };
  const pagination = {};

  const numberOfDocuments = await Vote.countDocuments(query);
  if (numberOfDocuments == 0) {
    throw new NotFoundError(`Votes not found`);
  }

  const numberOfPages =
    numberOfDocuments % limit === 0
      ? numberOfDocuments / limit
      : Math.ceil(numberOfDocuments / limit);
  if (page > numberOfPages) {
    throw new NotFoundError(`Page not found`);
  }

  pagination.resources = await Vote.find(query)
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

const findOneVote = async (filter) => {
  const vote = await Vote.findOne(filter);
  if (vote == null) {
    throw new NotFoundError("Vote not found");
  }
  return vote;
};

const findManyVotes = async (filter) => {
  const votes = await Vote.find(filter);
  if (votes.length === 0) {
    throw new NotFoundError("Votes not found");
  }
  return votes;
};

const createVoteDocument = async (userId, pollId, optionId, voteVisibility) => {
  const hashedUserId = hashUserId(userId);
  let vote = await Vote.create({
    userId: hashedUserId,
    pollId: pollId,
    optionId: optionId,
    voteVisibility: voteVisibility,
  });

  vote = vote.toObject();
  delete vote.userId;

  return vote;
};

const updateVoteDocument = async (filter, update, options) => {
  const updatedVote = await Vote.findOneAndUpdate(filter, update, options);

  if (updatedVote == null) {
    throw new NotFoundError("Vote not found");
  }

  return updatedVote;
};

const deleteManyVoteDocuments = async (filter) => {
  const deletedVote = await Vote.deleteMany(filter);
  return deletedVote;
};

const deleteAllVotes = async () => {
  const deletedVotes = await Vote.deleteMany();
  return deletedVotes;
};

const vote = async (pollId, optionId, userId, voteVisibility) => {
  const checkIfPollAndOptionExists = await pollsService.findOnePoll({
    _id: pollId,
    "options._id": optionId,
  });

  const hashedUserId = hashUserId(userId);
  const userAlreadyVoted = await Vote.findOne({
    userId: hashedUserId,
    pollId: pollId,
  });

  if (userAlreadyVoted == null) {
    const voteDocument = await createVoteDocument(
      userId,
      pollId,
      optionId,
      voteVisibility
    );

    await pollsService.incrementVoteQuantity(pollId, optionId, 1);

    return voteDocument;
  }

  const update = {};

  if (
    userAlreadyVoted.optionId === optionId &&
    userAlreadyVoted.voteVisibility === voteVisibility
  ) {
    throw new BadRequestError("Your vote has already been accounted");
  }

  if (userAlreadyVoted.optionId !== optionId) {
    update["optionId"] = optionId;
    await pollsService.incrementVoteQuantity(
      userAlreadyVoted.pollId,
      userAlreadyVoted.optionId,
      -1
    );
  }

  if (userAlreadyVoted.voteVisibility !== voteVisibility) {
    update["voteVisibility"] = voteVisibility;
  }

  const updatedVote = await updateVoteDocument(
    { userId: hashedUserId, pollId: pollId },
    update,
    {
      returnOriginal: false,
    }
  );

  if (userAlreadyVoted.optionId !== optionId) {
    await pollsService.incrementVoteQuantity(pollId, optionId, 1);
  }

  return updatedVote;
};

const unvote = async (hashedUserId, pollId) => {
  // const deletedVote = await deleteVoteDocument({
  //   _id: voteId,
  // });
  const deletedVote = Vote.findOneAndDelete({
    userId: hashedUserId,
    pollId: pollId,
  });

  if (deletedVote == null) {
    throw new NotFoundError("Vote not found");
  }

  await pollsService.incrementVoteQuantity(
    deletedVote.pollId,
    deletedVote.optionId,
    -1
  );

  return deletedVote;
};

module.exports = {
  paginateVotes,
  findOneVote,
  findManyVotes,
  deleteManyVoteDocuments,
  deleteAllVotes,
  vote,
  unvote,
};
