const votesService = require("../services/votes.service");
const hashUserId = require("../helpers/hashUserId.helper");
const createVoteValidation = require("../validations/createVote.validation");
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

    const commaSeparatedIds = req.query.ids;
    if (commaSeparatedIds == null) {
      throw new BadRequestError(`You must provide at least one ID`);
    }

    const idsList = commaSeparatedIds.split(",");
    const query = { _id: { $in: idsList }, voteVisibility: "public" };

    const publicVotes = await votesService.paginateVotes(page, limit, query);
    res.json(publicVotes);
  } catch (err) {
    next(err);
  }
};

// const findOneVote = async (req, res, next) => {
//   try {
//     const voteId = req.params.id;

//     const vote = await votesService.findOneVote({
//       _id: voteId,
//       voteVisibility: "public",
//     });

//     res.json(vote);
//   } catch (err) {
//     next(err);
//   }
// };

// const findManyVotes = async (req, res, next) => {
//   try {
//     const commaSeparatedIds = req.query.ids;
//     const idsList = commaSeparatedIds.split(",");

//     const votes = await votesService.findManyVotes({
//       _id: { $in: idsList },
//       voteVisibility: "public",
//     });

//     res.json(votes);
//   } catch (err) {
//     next(err);
//   }
// };

const findOneVote = (query) => {
  return async (req, res, next) => {
    try {
      const voteId = req.params.id;
      query["_id"] = voteId;

      const vote = await votesService.findOneVote(query);

      res.json(vote);
    } catch (err) {
      next(err);
    }
  };
};

const findManyVotes = (query) => {
  return async (req, res, next) => {
    try {
      const commaSeparatedIds = req.query.ids;
      const idsList = commaSeparatedIds.split(",");

      query["_id"] = { $in: idsList };

      const votes = await votesService.findManyVotes(query);

      res.json(votes);
    } catch (err) {
      next(err);
    }
  };
};

const vote = async (req, res, next) => {
  try {
    const { error, value } = createVoteValidation.validate(req.body);
    if (error) {
      throw new BadRequestError(error.message);
    }

    const userId = res.locals.payload["_id"];
    const { pollId, optionId, voteVisibility } = value;

    const updatedPoll = await votesService.vote(
      pollId,
      optionId,
      userId,
      voteVisibility
    );

    res.status(201).json(updatedPoll);
  } catch (err) {
    next(err);
  }
};

const unvote = async (req, res, next) => {
  try {
    // const voteId = req.params.id;
    // const voteDocument = await votesService.findOneVote({ _id: voteId });
    const hashedUserId = hashUserId(res.locals.payload["_id"]);
    const pollId = req.params.id;

    // if (hashedUserId !== voteDocument.userId) {
    //   throw new ForbiddenError("You are not allowed to unvote this poll");
    // }

    const deletedVote = await votesService.unvote(hashedUserId, pollId);
    res.json(deletedVote);
  } catch (err) {
    next(err);
  }
};

const deleteAllVotes = async (req, res, next) => {
  try {
    const deletedVotes = await votesService.deleteAllVotes();
    res.json(deletedVotes);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  paginatePublicVotes,
  findOneVote,
  findManyVotes,
  vote,
  unvote,
  deleteAllVotes,
};
