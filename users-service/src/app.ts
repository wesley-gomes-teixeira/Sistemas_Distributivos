export {};
const express = require("express");
const registerRoutes = require("./config/routes");

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "users-service",
    message: "Microsservico de usuarios em execucao."
  });
});

registerRoutes(app);

module.exports = app;
