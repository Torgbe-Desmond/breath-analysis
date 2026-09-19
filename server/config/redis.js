const { createClient } = require("redis");
require("dotenv").config();

const hasRedisConfig =
  process.env.REDIS_HOST &&
  process.env.REDIS_PORT &&
  process.env.REDIS_PASSWORD;

const redisClient = createClient(
  hasRedisConfig
    ? {
        username: process.env.REDIS_USERNAME || "default",
        password: process.env.REDIS_PASSWORD,
        socket: {
          host: process.env.REDIS_HOST,
          port: Number(process.env.REDIS_PORT),
        },
      }
    : undefined,
);

redisClient.on("error", (err) => {
  console.warn("Redis Client Error:", err.message);
});

const connectRedis = async () => {
  if (!hasRedisConfig) {
    throw new Error("REDIS_HOST / REDIS_PORT / REDIS_PASSWORD not set");
  }
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};

module.exports = { redisClient, connectRedis };
