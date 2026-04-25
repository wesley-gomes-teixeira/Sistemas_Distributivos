export {};
const assetRoutes = require("../routes/assetRoutes");

function registerRoutes(app): void {
  app.use("/", assetRoutes);
}

module.exports = registerRoutes;
