const { getUsers, getAssets, getTickets } = require("../services/domainService");
import type { NextFunction, RequestLike, ResponseLike, ServiceError } from "../types";

const allowedAssetStatuses = [
  "disponivel",
  "em uso",
  "em manutencao",
  "reservado",
  "pendente de reassociacao",
  "desativado"
];

const allowedTicketStatuses = [
  "aberto",
  "em andamento",
  "aguardando ativo",
  "resolvido",
  "fechado"
];

function normalizeStatus(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

async function validateAssetPayload(
  req: RequestLike,
  res: ResponseLike,
  next: NextFunction
): Promise<ResponseLike | void> {
  try {
    const { name, type, status, userId } = req.body;

    if (!name || !type || !status || userId === undefined) {
      return res.status(400).json({
        message: "Os campos name, type, status e userId sao obrigatorios."
      });
    }

    if (!allowedAssetStatuses.includes(normalizeStatus(status))) {
      return res.status(400).json({
        message: "O status informado para o ativo e invalido."
      });
    }

    const users = await getUsers();
    const userExists = users.some((user) => user.id === Number(userId));

    if (!userExists) {
      return res.status(400).json({
        message: "O usuario informado para o ativo nao existe."
      });
    }

    return next();
  } catch (error) {
    const serviceError = error as ServiceError;

    return res.status(serviceError.status || 500).json({
      message: serviceError.message
    });
  }
}

async function validateTicketPayload(
  req: RequestLike,
  res: ResponseLike,
  next: NextFunction
): Promise<ResponseLike | void> {
  try {
    const { title, description, status, assetId } = req.body;

    if (!title || !description || !status || assetId === undefined) {
      return res.status(400).json({
        message: "Os campos title, description, status e assetId sao obrigatorios."
      });
    }

    if (!allowedTicketStatuses.includes(normalizeStatus(status))) {
      return res.status(400).json({
        message: "O status informado para o chamado e invalido."
      });
    }

    const assets = await getAssets();
    const assetExists = assets.some((asset) => asset.id === Number(assetId));

    if (!assetExists) {
      return res.status(400).json({
        message: "O ativo informado para o chamado nao existe."
      });
    }

    return next();
  } catch (error) {
    const serviceError = error as ServiceError;

    return res.status(serviceError.status || 500).json({
      message: serviceError.message
    });
  }
}

async function ensureUserDeleteAllowed(
  req: RequestLike,
  res: ResponseLike,
  next: NextFunction
): Promise<ResponseLike | void> {
  try {
    const userId = Number(req.params.id);
    const force = req.query.force === "true";
    const assets = await getAssets();
    const hasLinkedAssets = assets.some((asset) => Number(asset.userId) === userId);

    if (hasLinkedAssets && !force) {
      return res.status(409).json({
        message: "Este usuario possui ativos vinculados. Confirme a exclusao para prosseguir."
      });
    }

    return next();
  } catch (error) {
    const serviceError = error as ServiceError;

    return res.status(serviceError.status || 500).json({
      message: serviceError.message
    });
  }
}

async function ensureAssetDeleteAllowed(
  req: RequestLike,
  res: ResponseLike,
  next: NextFunction
): Promise<ResponseLike | void> {
  try {
    const assetId = Number(req.params.id);
    const force = req.query.force === "true";
    const tickets = await getTickets();
    const hasLinkedTickets = tickets.some((ticket) => Number(ticket.assetId) === assetId);

    if (hasLinkedTickets && !force) {
      return res.status(409).json({
        message: "Este ativo possui chamados vinculados. Confirme a exclusao para prosseguir."
      });
    }

    return next();
  } catch (error) {
    const serviceError = error as ServiceError;

    return res.status(serviceError.status || 500).json({
      message: serviceError.message
    });
  }
}

module.exports = {
  validateAssetPayload,
  validateTicketPayload,
  ensureUserDeleteAllowed,
  ensureAssetDeleteAllowed
};
