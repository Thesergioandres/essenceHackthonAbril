import { CreateOrganizationUseCase } from "./application/use-cases/CreateOrganizationUseCase";
import { CreateDonationUseCase } from "./application/use-cases/CreateDonationUseCase";
import { CreateUrgentNeedUseCase } from "./application/use-cases/CreateUrgentNeedUseCase";
import { CreateUserUseCase } from "./application/use-cases/CreateUserUseCase";
import { GetDonationSensitiveDetailsUseCase } from "./application/use-cases/GetDonationSensitiveDetailsUseCase";
import { GetSystemHealthUseCase } from "./application/use-cases/GetSystemHealthUseCase";
import { ListNotificationsUseCase } from "./application/use-cases/ListNotificationsUseCase";
import { ListReceiptHistoryUseCase } from "./application/use-cases/ListReceiptHistoryUseCase";
import { ListTenantDonationsUseCase } from "./application/use-cases/ListTenantDonationsUseCase";
import { ListUrgentNeedsUseCase } from "./application/use-cases/ListUrgentNeedsUseCase";
import { UpdateDonationStatusUseCase } from "./application/use-cases/UpdateDonationStatusUseCase";
import { NotificationService } from "./application/services/NotificationService";
import { createApp } from "./infrastructure/app";
import { env } from "./infrastructure/config/env";
import { connectMongoDb } from "./infrastructure/config/mongo/mongooseConnection";
import { OrganizationController } from "./infrastructure/http/controllers/OrganizationController";
import { DonationController } from "./infrastructure/http/controllers/DonationController";
import { HealthController } from "./infrastructure/http/controllers/HealthController";
import { HistoryController } from "./infrastructure/http/controllers/HistoryController";
import { NotificationController } from "./infrastructure/http/controllers/NotificationController";
import { UrgentNeedController } from "./infrastructure/http/controllers/UrgentNeedController";
import { UserController } from "./infrastructure/http/controllers/UserController";
import { createTenantAuthMiddleware } from "./infrastructure/http/middlewares/tenantAuthMiddleware";
import { MongoDonationRepository } from "./infrastructure/database/repositories/MongoDonationRepository";
import { MongoNotificationRepository } from "./infrastructure/database/repositories/MongoNotificationRepository";
import { MongoOrganizationRepository } from "./infrastructure/database/repositories/MongoOrganizationRepository";
import { MongoReceiptLogRepository } from "./infrastructure/database/repositories/MongoReceiptLogRepository";
import { MongoUrgentNeedRepository } from "./infrastructure/database/repositories/MongoUrgentNeedRepository";
import { MongoUserRepository } from "./infrastructure/database/repositories/MongoUserRepository";

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
  const userRepository = new MongoUserRepository();
  const urgentNeedRepository = new MongoUrgentNeedRepository();
  const notificationRepository = new MongoNotificationRepository();
  const receiptLogRepository = new MongoReceiptLogRepository();
  const notificationService = new NotificationService(notificationRepository);

  const createOrganizationUseCase = new CreateOrganizationUseCase(organizationRepository);
  const organizationController = new OrganizationController(createOrganizationUseCase);
  const createUserUseCase = new CreateUserUseCase(userRepository);
  const userController = new UserController(createUserUseCase);

  const createDonationUseCase = new CreateDonationUseCase(
    donationRepository,
    organizationRepository,
    userRepository,
    notificationService
  );
  const listTenantDonationsUseCase = new ListTenantDonationsUseCase(donationRepository);
  const updateDonationStatusUseCase = new UpdateDonationStatusUseCase(
    donationRepository,
    userRepository,
    receiptLogRepository,
    notificationService
  );
  const getDonationSensitiveDetailsUseCase = new GetDonationSensitiveDetailsUseCase(
    donationRepository,
    userRepository
  );
  const donationController = new DonationController(
    createDonationUseCase,
    listTenantDonationsUseCase,
    updateDonationStatusUseCase,
    getDonationSensitiveDetailsUseCase
  );

  const createUrgentNeedUseCase = new CreateUrgentNeedUseCase(
    urgentNeedRepository,
    notificationService
  );
  const listUrgentNeedsUseCase = new ListUrgentNeedsUseCase(urgentNeedRepository);
  const urgentNeedController = new UrgentNeedController(
    createUrgentNeedUseCase,
    listUrgentNeedsUseCase
  );

  const listNotificationsUseCase = new ListNotificationsUseCase(
    notificationRepository,
    userRepository
  );
  const notificationController = new NotificationController(listNotificationsUseCase);

  const listReceiptHistoryUseCase = new ListReceiptHistoryUseCase(receiptLogRepository);
  const historyController = new HistoryController(listReceiptHistoryUseCase);

  const tenantAuthMiddleware = createTenantAuthMiddleware(organizationRepository);

  const app = createApp({
    healthController,
    organizationController,
    donationController,
    urgentNeedController,
    notificationController,
    historyController,
    userController,
    tenantAuthMiddleware
  });

  app.listen(env.port, () => {
    console.info(`RURA backend listening on port ${env.port}.`);
  });
};

void bootstrap();