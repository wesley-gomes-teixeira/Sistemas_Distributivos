const pool = require("../config/db");
import type { Ticket, TicketPayload } from "../types";

async function getAllTickets(): Promise<Ticket[]> {
  const result = await pool.query(
    "SELECT id, title, description, status, \"assetId\" FROM tickets ORDER BY id ASC"
  );
  return result.rows;
}

async function createTicket(data: TicketPayload): Promise<Ticket> {
  const result = await pool.query(
    "INSERT INTO tickets (title, description, status, \"assetId\") VALUES ($1, $2, $3, $4) RETURNING id, title, description, status, \"assetId\"",
    [data.title, data.description, data.status, data.assetId]
  );

  return result.rows[0];
}

async function updateTicket(id: number, data: TicketPayload): Promise<Ticket | null> {
  const result = await pool.query(
    "UPDATE tickets SET title = $1, description = $2, status = $3, \"assetId\" = $4 WHERE id = $5 RETURNING id, title, description, status, \"assetId\"",
    [data.title, data.description, data.status, data.assetId, id]
  );

  return result.rows[0] || null;
}

async function deleteTicket(id: number): Promise<Ticket | null> {
  const result = await pool.query(
    "DELETE FROM tickets WHERE id = $1 RETURNING id, title, description, status, \"assetId\"",
    [id]
  );

  return result.rows[0] || null;
}

async function markTicketsWithoutAsset(assetId: number): Promise<Ticket[]> {
  const result = await pool.query(
    `UPDATE tickets
     SET "assetId" = NULL, status = $1
     WHERE "assetId" = $2
     RETURNING id, title, description, status, "assetId"`,
    ["aguardando ativo", assetId]
  );

  return result.rows;
}

module.exports = {
  getAllTickets,
  createTicket,
  updateTicket,
  deleteTicket,
  markTicketsWithoutAsset
};
