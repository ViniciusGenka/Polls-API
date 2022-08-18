const pollsService = require("../services/polls.service");
const createPollValidation = require("../validations/createPoll.validation");
const BadRequestError = require("../errors/badRequest.error");

const paginateAllPolls = async (req, res, next) => {
  try {
    const page = Number.isNaN(Number(req.query.page))
      ? null
      : parseInt(req.query.page);
    const limit = Number.isNaN(Number(req.query.limit))
      ? null
      : parseInt(req.query.limit);

    const polls = await pollsService.paginatePolls(page, limit);
    res.json(polls);
  } catch (err) {
    next(err);
  }
};

const findOnePoll = async (req, res, next) => {
  try {
    const id = req.params.id;
    const poll = await pollsService.findOnePoll({ _id: id });
    res.json(poll);
  } catch (err) {
    next(err);
  }
};

const findManyPolls = async (req, res, next) => {
  try {
    const commaSeparatedIds = req.query.ids;
    if (commaSeparatedIds == null) {
      throw new BadRequestError('Request query "?ids=" not found');
    }

    const idsList = commaSeparatedIds.split(",");
    if (idsList.length > 100) {
      throw new BadRequestError("You cannot query more than 100 polls at once");
    }

    const polls = await pollsService.findManyPolls({ _id: { $in: idsList } });
    res.json(polls);
  } catch (err) {
    next(err);
  }
};

const createPoll = async (req, res, next) => {
  try {
    const { error, value } = createPollValidation.validate(req.body);
    if (error) {
      throw new BadRequestError(error.message);
    }

    const { title, options } = value;
    const creator = res.locals.payload["_id"];

    const newPoll = await pollsService.createPoll(title, options, creator);
    res.status(201).json(newPoll);
  } catch (err) {
    next(err);
  }
};

const deletePoll = async (req, res, next) => {
  try {
    const deletedPoll = await pollsService.deletePoll(
      req.params.id,
      res.locals.payload["_id"]
    );
    res.json(deletedPoll);
  } catch (err) {
    next(err);
  }
};

const deleteAllPolls = async (req, res, next) => {
  try {
    const result = await pollsService.deleteAllPolls();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  paginateAllPolls,
  findOnePoll,
  findManyPolls,
  createPoll,
  deletePoll,
  deleteAllPolls,
};
