import express from "express";

import prisma from "./lib/prisma";

async function testConnection() {
  await prisma.$connect();
  console.log("✅ Prisma connected successfully");
}

testConnection();

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Software House CRM API is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});