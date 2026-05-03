export {};
const assetModel = require("../models/assetModel");
const { subscribeToEvent } = require("../config/rabbitmq");

async function startUserEventsConsumer(): Promise<void> {
  await subscribeToEvent("assets-service.user.deleted", "user.deleted", async (user) => {
    const impactedAssets = await assetModel.unassignAssetsFromUser(user.id);

    if (impactedAssets.length > 0) {
      console.log(
        `Assets Service atualizou ${impactedAssets.length} ativo(s) apos remoção do usuario ${user.id}.`
      );
    }
  });
}

module.exports = {
  startUserEventsConsumer
};
