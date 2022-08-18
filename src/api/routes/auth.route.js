const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

router.post("/login", authController.authenticateUser);
router.get("/tokens", authController.refreshTokens);
router.get("/logout", authController.deauthenticateUser);

module.exports = router;
