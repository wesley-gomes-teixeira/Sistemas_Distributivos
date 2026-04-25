export {};
const express = require("express");
const assetController = require("../controllers/assetController");

const router = express.Router();

router.get("/assets", assetController.getAssets);
router.post("/assets", assetController.createAsset);
router.put("/assets/:id", assetController.updateAsset);
router.delete("/assets/:id", assetController.deleteAsset);

module.exports = router;
