export {};
const app = require("./app");
const { initializeDatabase } = require("./config/db");
const { waitForRabbit } = require("./config/rabbitmq");
const { startAssetEventsConsumer } = require("./consumers/assetEventsConsumer");

const PORT = Number(process.env.PORT || 3003);

async function startServer(): Promise<void> {
  await initializeDatabase();
  await waitForRabbit();
  await startAssetEventsConsumer();

  app.listen(PORT, () => {
    console.log(`Tickets Service rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Falha ao iniciar o tickets-service:", error);
  process.exit(1);
});
