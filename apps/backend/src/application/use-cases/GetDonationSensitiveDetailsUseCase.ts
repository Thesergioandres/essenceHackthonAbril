import { Donation } from "../../domain/entities/Donation";
import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { ValidationError } from "../../domain/errors/ValidationError";
import { IDonationRepository } from "../../domain/repositories/IDonationRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import {
  isFoundationRole,
  isVolunteerRole
} from "../policies/userRolePolicy";

export interface GetDonationSensitiveDetailsInput {
  donationId: string;
  tenantId: string;
  viewerUserId: string;
}

export class GetDonationSensitiveDetailsUseCase {
  constructor(
    private readonly donationRepository: IDonationRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: GetDonationSensitiveDetailsInput): Promise<Donation> {
    const donationId = input.donationId.trim();
    const tenantId = input.tenantId.trim();
    const viewerUserId = input.viewerUserId.trim();

    if (donationId.length === 0) {
      throw new ValidationError("donationId is required.");
    }

    if (tenantId.length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (viewerUserId.length === 0) {
      throw new ValidationError("viewerUserId is required.");
    }

    const viewer = await this.userRepository.findById(viewerUserId);

    if (!viewer || viewer.tenantId !== tenantId) {
      throw new ForbiddenError("Viewer cannot access donation details for this tenant.");
    }

    const donation = await this.donationRepository.findByIdAndTenant(donationId, tenantId);

    if (!donation) {
      throw new NotFoundError("Donation not found for this tenant.");
    }

    if (donation.status === "requested") {
      const isRequestingFoundation =
        isFoundationRole(viewer.role) &&
        donation.requestedByTenantId === tenantId;

      const isAssignedVolunteer =
        donation.assignedVolunteerId === viewer.id &&
        (isVolunteerRole(viewer.role) || viewer.role === "foundation");

      if (!isRequestingFoundation && !isAssignedVolunteer) {
        throw new ForbiddenError(
          "Only the requesting foundation and assigned volunteer can access requested donation details."
        );
      }
    }

    return donation;
  }
}
