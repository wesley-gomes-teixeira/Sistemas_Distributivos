export {};
const express = require("express");
const ticketController = require("../controllers/ticketController");

const router = express.Router();

router.get("/tickets", ticketController.getTickets);
router.post("/tickets", ticketController.createTicket);
router.put("/tickets/:id", ticketController.updateTicket);
router.delete("/tickets/:id", ticketController.deleteTicket);
router.post("/internal/assets/:assetId/mark-without-asset", ticketController.markTicketsWithoutAsset);

module.exports = router;
