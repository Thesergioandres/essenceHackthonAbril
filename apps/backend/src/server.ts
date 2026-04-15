import { CreateDonationUseCase } from "./application/use-cases/CreateDonationUseCase";
import { GetSystemHealthUseCase } from "./application/use-cases/GetSystemHealthUseCase";
import { ListTenantDonationsUseCase } from "./application/use-cases/ListTenantDonationsUseCase";
import { createApp } from "./infrastructure/app";
import { env } from "./infrastructure/config/env";
import { connectMongoDb } from "./infrastructure/config/mongo/mongooseConnection";
import { DonationController } from "./infrastructure/http/controllers/DonationController";
import { HealthController } from "./infrastructure/http/controllers/HealthController";
import { createTenantAuthMiddleware } from "./infrastructure/http/middlewares/tenantAuthMiddleware";
import { MongoDonationRepository } from "./infrastructure/repositories/MongoDonationRepository";
import { MongoOrganizationRepository } from "./infrastructure/repositories/MongoOrganizationRepository";
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

  const organizationRepository = new MongoOrganizationRepository();
  const donationRepository = new MongoDonationRepository();

  const createDonationUseCase = new CreateDonationUseCase(
    donationRepository,
    organizationRepository
  );
  const listTenantDonationsUseCase = new ListTenantDonationsUseCase(donationRepository);
  const donationController = new DonationController(
    createDonationUseCase,
    listTenantDonationsUseCase
  );
  const tenantAuthMiddleware = createTenantAuthMiddleware(organizationRepository);

  const app = createApp({
    healthController,
    donationController,
    tenantAuthMiddleware
  });

  app.listen(env.port, () => {
    console.info(`RURA backend listening on port ${env.port}.`);
  });
};

void bootstrap();