import { z } from 'zod';
import {
  GrowthSignalSchema,
  ImpactRippleSchema,
  SanctuaryManifestoSchema,
  UserGrowthStateSchema,
} from '../logic/schemas/growth.schema';
import type { SovereignContract } from './contract';

const growthAuthority = (
  action: 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'verify',
) => ({ policy: { action, subject: 'Growth' } }) as const;

const manifestoAuthority = (
  action: 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'verify',
) => ({ policy: { action, subject: 'Manifesto' } }) as const;

export const growthContract = {
  // --- MANIFESTOS & MISSIONS ---
  getManifestos: {
    method: 'get',
    path: '/growth/manifestos',
    request: {
      query: z.object({ school_id: z.string(), user_id: z.string().optional() }),
    },
    responses: {
      200: {
        schema: z.array(SanctuaryManifestoSchema),
        description: 'Get manifestos list',
      },
    },
    metadata: manifestoAuthority('read'),
  },
  createManifesto: {
    method: 'post',
    path: '/growth/manifestos',
    request: {
      body: SanctuaryManifestoSchema.omit({
        id: true,
        created_at: true,
        updated_at: true,
      }),
    },
    responses: {
      201: {
        schema: SanctuaryManifestoSchema,
        description: 'Create manifesto successfully',
      },
    },
    metadata: manifestoAuthority('create'),
  },
  endorseManifesto: {
    method: 'post',
    path: '/growth/manifestos/:id/endorse',
    request: {
      params: z.object({ id: z.string() }),
      body: z.object({
        user_id: z.string(),
        commitment_text: z.string().optional(),
      }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.boolean() }),
        description: 'Endorse manifesto successfully',
      },
    },
    metadata: manifestoAuthority('update'),
  },
  unendorseManifesto: {
    method: 'delete',
    path: '/growth/manifestos/:id/endorse',
    request: {
      params: z.object({ id: z.string() }),
      query: z.object({ user_id: z.string() }),
    },
    responses: {
      200: {
        schema: z.object({ success: z.boolean() }),
        description: 'Unendorse manifesto successfully',
      },
    },
    metadata: manifestoAuthority('update'),
  },

  // --- SIGNALS & STATE ---
  getGrowthState: {
    method: 'get',
    path: '/growth/state/:userId',
    request: {
      params: z.object({ userId: z.string() }),
    },
    responses: {
      200: {
        schema: UserGrowthStateSchema,
        description: 'Get user growth state',
      },
    },
    metadata: growthAuthority('read'),
  },
  emitSignal: {
    method: 'post',
    path: '/growth/signals',
    request: {
      body: z.object({
        user_id: z.string(),
        event_type: z.string(),
        event_metadata: z.record(z.string(), z.any()).optional(),
      }),
    },
    responses: {
      201: {
        schema: GrowthSignalSchema,
        description: 'Emit growth signal successfully',
      },
    },
    metadata: growthAuthority('create'),
  },

  // --- RIPPLES & WELLBEING ---
  getRipples: {
    method: 'get',
    path: '/growth/ripples/:userId',
    request: {
      params: z.object({ userId: z.string() }),
    },
    responses: {
      200: {
        schema: z.array(ImpactRippleSchema),
        description: 'Get user impact ripples',
      },
    },
    metadata: growthAuthority('read'),
  },
  createRipple: {
    method: 'post',
    path: '/growth/ripples',
    request: {
      body: z.object({
        recipientUserId: z.string(),
        actorUserId: z.string(),
        rippleType: z.string(),
        sourceEntityType: z.string().optional(),
        sourceEntityId: z.string().optional(),
        warmMessage: z.string().optional(),
      }),
    },
    responses: {
      201: {
        schema: ImpactRippleSchema,
        description: 'Create impact ripple successfully',
      },
    },
    metadata: growthAuthority('create'),
  },
} as const satisfies SovereignContract;
