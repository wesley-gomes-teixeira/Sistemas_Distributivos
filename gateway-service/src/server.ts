const app = require("./app");

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`Gateway Service rodando em http://localhost:${PORT}`);
});
