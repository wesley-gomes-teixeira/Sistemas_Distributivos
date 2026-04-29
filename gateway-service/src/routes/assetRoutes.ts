export {};
const express = require("express");
const { forwardRequest } = require("../controllers/proxyController");
const { authorizeRoles } = require("../middlewares/authorizationMiddleware");
const {
  validateAssetPayload,
  ensureAssetDeleteAllowed
} = require("../middlewares/businessRulesMiddleware");

const router = express.Router();
const assetsServiceUrl = process.env.ASSETS_SERVICE_URL || "http://localhost:3002";

router.get("/assets", authorizeRoles("admin", "analyst", "user"), (req, res) =>
  forwardRequest(req, res, assetsServiceUrl)
);
router.post("/assets", authorizeRoles("admin", "analyst"), validateAssetPayload, (req, res) =>
  forwardRequest(req, res, assetsServiceUrl)
);
router.put("/assets/:id", authorizeRoles("admin", "analyst"), validateAssetPayload, (req, res) =>
  forwardRequest(req, res, assetsServiceUrl)
);
router.delete("/assets/:id", authorizeRoles("admin", "analyst"), ensureAssetDeleteAllowed, (req, res) =>
  forwardRequest(req, res, assetsServiceUrl)
);

module.exports = router;
