require("dotenv").config();
const database = require("./configs/mongoose.config");
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const usersRoutes = require("./api/routes/users.route");
app.use("/api/users", usersRoutes);
const authRoutes = require("./api/routes/auth.route");
app.use("/api", authRoutes);
const pollsRoutes = require("./api/routes/polls.route");
app.use("/api/polls", pollsRoutes);
const votesRoutes = require("./api/routes/votes.route");
app.use("/api/votes", votesRoutes);

const routeNotFound = require("./api/middlewares/routeNotFound.middleware");
app.use(routeNotFound);
const errorHandler = require("./api/middlewares/errorHandler.middleware");
app.use(errorHandler);

app.listen(3000, () => {
  console.log("listening on port 3000");
  database.connect();
});
