const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 8080);
const publicDir = path.join(__dirname, "..", "public");
const assetsDir = path.join(__dirname, "public");

function normalizeBaseUrl(value: string | undefined, fallback: string): string {
  return (value || fallback).trim().replace(/\/+$/, "");
}

app.get("/config.js", (_req, res) => {
  const gatewayBaseUrl = normalizeBaseUrl(process.env.GATEWAY_BASE_URL, "http://localhost:3000/api");
  const authBaseUrl = normalizeBaseUrl(process.env.AUTH_BASE_URL, "http://localhost:3000/auth");

  res.type("application/javascript");
  res.send(
    `window.__ASSETFLOW_CONFIG__ = ${JSON.stringify({
      gatewayBaseUrl,
      authBaseUrl
    })};`
  );
});

app.use(express.static(publicDir));
app.use("/assets", express.static(assetsDir));

app.listen(PORT, () => {
  console.log(`Frontend Service rodando em http://localhost:${PORT}`);
});
