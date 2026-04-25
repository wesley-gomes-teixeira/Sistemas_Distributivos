export {};
const app = require("./app");
const { initializeDatabase } = require("./config/db");
const { waitForRabbit } = require("./config/rabbitmq");
const { startUserEventsConsumer } = require("./consumers/userEventsConsumer");

const PORT = Number(process.env.PORT || 3002);

async function startServer(): Promise<void> {
  await initializeDatabase();
  await waitForRabbit();
  await startUserEventsConsumer();

  app.listen(PORT, () => {
    console.log(`Assets Service rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Falha ao iniciar o assets-service:", error);
  process.exit(1);
});
