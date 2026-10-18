
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";

import { apiLimiter } from "./middleware/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 5002;

// Check essential environment configuration.
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  throw new Error(
    "DATABASE_URL and JWT_SECRET must be configured"
  );
}

// Railway operates behind a reverse proxy.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Add security-related HTTP response headers.
app.use(helmet());

// Restrict cross-origin browser requests.
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
).split(",").map((url) => url.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Permit non-browser requests and approved origins.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
  })
);

// Accept JSON only within the assignment size limit.
app.use(express.json({ limit: "10kb" }));

// Limit overall API traffic.
app.use("/api", apiLimiter);

// Health check for local and deployed environments.
app.get("/", (req, res) => {
  res.json({
    message: "Secure Notes API is running",
    status: "OK",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Register API routes.
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Handle unknown endpoints.
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Centralized error handler.
app.use((error, req, res, next) => {
  if (error.message === "CORS origin not allowed") {
    return res.status(403).json({
      message: "Origin not allowed",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body exceeds 10kb limit",
    });
  }

  console.error(error);

  return res.status(500).json({
    message: "Internal server error",
  });
});

// Start listening for incoming requests.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local API: http://localhost:${PORT}`);
});
