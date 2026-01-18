require("dotenv").config();

const express = require("express");
const connectDB = require("./server/config/db");
const cors = require("cors");
const { connectRedis } = require("./server/config/redis");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    // origin:"*",
    origin: [
      "http://localhost:3001",
      "https://breath-analysis-frontend.vercel.app",
    ],
    credentials: true,
  })
);

// Routes
app.use("/categories", require("./server/domain/Categories/routes/index"));
app.use("/questions", require("./server/domain/Questions/routes/index"));
app.use("/responses", require("./server/domain/Response/routes/index"));
app.use("/feedbacks", require("./server/domain/Feedback/routes/index"));
app.use("/posts", require("./server/domain/Posts/routes/index"));

app.use(require("./server/middleware/errorMiddleware"));
app.use(require("./server/middleware/notFound"));
// Server

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Connect Redis once
    await connectRedis();

    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.error(error);
  }
};

start();
