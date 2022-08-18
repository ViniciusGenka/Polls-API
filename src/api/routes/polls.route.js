const express = require("express");
const router = express.Router();

const pollsController = require("../controllers/polls.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/all", pollsController.paginateAllPolls);
router.get("/:id", pollsController.findOnePoll);
router.get("/", pollsController.findManyPolls);

router.post("/", auth, pollsController.createPoll);
router.delete("/all", pollsController.deleteAllPolls);
router.delete("/:id", auth, pollsController.deletePoll);

module.exports = router;
