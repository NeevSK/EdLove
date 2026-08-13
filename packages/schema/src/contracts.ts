/**
 * Mobile-safe schema contracts.
 *
 * This surface contains type-only ORM contracts. It intentionally does not
 * import ZenStack's runtime schema factory or Zod. Runtime validation belongs
 * to @repo/schema and @repo/core/logic/schemas.
 */
export type {
  CalendarEvent,
  User,
  UserGrowthState,
} from '@repo/schema/generated/orm/models';
