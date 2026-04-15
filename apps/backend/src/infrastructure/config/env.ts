import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 4000;
const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/rura";

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? DEFAULT_PORT : parsed;
};

export const env = {
  port: parsePort(process.env.PORT),
  mongoDbUri: process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI
};