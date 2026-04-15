import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 4000;
const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/rura";
const DEFAULT_JWT_SECRET = "rura-dev-jwt-secret-change-in-production";
const DEFAULT_JWT_EXPIRES_IN = "12h";

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? DEFAULT_PORT : parsed;
};

export const env = {
  port: parsePort(process.env.PORT),
  mongoDbUri: process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI,
  jwtSecret:
    process.env.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0
      ? process.env.JWT_SECRET.trim()
      : DEFAULT_JWT_SECRET,
  jwtExpiresIn:
    process.env.JWT_EXPIRES_IN && process.env.JWT_EXPIRES_IN.trim().length > 0
      ? process.env.JWT_EXPIRES_IN.trim()
      : DEFAULT_JWT_EXPIRES_IN
};