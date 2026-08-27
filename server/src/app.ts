import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/api", routes);

app.use(errorHandler);

export default app;