import type { IEmailPort, SendEmailRequest, SendEmailResponse } from '@repo/core/logic/ports/email.port';
import { APIError } from '@repo/core/types/API';

export type ResendEmailAdapterOptions = {
  apiKey?: string;
  defaultFrom?: string;
  apiBaseUrl?: string;
};

export class ResendEmailAdapter implements IEmailPort {
  private readonly apiKey: string;
  private readonly defaultFrom: string;
  private readonly apiBaseUrl: string;

  constructor(options?: ResendEmailAdapterOptions) {
    this.apiKey =
      options?.apiKey ??
      (typeof process !== 'undefined' ? process.env?.RESEND_API_KEY ?? '' : '');
    this.defaultFrom = options?.defaultFrom ?? 'Gurudevi <notifications@mail.gurudevi.lk>';
    this.apiBaseUrl = options?.apiBaseUrl ?? 'https://api.resend.com';
  }

  async sendEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
    if (!this.apiKey) {
      throw new APIError('Missing Resend API key for email delivery', 'MISSING_API_KEY');
    }

    const toAddresses = Array.isArray(request.to) ? request.to : [request.to];
    const fromAddress = request.from || this.defaultFrom;

    const payload: Record<string, unknown> = {
      from: fromAddress,
      to: toAddresses,
      subject: request.subject,
    };

    if (request.html) payload.html = request.html;
    if (request.text) payload.text = request.text;
    if (request.replyTo) payload.reply_to = request.replyTo;
    if (request.tags) payload.tags = request.tags;
    if (request.headers) payload.headers = request.headers;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (request.idempotencyKey) {
      headers['Idempotency-Key'] = request.idempotencyKey;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/emails`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { id?: string; message?: string; name?: string };

      if (!response.ok) {
        throw new APIError(
          data.message || `Failed to send email (${response.status})`,
          data.name || 'EMAIL_SEND_FAILED',
        );
      }

      return {
        id: data.id ?? '',
        from: fromAddress,
        to: toAddresses,
      };
    } catch (err) {
      if (err instanceof APIError) throw err;
      throw new APIError(
        err instanceof Error ? err.message : 'Unknown email dispatch error',
        'EMAIL_NETWORK_ERROR',
        err,
      );
    }
  }

  async sendSchoolInvite(params: {
    to: string;
    inviterName: string;
    schoolName: string;
    role: string;
    inviteUrl: string;
  }): Promise<SendEmailResponse> {
    const subject = `${params.inviterName} invited you to join ${params.schoolName} on Gurudevi`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1a1a1a;">School Workspace Invitation</h2>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.5;">
          <strong>${params.inviterName}</strong> has invited you to join <strong>${params.schoolName}</strong> as a <strong>${params.role}</strong>.
        </p>
        <div style="margin: 32px 0;">
          <a href="${params.inviteUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="font-size: 14px; color: #71717a;">
          Or copy and paste this URL into your browser:<br />
          <a href="${params.inviteUrl}" style="color: #2563eb;">${params.inviteUrl}</a>
        </p>
      </div>
    `;
    const text = `${params.inviterName} has invited you to join ${params.schoolName} as a ${params.role}.\n\nAccept your invitation: ${params.inviteUrl}`;

    return this.sendEmail({
      to: params.to,
      subject,
      html,
      text,
      tags: [{ name: 'category', value: 'school_invite' }],
    });
  }

  async sendSecurityAlert(params: {
    to: string;
    userName?: string;
    alertType: 'new_device' | 'password_changed' | 'email_changed';
    details: string;
    actionUrl?: string;
  }): Promise<SendEmailResponse> {
    const titles: Record<string, string> = {
      new_device: 'New Device Sign-In Detected',
      password_changed: 'Your Gurudevi Password Was Changed',
      email_changed: 'Your Gurudevi Account Email Was Updated',
    };

    const subject = titles[params.alertType] ?? 'Security Alert for your Gurudevi Account';
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #dc2626;">Security Notice</h2>
        <p style="font-size: 16px; color: #4a4a4a; line-height: 1.5;">
          ${params.userName ? `Hello ${params.userName},<br /><br />` : ''}
          ${params.details}
        </p>
        ${
          params.actionUrl
            ? `<div style="margin: 28px 0;">
                <a href="${params.actionUrl}" style="background-color: #dc2626; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                  Review Account Activity
                </a>
              </div>`
            : ''
        }
        <p style="font-size: 13px; color: #71717a;">
          If this was you, you can safely disregard this email. If you did not make this change, please lock your account or contact support immediately.
        </p>
      </div>
    `;
    const text = `${subject}\n\n${params.details}\n\nIf you did not perform this action, please secure your account immediately: ${params.actionUrl ?? 'https://sanctuary.gurudevi.app'}`;

    return this.sendEmail({
      to: params.to,
      from: 'Gurudevi Security <verify@auth.gurudevi.lk>',
      subject,
      html,
      text,
      tags: [{ name: 'category', value: 'security_alert' }],
    });
  }
}
