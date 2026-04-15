import { NotificationChannel } from "../../domain/entities/Notification";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";

const buildDonationMessage = (action: string, donationTitle: string): string => {
  return `${action}: ${donationTitle}`;
};

export class NotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async notifyDonationAvailableForFoundation(
    tenantId: string,
    donationId: string,
    donationTitle: string
  ): Promise<void> {
    await this.createChannelNotification(
      tenantId,
      "DONATION_AVAILABLE",
      "foundation",
      buildDonationMessage("Nueva donacion disponible", donationTitle),
      { donationId }
    );
  }

  async notifyDonationRequestedForVolunteers(
    tenantId: string,
    donationId: string,
    donationTitle: string
  ): Promise<void> {
    await this.createChannelNotification(
      tenantId,
      "DONATION_REQUESTED",
      "volunteer",
      buildDonationMessage("Donacion solicitada por fundacion", donationTitle),
      { donationId }
    );
  }

  async notifyDonationPickedUpForDonor(
    tenantId: string,
    donorUserId: string,
    donationId: string,
    donationTitle: string
  ): Promise<void> {
    await this.createChannelNotification(
      tenantId,
      "DONATION_PICKED_UP",
      "donor",
      buildDonationMessage("Tu donacion fue recogida", donationTitle),
      {
        donationId,
        recipientUserId: donorUserId
      }
    );
  }

  async notifyDonationDeliveredForDonor(
    tenantId: string,
    donorUserId: string,
    donationId: string,
    donationTitle: string
  ): Promise<void> {
    await this.createChannelNotification(
      tenantId,
      "DONATION_DELIVERED",
      "donor",
      buildDonationMessage("Tu donacion fue entregada", donationTitle),
      {
        donationId,
        recipientUserId: donorUserId
      }
    );
  }

  async notifyUrgentNeedPublished(
    tenantId: string,
    urgentNeedId: string,
    description: string
  ): Promise<void> {
    const message = `Alerta urgente: ${description}`;

    await Promise.all([
      this.createChannelNotification(
        tenantId,
        "URGENT_NEED_PUBLISHED",
        "volunteer",
        message,
        { urgentNeedId }
      ),
      this.createChannelNotification(
        tenantId,
        "URGENT_NEED_PUBLISHED",
        "donor",
        message,
        { urgentNeedId }
      )
    ]);
  }

  private async createChannelNotification(
    tenantId: string,
    eventType:
      | "DONATION_AVAILABLE"
      | "DONATION_REQUESTED"
      | "DONATION_PICKED_UP"
      | "DONATION_DELIVERED"
      | "URGENT_NEED_PUBLISHED",
    channel: NotificationChannel,
    message: string,
    options?: {
      recipientUserId?: string;
      donationId?: string;
      urgentNeedId?: string;
    }
  ): Promise<void> {
    await this.notificationRepository.create({
      tenantId,
      eventType,
      channel,
      message,
      ...(options?.recipientUserId ? { recipientUserId: options.recipientUserId } : {}),
      ...(options?.donationId ? { donationId: options.donationId } : {}),
      ...(options?.urgentNeedId ? { urgentNeedId: options.urgentNeedId } : {})
    });
  }
}
