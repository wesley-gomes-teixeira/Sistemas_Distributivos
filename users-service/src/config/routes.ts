export {};
const userRoutes = require("../routes/userRoutes");

function registerRoutes(app): void {
  app.use("/", userRoutes);
}

module.exports = registerRoutes;
