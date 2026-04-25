export {};
const ticketRoutes = require("../routes/ticketRoutes");

function registerRoutes(app): void {
  app.use("/", ticketRoutes);
}

module.exports = registerRoutes;
