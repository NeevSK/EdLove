// packages/core/src/types/WhatsApp.ts
// Strict TypeScript types for Meta WhatsApp Business Platform (Cloud API v21.0)

export interface WhatsAppWebhookPayload {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string; // WhatsApp Business Account ID
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: {
            name: string;
          };
          wa_id: string; // User's phone number without +
        }>;
        messages?: WhatsAppInboundMessage[];
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
          conversation?: {
            id: string;
            category: 'utility' | 'service' | 'authentication' | 'marketing';
            expiration_timestamp?: string;
          };
          pricing?: {
            billable: boolean;
            pricing_model: string;
            category: string;
          };
          errors?: Array<{
            code: number;
            title: string;
            message?: string;
          }>;
        }>;
      };
      field: 'messages';
    }>;
  }>;
}

export type WhatsAppMessageType =
  | 'text'
  | 'audio'
  | 'interactive'
  | 'document'
  | 'image'
  | 'location'
  | 'button'
  | 'reaction'
  | 'unsupported';

export interface WhatsAppInboundMessage {
  from: string; // Sender phone number (e.g., '94771234567')
  id: string; // Meta message ID (e.g., 'wamid.HBgM...')
  timestamp: string;
  type: WhatsAppMessageType;
  text?: {
    body: string;
  };
  audio?: {
    id: string;
    mime_type: string;
    sha256?: string;
    voice?: boolean; // True if it's a recorded voice note
  };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
      description?: string;
    };
  };
  document?: {
    id: string;
    mime_type: string;
    filename: string;
  };
}

export interface WhatsAppInteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string; // Max 20 chars
  };
}

export interface WhatsAppOutboundTextMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'text';
  text: {
    preview_url?: boolean;
    body: string;
  };
}

export interface WhatsAppOutboundInteractiveButtons {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'interactive';
  interactive: {
    type: 'button';
    header?: {
      type: 'text';
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    action: {
      buttons: WhatsAppInteractiveButton[];
    };
  };
}

export interface WhatsAppOutboundTemplateMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template';
  template: {
    name: string;
    language: {
      code: string; // e.g., 'si', 'ta', 'en'
    };
    components?: Array<{
      type: 'header' | 'body' | 'button';
      sub_type?: 'quick_reply' | 'url';
      index?: string;
      parameters: Array<{
        type: 'text' | 'currency' | 'date_time';
        text?: string;
      }>;
    }>;
  };
}

// Domain Model: Extracted Lesson Record from Teacher Voice Memo
export interface LessonRecordExtraction {
  subject: string;
  grade: string;
  topicTaught: string;
  competencyOrSubTopic?: string;
  presentCount: number;
  absentCount: number;
  absenteeIdentifiers?: string[]; // Anonymized or tokenized identifiers
  keyDifficultiesNoted?: string;
  formalLessonRecordSinhala?: string; // Formatted Pādam Satahana
  formalLessonRecordTamil?: string;
  confidenceScore: number; // 0.0 - 1.0
  needsClarification: boolean;
  clarificationPrompt?: string;
}

// Domain Model: School Diagnostic Lookup Result for WhatsApp
export interface SchoolGroundTruthSummary {
  censusNo: string;
  name: string;
  nameSi?: string | null;
  nameTa?: string | null;
  category: string;
  type: string;
  province: string;
  district: string;
  totalStudents: number;
  totalTeachers: number;
  officialStr: number; // Nominal Student-Teacher Ratio
  realClassroomDensity: number; // Estimated physical room density
  ratioTheaterDelta: number; // realClassroomDensity - officialStr
  cariScore: number; // Context-Adjusted Relational Index (0-100)
  attunementProbability: number; // Biological probability of 1-on-1 teacher attunement (%)
  shadowTuitionMonthlyEst: number; // Estimated private tuition cost LKR
  sdsFundingShare: number; // Private alumni/SDS funding percentage (%)
  thermodynamicRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'ACUTE';
}
