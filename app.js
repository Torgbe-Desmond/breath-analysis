require("dotenv").config();

const express = require("express");
const connectDB = require("./server/config/db");
const cors = require("cors");
const { connectRedis } = require("./server/config/redis");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "https://breath-analysis-frontend.vercel.app",
    ],
    credentials: true,
  }),
);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// API routes
app.use("/categories", require("./server/routes/category.route"));
app.use("/questions", require("./server/routes/question.route"));
app.use("/responses", require("./server/routes/response.route"));
app.use("/feedbacks", require("./server/routes/feedback.route"));

// 404 then error handler (order matters)
app.use(require("./server/middleware/notFound"));
app.use(require("./server/middleware/errorMiddleware"));

const start = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set in the environment");
    }

    await connectDB(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Redis is optional — insights caching degrades gracefully without it
    try {
      await connectRedis();
    } catch (redisErr) {
      console.warn(
        "Redis not available (insights cache disabled):",
        redisErr.message,
      );
    }

    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`),
    );
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();
