const assetModel = require("../models/assetModel");
const { publishEvent } = require("../config/rabbitmq");
import type { AssetPayload, RequestLike, ResponseLike } from "../types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

async function getAssets(_req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const assets = await assetModel.getAllAssets();
    return res.status(200).json(assets);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar ativos.",
      details: getErrorMessage(error)
    });
  }
}

async function createAsset(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { name, type, status, userId } = req.body as Partial<AssetPayload>;

    if (!name || !type || !status || userId === undefined) {
      return res.status(400).json({
        message: "Os campos name, type, status e userId sao obrigatorios."
      });
    }

    const asset = await assetModel.createAsset({ name, type, status, userId });
    await publishEvent("asset.created", asset);
    return res.status(201).json(asset);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar ativo.",
      details: getErrorMessage(error)
    });
  }
}

async function updateAsset(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const { name, type, status, userId } = req.body as Partial<AssetPayload>;

    if (!name || !type || !status || userId === undefined) {
      return res.status(400).json({
        message: "Os campos name, type, status e userId sao obrigatorios."
      });
    }

    const updatedAsset = await assetModel.updateAsset(id, {
      name,
      type,
      status,
      userId
    });

    if (!updatedAsset) {
      return res.status(404).json({
        message: "Ativo nao encontrado."
      });
    }

    await publishEvent("asset.updated", updatedAsset);
    return res.status(200).json(updatedAsset);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar ativo.",
      details: getErrorMessage(error)
    });
  }
}

async function deleteAsset(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const deletedAsset = await assetModel.deleteAsset(id);

    if (!deletedAsset) {
      return res.status(404).json({
        message: "Ativo nao encontrado."
      });
    }

    await publishEvent("asset.deleted", deletedAsset);

    return res.status(200).json({
      message: "Ativo removido com sucesso.",
      asset: deletedAsset
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover ativo.",
      details: getErrorMessage(error)
    });
  }
}

async function unassignAssetsFromUser(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        message: "O userId informado e invalido."
      });
    }

    const impactedAssets = await assetModel.unassignAssetsFromUser(userId);

    return res.status(200).json({
      message: "Ativos vinculados ao usuario foram atualizados com sucesso.",
      assets: impactedAssets
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar ativos vinculados ao usuario.",
      details: getErrorMessage(error)
    });
  }
}

module.exports = {
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
  unassignAssetsFromUser
};
