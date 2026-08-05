import express from "express";
import env from "./config/env";
import { successResponse } from "./utils/apiResponse";

const app = express();

const PORT = Number(env.PORT);

app.get("/", (req, res) => {
  return successResponse(
    res,
    "Software House CRM API is running.",
    {
      version: "1.0.0",
      status: "OK",
    }
  );
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});