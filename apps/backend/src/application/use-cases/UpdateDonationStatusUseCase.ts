import { Donation } from "../../domain/entities/Donation";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import {
  DonationStatusUpdate,
  IDonationRepository
} from "../../domain/repositories/IDonationRepository";

export interface UpdateDonationStatusInput {
  donationId: string;
  tenantId: string;
  status: DonationStatusUpdate;
  photo: string;
}

const normalizePhoto = (photo: string): string => {
  const trimmedPhoto = photo.trim();

  if (trimmedPhoto.length === 0) {
    throw new ValidationError("photo is required.");
  }

  return trimmedPhoto;
};

export class UpdateDonationStatusUseCase {
  constructor(private readonly donationRepository: IDonationRepository) {}

  async execute(input: UpdateDonationStatusInput): Promise<Donation> {
    const donationId = input.donationId.trim();
    const tenantId = input.tenantId.trim();

    if (donationId.length === 0) {
      throw new ValidationError("donationId is required.");
    }

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    const normalizedPhoto = normalizePhoto(input.photo);

    const updatedDonation = await this.donationRepository.updateStatus({
      donationId,
      tenantId,
      status: input.status,
      photo: normalizedPhoto
    });

    if (!updatedDonation) {
      throw new NotFoundError("Donation not found for this tenant.");
    }

    return updatedDonation;
  }
}
