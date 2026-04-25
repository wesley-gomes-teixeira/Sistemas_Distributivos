export {};
const ticketModel = require("../models/ticketModel");
const { subscribeToEvent } = require("../config/rabbitmq");

async function startAssetEventsConsumer(): Promise<void> {
  await subscribeToEvent("tickets-service.asset.deleted", "asset.deleted", async (asset) => {
    const impactedTickets = await ticketModel.markTicketsWithoutAsset(asset.id);

    if (impactedTickets.length > 0) {
      console.log(
        `Tickets Service atualizou ${impactedTickets.length} chamado(s) apos remocao do ativo ${asset.id}.`
      );
    }
  });
}

module.exports = {
  startAssetEventsConsumer
};
