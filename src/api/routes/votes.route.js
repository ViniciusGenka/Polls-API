const express = require("express");
const router = express.Router();
const votesController = require("../controllers/votes.controller");
const auth = require("../middlewares/auth.middleware");

router.get(
  "/public/:id",
  votesController.findOneVote({ voteVisibility: "public" })
);
router.get(
  "/public",
  votesController.findManyVotes({ voteVisibility: "public" })
);

router.get(
  "/private/:id",
  auth,
  votesController.findOneVote({ voteVisibility: "private" })
);
router.get(
  "/private",
  auth,
  votesController.findManyVotes({ voteVisibility: "private" })
);

router.post("/", auth, votesController.vote);
router.delete("/all", votesController.deleteAllVotes);
router.delete("/:id", auth, votesController.unvote);

module.exports = router;
