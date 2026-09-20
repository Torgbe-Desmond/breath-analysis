require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./server/config/db");
const { connectRedis } = require("./server/config/redis");
const notFound = require("./server/middleware/notFound");
const errorMiddleware = require("./server/middleware/errorMiddleware");

const app = express();
const PORT = process.env.PORT || 4000;

app.set("trust proxy", 1); // real client IP behind Render/Railway/Heroku

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Only needed when the frontend is on a different origin (Vite dev server, a separate Vercel site).
// Example: CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/health", (req, res) => res.json({ ok: true }));

// API: everything lives under /api, so it can never clash with a React route.
const api = express.Router();
api.use("/categories", require("./server/routes/category.route"));
api.use("/questions", require("./server/routes/question.route"));
api.use("/responses", require("./server/routes/response.route"));
api.use("/feedbacks", require("./server/routes/feedback.route"));
app.use("/api", api);
app.use("/api", notFound); // unknown API URLs get your JSON 404, never index.html

// React build (make sure your deploy step puts Vite's `dist` output here, or set build.outDir)
const buildDir = path.join(__dirname, "build");
app.use(
  express.static(buildDir, {
    index: false,
    maxAge: "1y", // Vite's files under /assets have hashed names
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html"))
        res.setHeader("Cache-Control", "no-cache");
    },
  }),
);

// Any other GET is a React route. This is a plain middleware, so it works on Express 4 and 5.
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") return next();
  res
    .set("Cache-Control", "no-cache")
    .sendFile(path.join(buildDir, "index.html"), (err) => err && next(err));
});

app.use(notFound);
app.use(errorMiddleware);

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set in the environment");
    }

    await connectDB(process.env.MONGO_URI);
    console.log("MongoDB connected");

    try {
      await connectRedis();
    } catch (redisErr) {
      console.warn(
        "Redis not available (insights cache disabled):",
        redisErr.message,
      );
    }

    const server = app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`),
    );

    process.on("SIGTERM", () => {
      console.log("Shutting down...");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
