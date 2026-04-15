import { GetSystemHealthUseCase } from "./application/use-cases/GetSystemHealthUseCase";
import { createApp } from "./infrastructure/app";
import { env } from "./infrastructure/config/env";
import { connectMongoDb } from "./infrastructure/config/mongo/mongooseConnection";
import { HealthController } from "./infrastructure/http/controllers/HealthController";
import { MongooseSystemHealthRepository } from "./infrastructure/repositories/MongooseSystemHealthRepository";

const bootstrap = async (): Promise<void> => {
  try {
    await connectMongoDb(env.mongoDbUri);
    console.info("MongoDB connection established.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`MongoDB unavailable: ${message}`);
  }

  const systemHealthRepository = new MongooseSystemHealthRepository();
  const getSystemHealthUseCase = new GetSystemHealthUseCase(systemHealthRepository);
  const healthController = new HealthController(getSystemHealthUseCase);
  const app = createApp(healthController);

  app.listen(env.port, () => {
    console.info(`RURA backend listening on port ${env.port}.`);
  });
};

void bootstrap();