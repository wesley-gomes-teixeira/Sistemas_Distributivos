export {};
const express = require("express");
const registerRoutes = require("./config/routes");

const app = express();

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "tickets-service",
    message: "Microsserviço de chamados em execução."
  });
});

registerRoutes(app);

module.exports = app;
