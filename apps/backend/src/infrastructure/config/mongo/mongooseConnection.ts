import mongoose from "mongoose";

const CONNECTED_READY_STATE = 1;
const INITIAL_RETRY_DELAY_MS = 2000;
const MAX_RETRY_DELAY_MS = 30000;
const RECONNECT_DELAY_MS = 5000;

const wait = async (timeoutMs: number): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
};

const computeRetryDelay = (attempt: number): number => {
  return Math.min(INITIAL_RETRY_DELAY_MS * attempt, MAX_RETRY_DELAY_MS);
};

let activeUri = "";
let listenersRegistered = false;
let reconnecting = false;

const connect = async (): Promise<void> => {
  await mongoose.connect(activeUri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10
  });
};

const reconnectLoop = async (): Promise<void> => {
  if (reconnecting || activeUri.length === 0) {
    return;
  }

  reconnecting = true;

  while (mongoose.connection.readyState !== CONNECTED_READY_STATE) {
    try {
      await connect();
      reconnecting = false;
      console.info("MongoDB reconnection established.");
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error(`MongoDB reconnect failed: ${message}`);
      await wait(RECONNECT_DELAY_MS);
    }
  }

  reconnecting = false;
};

const registerConnectionListeners = (): void => {
  if (listenersRegistered) {
    return;
  }

  listenersRegistered = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Attempting reconnection...");
    void reconnectLoop();
  });

  mongoose.connection.on("error", (error) => {
    console.error(`MongoDB connection error: ${error.message}`);
  });
};

export const connectMongoDb = async (uri: string): Promise<void> => {
  activeUri = uri.trim();
  registerConnectionListeners();

  const MAX_ATTEMPTS = 5;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      if (mongoose.connection.readyState === CONNECTED_READY_STATE) {
        return;
      }
      await connect();
      return;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const retryDelay = computeRetryDelay(attempt);

      if (attempt === MAX_ATTEMPTS) {
        console.error(`MongoDB final connection attempt failed: ${message}. Giving up.`);
        throw new Error(`Could not establish initial MongoDB connection after ${MAX_ATTEMPTS} attempts.`);
      }

      console.error(
        `MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${message}. Retrying in ${Math.round(
          retryDelay / 1000
        )}s...`
      );

      await wait(retryDelay);
    }
  }
};

export const isMongoDbConnected = (): boolean => {
  return mongoose.connection.readyState === CONNECTED_READY_STATE;
};