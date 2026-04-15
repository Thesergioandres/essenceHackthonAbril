import { CreateOrganizationUseCase } from "./application/use-cases/CreateOrganizationUseCase";
import { CreateDonationUseCase } from "./application/use-cases/CreateDonationUseCase";
import { GetSystemHealthUseCase } from "./application/use-cases/GetSystemHealthUseCase";
import { ListTenantDonationsUseCase } from "./application/use-cases/ListTenantDonationsUseCase";
import { UpdateDonationStatusUseCase } from "./application/use-cases/UpdateDonationStatusUseCase";
import { createApp } from "./infrastructure/app";
import { env } from "./infrastructure/config/env";
import { connectMongoDb } from "./infrastructure/config/mongo/mongooseConnection";
import { OrganizationController } from "./infrastructure/http/controllers/OrganizationController";
import { DonationController } from "./infrastructure/http/controllers/DonationController";
import { HealthController } from "./infrastructure/http/controllers/HealthController";
import { createTenantAuthMiddleware } from "./infrastructure/http/middlewares/tenantAuthMiddleware";
import { MongoDonationRepository } from "./infrastructure/database/repositories/MongoDonationRepository";
import { MongoOrganizationRepository } from "./infrastructure/database/repositories/MongoOrganizationRepository";

const bootstrap = async (): Promise<void> => {
  try {
    await connectMongoDb(env.mongoDbUri);
    console.info("MongoDB connection established.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`MongoDB unavailable: ${message}`);
    process.exit(1);
  }

  const getSystemHealthUseCase = new GetSystemHealthUseCase();
  const healthController = new HealthController(getSystemHealthUseCase);

  const organizationRepository = new MongoOrganizationRepository();
  const donationRepository = new MongoDonationRepository();

  const createOrganizationUseCase = new CreateOrganizationUseCase(organizationRepository);
  const organizationController = new OrganizationController(createOrganizationUseCase);

  const createDonationUseCase = new CreateDonationUseCase(
    donationRepository,
    organizationRepository
  );
  const listTenantDonationsUseCase = new ListTenantDonationsUseCase(donationRepository);
  const updateDonationStatusUseCase = new UpdateDonationStatusUseCase(donationRepository);
  const donationController = new DonationController(
    createDonationUseCase,
    listTenantDonationsUseCase,
    updateDonationStatusUseCase
  );
  const tenantAuthMiddleware = createTenantAuthMiddleware(organizationRepository);

  const app = createApp({
    healthController,
    organizationController,
    donationController,
    tenantAuthMiddleware
  });

  app.listen(env.port, () => {
    console.info(`RURA backend listening on port ${env.port}.`);
  });
};

void bootstrap();