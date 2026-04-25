export {};
const userRoutes = require("../routes/userRoutes");
const assetRoutes = require("../routes/assetRoutes");
const ticketRoutes = require("../routes/ticketRoutes");
const authRoutes = require("../routes/authRoutes");
const { authenticateToken } = require("../middlewares/authMiddleware");

function registerRoutes(app): void {
  app.use("/", authRoutes);
  app.use("/api", authenticateToken);
  app.use("/api", userRoutes);
  app.use("/api", assetRoutes);
  app.use("/api", ticketRoutes);
}

module.exports = registerRoutes;
