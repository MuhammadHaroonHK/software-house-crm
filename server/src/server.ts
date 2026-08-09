import express from "express";
import env from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import path from "path";

const app = express();

const PORT = Number(env.PORT);

// Middlewares
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

// Routes
app.use("/", routes);

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});