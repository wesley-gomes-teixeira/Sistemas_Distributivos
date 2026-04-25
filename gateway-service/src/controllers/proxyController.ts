import type { RequestLike, ResponseLike } from "../types";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Erro inesperado.";
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
