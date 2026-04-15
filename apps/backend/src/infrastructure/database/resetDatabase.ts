import "dotenv/config";
import mongoose from "mongoose";

const DEFAULT_MONGODB_URI = "mongodb://localhost:27017/rura";

const main = async (): Promise<void> => {
  const mongoDbUri = process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI;

  await mongoose.connect(mongoDbUri);

  try {
    await mongoose.connection.dropDatabase();
    console.log("Database reset completed successfully.");
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error: unknown) => {
  console.error("Database reset failed.", error);
  process.exitCode = 1;
});
