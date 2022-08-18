const express = require("express");
const router = express.Router();

const usersController = require("../controllers/users.controller");
const auth = require("../middlewares/auth.middleware");

router.get("/:id/public_votes", usersController.paginatePublicVotes);
router.get("/:id/private_votes", auth, usersController.paginatePrivateVotes);

//Get a list of polls created by a specific user
router.get("/:id/polls", usersController.paginateCreatedPolls);

//Get all users
router.get("/all", usersController.paginateAllUsers);
//Get one user by username
router.get("/by/username/:username", usersController.findOneUserByUsername);
//Get a list of users by username
router.get("/by", usersController.findManyUsersByUsername);

//Get one user by id
router.get("/:id", usersController.findOneUserById);
//Get a list of users by id
router.get("/", usersController.findManyUsersById);

router.post("/", usersController.createUser);
router.put("/", auth, usersController.updateUser);
router.delete("/", auth, usersController.deleteUser);
router.delete("/all", usersController.deleteAllUsers);

module.exports = router;
