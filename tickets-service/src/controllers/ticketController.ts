const ticketModel = require("../models/ticketModel");
const { publishEvent } = require("../config/rabbitmq");
import type { RequestLike, ResponseLike, TicketPayload } from "../types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

async function getTickets(_req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const tickets = await ticketModel.getAllTickets();
    return res.status(200).json(tickets);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao buscar chamados.",
      details: getErrorMessage(error)
    });
  }
}

async function createTicket(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const { title, description, status, assetId } = req.body as Partial<TicketPayload>;

    if (!title || !description || !status || assetId === undefined) {
      return res.status(400).json({
        message: "Os campos title, description, status e assetId sao obrigatorios."
      });
    }

    const ticket = await ticketModel.createTicket({
      title,
      description,
      status,
      assetId
    });

    await publishEvent("ticket.created", ticket);
    return res.status(201).json(ticket);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao criar chamado.",
      details: getErrorMessage(error)
    });
  }
}

async function updateTicket(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const { title, description, status, assetId } = req.body as Partial<TicketPayload>;

    if (!title || !description || !status || assetId === undefined) {
      return res.status(400).json({
        message: "Os campos title, description, status e assetId sao obrigatorios."
      });
    }

    const updatedTicket = await ticketModel.updateTicket(id, {
      title,
      description,
      status,
      assetId
    });

    if (!updatedTicket) {
      return res.status(404).json({
        message: "Chamado nao encontrado."
      });
    }

    await publishEvent("ticket.updated", updatedTicket);
    return res.status(200).json(updatedTicket);
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar chamado.",
      details: getErrorMessage(error)
    });
  }
}

async function deleteTicket(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const id = Number(req.params.id);
    const deletedTicket = await ticketModel.deleteTicket(id);

    if (!deletedTicket) {
      return res.status(404).json({
        message: "Chamado nao encontrado."
      });
    }

    await publishEvent("ticket.deleted", deletedTicket);

    return res.status(200).json({
      message: "Chamado removido com sucesso.",
      ticket: deletedTicket
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao remover chamado.",
      details: getErrorMessage(error)
    });
  }
}

async function markTicketsWithoutAsset(req: RequestLike, res: ResponseLike): Promise<ResponseLike> {
  try {
    const assetId = Number(req.params.assetId);

    if (Number.isNaN(assetId)) {
      return res.status(400).json({
        message: "O assetId informado e invalido."
      });
    }

    const impactedTickets = await ticketModel.markTicketsWithoutAsset(assetId);

    return res.status(200).json({
      message: "Chamados vinculados ao ativo foram atualizados com sucesso.",
      tickets: impactedTickets
    });
  } catch (error) {
    return res.status(500).json({
      message: "Erro ao atualizar chamados vinculados ao ativo.",
      details: getErrorMessage(error)
    });
  }
}

module.exports = {
  getTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  markTicketsWithoutAsset
};
