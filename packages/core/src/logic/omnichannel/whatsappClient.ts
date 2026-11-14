// packages/core/src/logic/omnichannel/whatsappClient.ts
// Direct Meta Cloud API v21.0 Client for WhatsApp Business Platform

import type {
  WhatsAppOutboundInteractiveButtons,
  WhatsAppOutboundTemplateMessage,
  WhatsAppOutboundTextMessage,
} from '../../types/WhatsApp';

export interface WhatsAppClientConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
  baseUrl?: string;
  fetchFn?: typeof fetch;
}

export class WhatsAppClient {
  private readonly phoneNumberId: string;
  private readonly accessToken: string;
  private readonly apiVersion: string;
  private readonly baseUrl: string;
  private readonly fetch: typeof fetch;

  constructor(config: WhatsAppClientConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.accessToken = config.accessToken;
    this.apiVersion = config.apiVersion ?? 'v21.0';
    this.baseUrl = config.baseUrl ?? 'https://graph.facebook.com';
    this.fetch = config.fetchFn ?? globalThis.fetch;
  }

  private get messagesUrl(): string {
    return `${this.baseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  private get authHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Send a standard text message (inbound 24-hr session window).
   */
  async sendTextMessage(
    to: string,
    body: string,
    previewUrl = false,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const payload: WhatsAppOutboundTextMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanRecipient(to),
      type: 'text',
      text: {
        body,
        preview_url: previewUrl,
      },
    };

    return this.postJson(this.messagesUrl, payload);
  }

  /**
   * Send interactive button options (up to 3 buttons) for fast action confirmation.
   */
  async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (buttons.length === 0 || buttons.length > 3) {
      throw new Error('WhatsApp interactive buttons must have between 1 and 3 choices');
    }

    const payload: WhatsAppOutboundInteractiveButtons = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanRecipient(to),
      type: 'interactive',
      interactive: {
        type: 'button',
        ...(headerText ? { header: { type: 'text', text: headerText } } : {}),
        body: { text: bodyText },
        ...(footerText ? { footer: { text: footerText } } : {}),
        action: {
          buttons: buttons.map((b) => ({
            type: 'reply',
            reply: {
              id: b.id,
              title: b.title.slice(0, 20), // Meta limit is 20 chars
            },
          })),
        },
      },
    };

    return this.postJson(this.messagesUrl, payload);
  }

  /**
   * Send pre-approved business-initiated Utility template (e.g. absence notification, fee receipt).
   */
  async sendUtilityTemplate(
    to: string,
    templateName: string,
    languageCode: string,
    bodyParameters: string[] = [],
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const payload: WhatsAppOutboundTemplateMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanRecipient(to),
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(bodyParameters.length > 0
          ? {
              components: [
                {
                  type: 'body',
                  parameters: bodyParameters.map((p) => ({
                    type: 'text',
                    text: p,
                  })),
                },
              ],
            }
          : {}),
      },
    };

    return this.postJson(this.messagesUrl, payload);
  }

  /**
   * Fetch download URL for inbound audio / voice notes.
   */
  async getMediaUrl(mediaId: string): Promise<{ url: string; mimeType: string }> {
    const mediaEndpoint = `${this.baseUrl}/${this.apiVersion}/${mediaId}`;
    const res = await this.fetch(mediaEndpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to retrieve media metadata: ${res.status} ${err}`);
    }

    const json = (await res.json()) as { url: string; mime_type: string };
    return { url: json.url, mimeType: json.mime_type };
  }

  /**
   * Downloads binary buffer for audio media using authenticated Meta token.
   */
  async downloadMediaBuffer(mediaUrl: string): Promise<ArrayBuffer> {
    const res = await this.fetch(mediaUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to download media buffer: ${res.status}`);
    }

    return res.arrayBuffer();
  }

  private cleanRecipient(phone: string): string {
    // Strip +, whitespace, and leading zeros
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('0') && digits.length === 10) {
      // 0771234567 -> 94771234567
      return `94${digits.slice(1)}`;
    }
    return digits;
  }

  private async postJson(
    url: string,
    payload: unknown,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const res = await this.fetch(url, {
        method: 'POST',
        headers: this.authHeaders,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          error: `Meta Graph API error (${res.status}): ${errorText}`,
        };
      }

      const json = (await res.json()) as { messages?: Array<{ id: string }> };
      const messageId = json.messages?.[0]?.id;
      return { success: true, messageId };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }
}
