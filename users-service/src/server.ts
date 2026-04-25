export {};
const app = require("./app");
const { initializeDatabase } = require("./config/db");
const { waitForRabbit } = require("./config/rabbitmq");

const PORT = Number(process.env.PORT || 3001);

async function startServer(): Promise<void> {
  await initializeDatabase();
  await waitForRabbit();

  app.listen(PORT, () => {
    console.log(`Users Service rodando em http://localhost:${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Falha ao iniciar o users-service:", error);
  process.exit(1);
});
