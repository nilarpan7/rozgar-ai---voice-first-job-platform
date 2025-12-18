import express from "express";
import cors from "cors";
import helmet from "helmet";

import { aiRouter } from "./routes/ai.routes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    // In development, reflect the request origin (allows any localhost port)
    origin: true,
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Rozgar AI backend is running. Frontend is on http://localhost:3000");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.use("/api/ai", aiRouter);

export { app };