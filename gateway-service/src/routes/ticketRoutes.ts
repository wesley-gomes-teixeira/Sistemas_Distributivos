export {};
const express = require("express");
const { forwardRequest } = require("../controllers/proxyController");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const { validateTicketPayload } = require("../middlewares/businessRulesMiddleware");

const router = express.Router();
const ticketsServiceUrl = process.env.TICKETS_SERVICE_URL || "http://localhost:3003";

router.get("/tickets", authorizeRoles("admin", "analyst", "viewer"), (req, res) =>
  forwardRequest(req, res, ticketsServiceUrl)
);
router.post("/tickets", authorizeRoles("admin", "analyst"), validateTicketPayload, (req, res) =>
  forwardRequest(req, res, ticketsServiceUrl)
);
router.put("/tickets/:id", authorizeRoles("admin", "analyst"), validateTicketPayload, (req, res) =>
  forwardRequest(req, res, ticketsServiceUrl)
);
router.delete("/tickets/:id", authorizeRoles("admin", "analyst"), (req, res) =>
  forwardRequest(req, res, ticketsServiceUrl)
);

module.exports = router;
