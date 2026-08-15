import express from "express";
import env from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import path from "path";
import cors from "cors";

const app = express();

const PORT = Number(env.PORT);

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middlewares
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Routes
app.use("/api", routes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});