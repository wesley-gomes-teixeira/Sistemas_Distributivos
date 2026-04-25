import type { Asset, AuthenticatedUser, ServiceError, Ticket } from "../types";

async function requestJson(baseUrl: string, path: string, options: Record<string, unknown> = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Falha ao consultar servico.") as ServiceError;
    error.status = response.status;
    throw error;
  }

  return data;
}

function getServiceUrls() {
  return {
    users: process.env.USERS_SERVICE_URL || "http://localhost:3001",
    assets: process.env.ASSETS_SERVICE_URL || "http://localhost:3002",
    tickets: process.env.TICKETS_SERVICE_URL || "http://localhost:3003"
  };
}

async function getUsers(): Promise<AuthenticatedUser[]> {
  const { users } = getServiceUrls();
  return requestJson(users, "/users");
}

async function getAssets(): Promise<Asset[]> {
  const { assets } = getServiceUrls();
  return requestJson(assets, "/assets");
}

async function getTickets(): Promise<Ticket[]> {
  const { tickets } = getServiceUrls();
  return requestJson(tickets, "/tickets");
}

module.exports = {
  getUsers,
  getAssets,
  getTickets
};
