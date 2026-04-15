import { UrgentNeed } from "../../domain/entities/UrgentNeed";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IUrgentNeedRepository } from "../../domain/repositories/IUrgentNeedRepository";
import { NotificationService } from "../services/NotificationService";

export interface CreateUrgentNeedInput {
  tenantId: string;
  description: string;
  linkedDonationId?: string;
}

export class CreateUrgentNeedUseCase {
  constructor(
    private readonly urgentNeedRepository: IUrgentNeedRepository,
    private readonly notificationService: NotificationService
  ) {}

  async execute(input: CreateUrgentNeedInput): Promise<UrgentNeed> {
    const tenantId = input.tenantId.trim();
    const description = input.description.trim();
    const linkedDonationId =
      typeof input.linkedDonationId === "string"
        ? input.linkedDonationId.trim()
        : undefined;

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (description.length === 0) {
      throw new ValidationError("description is required.");
    }

    const urgentNeed = await this.urgentNeedRepository.create({
      tenantId,
      description,
      priority: "HIGH",
      ...(linkedDonationId ? { linkedDonationId } : {})
    });

    await this.notificationService.notifyUrgentNeedPublished(
      tenantId,
      urgentNeed.id,
      urgentNeed.description
    );

    return urgentNeed;
  }
}
