import express from "express";
import env from "./config/env";
import { successResponse } from "./utils/apiResponse";
import { errorHandler } from "./middleware/errorHandler";

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

app.get("/error", (req, res) => {
  throw new Error("This is a test error.");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});