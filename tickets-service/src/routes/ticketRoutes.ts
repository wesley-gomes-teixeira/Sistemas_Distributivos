export {};
const express = require("express");
const ticketController = require("../controllers/ticketController");

const router = express.Router();

router.get("/tickets", ticketController.getTickets);
router.post("/tickets", ticketController.createTicket);
router.put("/tickets/:id", ticketController.updateTicket);
router.delete("/tickets/:id", ticketController.deleteTicket);

module.exports = router;
