import type { AbilityBuilder } from '@casl/ability';
import type { UserContext } from '../../logic/schemas/user.schema';
import type { AppAbility } from './base';
import { definePrincipalAbilities } from './principal';

export const defineAssistantPrincipalAbilities = (
  user: UserContext,
  builder: AbilityBuilder<AppAbility>,
) => {
  const { can } = builder;
  // 1. Inherit Principal roles
  definePrincipalAbilities(user, builder);

  // 2. Assistant Principal Specifics
  can('manage', 'AssistantPrincipalDashboard');
  // Add any specific assistant principal overrides here if needed
};
