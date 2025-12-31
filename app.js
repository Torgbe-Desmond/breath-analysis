require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require("method-override");
const connectDB = require("./server/config/db");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "https://breath-analysis-frontend.vercel.app",
    ],
    credentials: true,
  })
);

// Routes
app.use("/categories", require("./server/domain/Categories/controllers/index"));
app.use("/questions", require("./server/domain/Questions/controllers/index"));
app.use("/responses", require("./server/domain/Response/controllers/index"));

app.use(require("./server/middleware/errorMiddleware"));
app.use(require("./server/middleware/notFound"));
// Server

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Server is listening on port ${PORT}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
