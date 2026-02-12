import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());

// CORS only for development
if (ENV.NODE_ENV !== 'production') {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  }));
}

// API routes BEFORE static files
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Serve frontend static files in production
if (ENV.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, "../../frontend/dist");
  
  app.use(express.static(frontendPath));

  // Handle client-side routing - send all non-API requests to index.html
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

const PORT = ENV.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});