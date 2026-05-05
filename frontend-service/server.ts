const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 8080);
const publicDir = path.join(__dirname, "..", "public");
const assetsDir = path.join(__dirname, "public");
const gatewayOrigin = (process.env.INTERNAL_GATEWAY_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  return (value || fallback).trim().replace(/\/+$/, "");
}

async function proxyToGateway(req, res, targetPath: string): Promise<void> {
  try {
    const headers: Record<string, string> = {};

    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }

    if (req.headers["content-type"]) {
      headers["Content-Type"] = req.headers["content-type"];
    }

    const requestOptions: Record<string, unknown> = {
      method: req.method,
      headers
    };

    if (!["GET", "HEAD"].includes(req.method)) {
      requestOptions.body = JSON.stringify(req.body || {});
    }

    const response = await fetch(`${gatewayOrigin}${targetPath}`, requestOptions);
    const contentType = response.headers.get("content-type") || "application/json";
    const body = await response.text();

    res.status(response.status);
    res.type(contentType);
    res.send(body);
  } catch (error) {
    res.status(502).json({
      message: "Erro ao comunicar com o gateway interno.",
      details: error instanceof Error ? error.message : "Erro inesperado."
    });
  }
}

app.use(express.json());

app.get("/config.js", (_req, res) => {
  const gatewayBaseUrl = normalizeBaseUrl(process.env.GATEWAY_BASE_URL, "/api");
  const authBaseUrl = normalizeBaseUrl(process.env.AUTH_BASE_URL, "/auth");

  res.type("application/javascript");
  res.send(
    `window.__ASSETFLOW_CONFIG__ = ${JSON.stringify({
      gatewayBaseUrl,
      authBaseUrl
    })};`
  );
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    service: "assetflow-web",
    status: "ok"
  });
});

app.all("/api/*", (req, res) => proxyToGateway(req, res, req.originalUrl));
app.all("/auth/*", (req, res) => proxyToGateway(req, res, req.originalUrl));

app.use(express.static(publicDir));
app.use("/assets", express.static(assetsDir));

app.listen(PORT, () => {
  console.log(`Frontend Service rodando em http://localhost:${PORT}`);
});
