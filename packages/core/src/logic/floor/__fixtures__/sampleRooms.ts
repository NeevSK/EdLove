import type { DomainEntry, TabDomain } from '../../registry/domainEntry';
import { type RoomCatalog, roomCatalogOf } from '../rooms';

/**
 * A small catalog for tests that need a room without the domain packages
 * (the kit cannot import them). Same shape as the real AppCatalog entries;
 * the real catalogs are tested in the apps.
 */
const entry = (
  room: TabDomain,
  id: string,
  label: string,
  floor: NonNullable<DomainEntry['floor']>,
  order: number,
): DomainEntry => ({
  id,
  label,
  ownerPackage: room,
  mobileSupport: true,
  webSupport: true,
  state: 'live',
  lifecycle: {
    owner: room,
    createdAt: '2026-07-26',
    reviewAt: '2026-09-30',
    permanentJustification: 'Test sample.',
  },
  citizenshipRequired: 3,
  capabilityRequirement: { action: 'read', subject: 'Sample' },
  tabDomain: room,
  surfaceId: id,
  defaultOrder: order,
  analyticsKey: `${room}.${id}`,
  floor,
});

const SAMPLE: DomainEntry[] = [
  entry(
    'workspace',
    'attendance',
    'Daily Attendance',
    { group: 'today', shape: 'row', urgency: 'now', task: true, lit: true },
    1,
  ),
  entry(
    'workspace',
    'submissions',
    'Assignment Submissions',
    { group: 'academics', shape: 'card', urgency: 'later', needsAttention: true },
    2,
  ),
  entry('workspace', 'timetable', 'Timetable', { group: 'academics', shape: 'card' }, 3),
  entry('workspace', 'gradebook', 'Gradebook & Marks', { group: 'academics', shape: 'card' }, 4),
  entry('workspace', 'plan', 'Curriculum & Lesson Plans', { group: 'academics', shape: 'card' }, 5),
  entry('workspace', 'climate', 'Climate Sensing', { group: 'operations', shape: 'card' }, 6),
  entry(
    'workspace',
    'notices',
    'Circulars & Notices',
    { group: 'communications', shape: 'list' },
    7,
  ),
  entry('workspace', 'events', 'Events', { group: 'institutional', shape: 'card' }, 8),
  entry(
    'community',
    'hearth',
    'The Hearth',
    { group: 'news', shape: 'list', urgency: 'now', lit: true },
    1,
  ),
  entry('community', 'trust', 'Trust', { group: 'news', shape: 'card' }, 2),
  entry(
    'community',
    'messages',
    'Messages',
    { group: 'talk', shape: 'row', needsAttention: true },
    3,
  ),
  entry('community', 'circles', 'Circles', { group: 'groups', shape: 'rail' }, 4),
];

export const sampleRoom = (room: 'workspace' | 'community'): RoomCatalog =>
  roomCatalogOf(SAMPLE, room, 'teacher', 'mobile');
