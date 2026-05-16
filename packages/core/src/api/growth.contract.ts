import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  GrowthSignalSchema,
  ImpactRippleSchema,
  SanctuaryManifestoSchema,
  UserGrowthStateSchema,
} from '../logic/schemas/growth.schema';
import { POAMetadataSchema } from './contract';

const c = initContract();

const growthAuthority = (
  action: 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'verify',
) => POAMetadataSchema.parse({ policy: { action, subject: 'Growth' } });

const manifestoAuthority = (
  action: 'manage' | 'create' | 'read' | 'update' | 'delete' | 'submit' | 'verify',
) => POAMetadataSchema.parse({ policy: { action, subject: 'Manifesto' } });

export const growthContract = c.router({
  // --- MANIFESTOS & MISSIONS ---
  getManifestos: {
    method: 'GET',
    path: '/growth/manifestos',
    query: z.object({ school_id: z.string(), user_id: z.string().optional() }),
    responses: { 200: z.array(SanctuaryManifestoSchema) },
    metadata: manifestoAuthority('read'),
  },
  createManifesto: {
    method: 'POST',
    path: '/growth/manifestos',
    body: SanctuaryManifestoSchema.omit({
      id: true,
      created_at: true,
      updated_at: true,
    }),
    responses: { 201: SanctuaryManifestoSchema },
    metadata: manifestoAuthority('create'),
  },
  endorseManifesto: {
    method: 'POST',
    path: '/growth/manifestos/:id/endorse',
    body: z.object({
      user_id: z.string(),
      commitment_text: z.string().optional(),
    }),
    responses: { 200: z.object({ success: z.boolean() }) },
    metadata: manifestoAuthority('update'),
  },
  unendorseManifesto: {
    method: 'DELETE',
    path: '/growth/manifestos/:id/endorse',
    query: z.object({ user_id: z.string() }),
    responses: { 200: z.object({ success: z.boolean() }) },
    metadata: manifestoAuthority('update'),
  },

  // --- SIGNALS & STATE ---
  getGrowthState: {
    method: 'GET',
    path: '/growth/state/:userId',
    responses: { 200: UserGrowthStateSchema },
    metadata: growthAuthority('read'),
  },
  emitSignal: {
    method: 'POST',
    path: '/growth/signals',
    body: z.object({
      user_id: z.string(),
      event_type: z.string(),
      event_metadata: z.record(z.string(), z.any()).optional(),
    }),
    responses: { 201: GrowthSignalSchema },
    metadata: growthAuthority('create'),
  },

  // --- RIPPLES & WELLBEING ---
  getRipples: {
    method: 'GET',
    path: '/growth/ripples/:userId',
    responses: { 200: z.array(ImpactRippleSchema) },
    metadata: growthAuthority('read'),
  },
  createRipple: {
    method: 'POST',
    path: '/growth/ripples',
    body: z.object({
      recipientUserId: z.string(),
      actorUserId: z.string(),
      rippleType: z.string(),
      sourceEntityType: z.string().optional(),
      sourceEntityId: z.string().optional(),
      warmMessage: z.string().optional(),
    }),
    responses: { 201: ImpactRippleSchema },
    metadata: growthAuthority('create'),
  },
});

