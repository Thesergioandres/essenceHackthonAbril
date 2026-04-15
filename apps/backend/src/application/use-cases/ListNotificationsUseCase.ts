import { Notification, NotificationChannel } from "../../domain/entities/Notification";
import { UserRole } from "../../domain/entities/User";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { ValidationError } from "../../domain/errors/ValidationError";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import {
  isFoundationRole,
  isVolunteerRole
} from "../policies/userRolePolicy";

export interface ListNotificationsInput {
  tenantId: string;
  userId: string;
}

const resolveChannel = (role: UserRole): NotificationChannel => {
  if (isFoundationRole(role)) {
    return "foundation";
  }

  if (isVolunteerRole(role)) {
    return "volunteer";
  }

  return "donor";
};

export class ListNotificationsUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: ListNotificationsInput): Promise<Notification[]> {
    const tenantId = input.tenantId.trim();
    const userId = input.userId.trim();

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (userId.length === 0) {
      throw new ValidationError("userId is required.");
    }

    const user = await this.userRepository.findById(userId);

    if (!user || user.tenantId !== tenantId) {
      throw new ForbiddenError("User cannot access notifications for this tenant.");
    }

    const channel = resolveChannel(user.role);

    return this.notificationRepository.findByQuery({
      tenantId,
      channel,
      ...(channel === "donor" ? { recipientUserId: userId } : {})
    });
  }
}
