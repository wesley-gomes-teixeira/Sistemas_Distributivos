import type { RequestLike, ResponseLike } from "../types";

function getServiceUrls() {
  return {
    users: process.env.USERS_SERVICE_URL || "http://localhost:3001",
    assets: process.env.ASSETS_SERVICE_URL || "http://localhost:3002",
    tickets: process.env.TICKETS_SERVICE_URL || "http://localhost:3003"
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
}

async function postJson(url: string, body: Record<string, unknown> = {}): Promise<void> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json() : await response.text();
    const message =
      typeof payload === "string" ? payload : payload.message || "Falha ao executar atualizacao interna.";

    throw new Error(message);
  }
}

async function runSynchronousSideEffects(req: RequestLike): Promise<void> {
  const { assets, tickets } = getServiceUrls();

  if (req.method === "DELETE" && /^\/api\/users\/\d+/.test(req.originalUrl)) {
    await postJson(`${assets}/internal/users/${req.params.id}/unassign-assets`);
  }

  if (req.method === "DELETE" && /^\/api\/assets\/\d+/.test(req.originalUrl)) {
    await postJson(`${tickets}/internal/assets/${req.params.id}/mark-without-asset`);
  }
}

async function forwardRequest(
  req: RequestLike,
  res: ResponseLike,
  targetBaseUrl: string
): Promise<ResponseLike> {
  try {
    const targetUrl = `${targetBaseUrl}${req.originalUrl.replace("/api", "")}`;

    const options: Record<string, unknown> = {
      method: req.method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    if (req.headers.authorization) {
      (options.headers as Record<string, string>).Authorization = req.headers.authorization;
    }

    if (req.method !== "GET" && req.method !== "DELETE") {
      options.body = JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, options);
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (response.ok) {
      await runSynchronousSideEffects(req);
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(502).json({
      message: "Erro ao comunicar com um microsservico.",
      details: getErrorMessage(error)
    });
  }
}

module.exports = {
  forwardRequest
};
