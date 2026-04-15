import dotenv from "dotenv";

dotenv.config();

const DEFAULT_PORT = 4000;
const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/rura";
const DEFAULT_JWT_SECRET = "rura-dev-jwt-secret-change-in-production";
const DEFAULT_JWT_EXPIRES_IN = "12h";
const DEFAULT_CORS_ALLOWED_ORIGINS = "http://localhost:3000,http://127.0.0.1:3000,https://frontend-production-af7a.up.railway.app";

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return DEFAULT_PORT;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? DEFAULT_PORT : parsed;
};

const parseAllowedOrigins = (value: string | undefined): string[] => {
  const source = value && value.trim().length > 0 ? value : DEFAULT_CORS_ALLOWED_ORIGINS;

  return source
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin, index, array) => origin.length > 0 && array.indexOf(origin) === index);
};

const resolveCorsAllowedOrigins = (): string[] => {
  const csvOrigins = parseAllowedOrigins(process.env.CORS_ALLOWED_ORIGINS);
  const frontendUrl = process.env.FRONTEND_URL?.trim();

  if (!frontendUrl || frontendUrl.length === 0) {
    return csvOrigins;
  }

  if (csvOrigins.includes(frontendUrl)) {
    return csvOrigins;
  }

  return [...csvOrigins, frontendUrl];
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
      : DEFAULT_JWT_EXPIRES_IN,
  corsAllowedOrigins: resolveCorsAllowedOrigins()
};