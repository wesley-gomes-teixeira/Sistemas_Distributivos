const express = require("express");
const registerRoutes = require("./config/routes");
import type { NextFunction, RequestLike, ResponseLike } from "./types";

const app = express();

app.use(express.json());

app.use((req: RequestLike, res: ResponseLike, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "gateway-service",
    message: "API Gateway do AssetFlow em execucao."
  });
});

registerRoutes(app);

module.exports = app;
