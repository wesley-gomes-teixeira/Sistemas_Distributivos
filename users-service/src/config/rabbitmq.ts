export {};
const amqp = require("amqplib");

const exchangeName = "assetflow.events";
let channel: any;

async function waitForRabbit(maxRetries = 20, delayMs = 3000): Promise<void> {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost:5672";

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const connection = await amqp.connect(rabbitUrl);
      const createdChannel = await connection.createChannel();
      await createdChannel.assertExchange(exchangeName, "topic", { durable: true });
      channel = createdChannel;
      return;
    } catch (error) {
      console.log(`Aguardando rabbitmq ficar pronto (${attempt}/${maxRetries})...`);

      if (attempt === maxRetries) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function publishEvent(routingKey: string, payload: unknown): Promise<void> {
  if (!channel) {
    throw new Error("Canal RabbitMQ ainda nao inicializado.");
  }

  channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(payload)), {
    persistent: true
  });
}

module.exports = {
  waitForRabbit,
  publishEvent
};
