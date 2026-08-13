/**
 * `@repo/community/groups`
 *
 * Capability entry point for group discovery, group details, and group
 * membership management. Keep feed and chat surfaces out of this module so
 * group routes do not pull in unrelated community UI.
 */

export { default as CreateGroupModal } from '@repo/community/components/CreateGroupModal';
export { default as GroupCard } from '@repo/community/components/GroupCard';
export { default as GroupMemberManagement } from '@repo/community/components/GroupMemberManagement';
export { useCommunityGroups } from '@repo/community/hooks/useCommunityGroups';
export { default as GroupDetailsScreen } from '@repo/community/screens/GroupDetailsScreen';
export { default as GroupDetailsScreenWeb } from '@repo/community/screens/GroupDetailsScreen.web';
export { default as GroupsScreen } from '@repo/community/screens/GroupsScreen';
