export {};
const express = require("express");
const { forwardRequest } = require("../controllers/proxyController");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const { ensureUserDeleteAllowed } = require("../middlewares/businessRulesMiddleware");

const router = express.Router();
const usersServiceUrl = process.env.USERS_SERVICE_URL || "http://localhost:3001";

router.get("/users", authorizeRoles("admin", "analyst", "user"), (req, res) =>
  forwardRequest(req, res, usersServiceUrl)
);
router.post("/users", authorizeRoles("admin"), (req, res) =>
  forwardRequest(req, res, usersServiceUrl)
);
router.put("/users/:id", authorizeRoles("admin"), (req, res) =>
  forwardRequest(req, res, usersServiceUrl)
);
router.delete("/users/:id", authorizeRoles("admin"), ensureUserDeleteAllowed, (req, res) =>
  forwardRequest(req, res, usersServiceUrl)
);

module.exports = router;
