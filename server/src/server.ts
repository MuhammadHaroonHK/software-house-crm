import express from "express";
import env from "./config/env";

const app = express();

const PORT = Number(env.PORT);

app.get("/", (req, res) => {
  res.send("Software House CRM API is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});