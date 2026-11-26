/**
 * IEmailPort: The Sovereign Email Interface.
 * Decouples domain logic from external email service providers (Resend, SES, Postmark).
 */

export type EmailAttachment = {
  filename: string;
  content: string | Uint8Array;
  contentType?: string;
};

export type SendEmailRequest = {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  idempotencyKey?: string;
  tags?: Array<{ name: string; value: string }>;
  attachments?: EmailAttachment[];
};

export type SendEmailResponse = {
  id: string;
  from: string;
  to: string[];
};

export interface IEmailPort {
  /**
   * Dispatches a raw transactional email.
   */
  sendEmail(request: SendEmailRequest): Promise<SendEmailResponse>;

  /**
   * Sends an invitation to join a school workspace.
   */
  sendSchoolInvite(params: {
    to: string;
    inviterName: string;
    schoolName: string;
    role: string;
    inviteUrl: string;
  }): Promise<SendEmailResponse>;

  /**
   * Sends a critical account security notification (new device, password change).
   */
  sendSecurityAlert(params: {
    to: string;
    userName?: string;
    alertType: 'new_device' | 'password_changed' | 'email_changed';
    details: string;
    actionUrl?: string;
  }): Promise<SendEmailResponse>;
}
