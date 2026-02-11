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

// CORS configuration for both development and production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ENV.CLIENT_URL,
  process.env.CLIENT_ORIGIN
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

/* ✅ SERVE FRONTEND (ALWAYS) */
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("*", (_, res) => {
  res.sendFile(
    path.join(__dirname, "../../frontend/dist/index.html")
  );
});

const PORT = ENV.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
