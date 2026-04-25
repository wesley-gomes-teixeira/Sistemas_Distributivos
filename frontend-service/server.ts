const express = require("express");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 8080);

app.use(express.static(path.join(__dirname, "..", "public")));
app.use("/assets", express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Frontend Service rodando em http://localhost:${PORT}`);
});
