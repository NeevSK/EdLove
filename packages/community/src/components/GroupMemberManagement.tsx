import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { usePermissions } from '@repo/core/logic';
import type { CommunityStackParamList } from '@repo/core/types';
import {
  Box,
  Heading,
  HStack,
  Pressable,
  Text,
  VStack,
  Button,
  Icon,
} from '@repo/ui/primitives';
import {
  LoadingOverlay,
  ScreenWrapper,
} from '@repo/ui/components';
import { useSanctuaryToast } from '@repo/ui/hooks';
import { hapticLight } from '@repo/ui/utils';
import { Info, Settings, Shield, UserCheck, UserX } from '@repo/ui/icons';
import React, { useEffect, useState } from 'react';
import { communityAPI } from '../api/community';
import type { CommunityGroup } from '../types';
import CreateGroupModal from './CreateGroupModal';

interface GroupMemberManagementProps {
  groupId: string;
}

export default function GroupMemberManagement({ groupId }: GroupMemberManagementProps) {
  const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const { showToast } = useSanctuaryToast();
  const [group, setGroup] = useState<CommunityGroup | null>(null);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [policy, setPolicy] = useState<string>('restricted');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { context, can } = usePermissions();
  const userId = context.userId;

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [groupData, pending, active] = await Promise.all([
        communityAPI.getGroupById(groupId),
        communityAPI.getPendingMembers(groupId),
        communityAPI.getActiveMembers(groupId),
      ]);

      setGroup(groupData);
      setPendingMembers(pending);
      setActiveMembers(active);
      setPolicy(groupData.join_policy);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproval = React.useCallback(
    async (targetUserId: string, status: 'active' | 'rejected') => {
      try {
        await communityAPI.handleMemberRequest(groupId, targetUserId, status);
        hapticLight();
        showToast({
          message:
            status === 'active'
              ? 'Access granted to the Sanctuary.'
              : 'The request has been gently declined.',
          type: status === 'active' ? 'success' : 'info',
        });
        loadData();
      } catch (error) {
        console.error(error);
      }
    },
    [groupId, showToast, loadData],
  );

  const handlePolicyChange = React.useCallback(
    async (newPolicy: string) => {
      try {
        await communityAPI.updateJoiningPolicy(groupId, newPolicy);
        setPolicy(newPolicy);
        hapticLight();
        showToast({
          message: `Joining policy updated to ${newPolicy.toUpperCase()}.`,
          type: 'success',
        });
        loadData();
      } catch (error) {
        console.error(error);
      }
    },
    [groupId, showToast, loadData],
  );

  const handleCapacityChange = React.useCallback(
    async (targetUserId: string, newCapacity: 'admin' | 'member') => {
      try {
        setLoading(true);
        await communityAPI.updateMemberAuthority(groupId, targetUserId, newCapacity);
        hapticLight();
        showToast({
          message:
            newCapacity === 'admin'
              ? 'Guardian mantle bestowed.'
              : 'Relieved of administrative duties.',
          type: 'success',
        });
        await loadData();
      } catch (error) {
        console.error(error);
        showToast({ message: 'Higher authority required for this shift.', type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [groupId, showToast, loadData],
  );

  const handleApproveAll = React.useCallback(() => {
    communityAPI
      .approveAllPending(groupId)
      .then(loadData)
      .catch(() => {
        /* non-fatal */
      });
  }, [groupId, loadData]);

  const handleEditGroup = React.useCallback(() => setIsEditModalOpen(true), []);
  const handleCloseEditModal = React.useCallback(() => setIsEditModalOpen(false), []);

  const handleOpenPolicy = React.useCallback(() => handlePolicyChange('open'), [handlePolicyChange]);
  const handleRestrictedPolicy = React.useCallback(
    () => handlePolicyChange('restricted'),
    [handlePolicyChange],
  );

  const handleProfileNavigation = React.useCallback(
    (id: string) => {
      navigation.navigate('PublicProfile', { id, type: 'user' });
    },
    [navigation],
  );

  const handleUpdateSuccess = React.useCallback((updatedGroup: any) => {
    setGroup(updatedGroup as any);
    setPolicy(updatedGroup.join_policy as any);
    setIsEditModalOpen(false);
  }, []);

  if (!group && loading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!group) return null;

  return (
    <ScreenWrapper className="bg-phase-canvas">
      <VStack className="p-4 gap-6">
        {/* Header & Settings */}
        <VStack className="gap-4">
          <HStack className="justify-between items-center">
            <VStack>
              <Heading className="text-xl font-bold text-ink">{group.name}</Heading>
              <Text className="text-ink/60">Member Management</Text>
            </VStack>
            <Pressable
              onPress={handleEditGroup}
              className="p-3 rounded-xl bg-phase-interactive"
              accessibilityRole="button"
              accessibilityLabel="Open group settings"
            >
              <Icon as={Settings} size="sm" className="text-white" />
            </Pressable>
          </HStack>

          <Box className="p-4 rounded-xl bg-phase-interactive/10 border border-phase-interactive/20">
            <HStack className="gap-2 items-center">
              <Icon as={Info} size="xs" className="text-phase-interactive" />
              <Text className="text-xs text-ink/60">
                Current Policy:{' '}
                <Text className="font-bold text-phase-interactive">{policy?.toUpperCase()}</Text>
              </Text>
            </HStack>
          </Box>

          <HStack className="gap-3">
            <Button
              variant={policy === 'open' ? 'solid' : 'outline'}
              onPress={handleOpenPolicy}
              className={`flex-1 h-11 rounded-xl ${policy === 'open' ? 'bg-phase-interactive' : 'border-border'}`}
            >
              <Text
                className={`text-xs font-bold ${policy === 'open' ? 'text-white' : 'text-ink'}`}
              >
                NO VERIFICATION
              </Text>
            </Button>
            <Button
              variant={policy === 'restricted' ? 'solid' : 'outline'}
              onPress={handleRestrictedPolicy}
              className={`flex-1 h-11 rounded-xl ${policy === 'restricted' ? 'bg-phase-interactive' : 'border-border'}`}
            >
              <Text
                className={`text-xs font-bold ${policy === 'restricted' ? 'text-white' : 'text-ink'}`}
              >
                NEED VERIFICATION
              </Text>
            </Button>
          </HStack>
        </VStack>

        {/* Pending Requests */}
        <VStack className="gap-4">
          <HStack className="justify-between items-center px-1">
            <Text className="font-bold text-ink">Pending Requests ({pendingMembers.length})</Text>
            {pendingMembers.length > 0 && (
              <Pressable
                onPress={handleApproveAll}
                accessibilityRole="button"
                accessibilityLabel="Approve all pending membership requests"
              >
                <Text className="text-phase-interactive font-semibold text-sm">Approve All</Text>
              </Pressable>
            )}
          </HStack>

          {pendingMembers.length === 0 ? (
            <Box className="bg-phase-surface/50 border border-border border-dashed p-8 rounded-2xl items-center">
              <Text className="text-center text-ink/40">No pending requests at the moment.</Text>
            </Box>
          ) : (
            pendingMembers.map((request: any) => (
              <Box
                key={request.user_id}
                className="p-4 rounded-2xl bg-phase-surface border border-border"
              >
                <HStack className="justify-between items-center">
                  <VStack className="gap-1 flex-1">
                    <Text className="font-semibold text-ink">{request.user?.full_name}</Text>
                    <HStack className="gap-1 items-center">
                      <Icon as={Shield} size="xs" className="text-ink/40" />
                      <Text className="text-xs text-ink/40">
                        {request.user?.authority?.toUpperCase() || 'USER'}
                      </Text>
                    </HStack>
                    <HStack className="gap-2 items-center mt-2">
                      {request.user?.index_number && (
                        <Box className="bg-amber-500/10 rounded-md border border-amber-500/30 px-2 py-0.5">
                          <Text className="text-[10px] text-amber-500 font-bold">
                            INDEX: {request.user.index_number}
                          </Text>
                        </Box>
                      )}
                      {request.user?.nic_number && (
                        <Box className="bg-amber-500/10 rounded-md border border-amber-500/30 px-2 py-0.5">
                          <Text className="text-[10px] text-amber-500 font-bold">
                            NIC: {request.user.nic_number}
                          </Text>
                        </Box>
                      )}
                    </HStack>
                  </VStack>
                  <HStack className="gap-2">
                    <Pressable
                      onPress={() => handleApproval(request.user_id, 'rejected')}
                      className="p-3 rounded-full bg-phase-danger/10"
                      accessibilityRole="button"
                      accessibilityLabel={`Reject request from ${request.user?.full_name}`}
                    >
                      <Icon as={UserX} size="sm" className="text-phase-danger" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleApproval(request.user_id, 'active')}
                      className="p-3 rounded-full bg-phase-reward/10"
                      accessibilityRole="button"
                      accessibilityLabel={`Approve request from ${request.user?.full_name}`}
                    >
                      <Icon as={UserCheck} size="sm" className="text-phase-reward" />
                    </Pressable>
                  </HStack>
                </HStack>
              </Box>
            ))
          )}
        </VStack>

        {/* Active Members & Capacity Management */}
        <VStack className="gap-4">
          <Text className="font-bold text-ink px-1">Active Members ({activeMembers.length})</Text>
          {activeMembers.map((member) => {
            const isOwner = member.capacity === 'owner';
            const isAdmin = member.capacity === 'admin';
            const isMe = member.user_id === userId;
            const canManage = can('manage', {
              __typename: 'CommunityGroup',
              groupId,
              memberId: member.user_id,
            } as any);

            return (
              <Pressable
                key={member.user_id}
                onPress={() => handleProfileNavigation(member.user_id)}
                accessibilityRole="button"
                accessibilityLabel={`View profile of ${member.user?.full_name}`}
              >
                <Box
                  className={`p-4 rounded-2xl bg-phase-surface border ${
                    isOwner ? 'border-amber-500/50' : 'border-border'
                  }`}
                >
                  <HStack className="justify-between items-center">
                    <HStack className="gap-3 items-center flex-1">
                      <Box className="w-10 h-10 rounded-full bg-phase-interactive items-center justify-center">
                        <Text className="font-bold text-white uppercase">
                          {member.user?.full_name?.charAt(0) || '?'}
                        </Text>
                      </Box>
                      <VStack className="gap-0.5">
                        <Text className="font-semibold text-ink">
                          {member.user?.full_name} {isMe ? '(You)' : ''}
                        </Text>
                        <HStack className="gap-1 items-center">
                          <Icon
                            as={Shield}
                            size="xs"
                            className={
                              isOwner
                                ? 'text-amber-500'
                                : isAdmin
                                  ? 'text-phase-interactive'
                                  : 'text-ink/40'
                            }
                          />
                          <Text
                            className={`text-[10px] font-bold ${
                              isOwner
                                ? 'text-amber-500'
                                : isAdmin
                                  ? 'text-phase-interactive'
                                  : 'text-ink/40'
                            }`}
                          >
                            {member.capacity.toUpperCase()}
                          </Text>
                        </HStack>
                      </VStack>
                    </HStack>

                    {canManage && !isOwner && !isMe && (
                      <HStack className="gap-2">
                        <Button
                          variant="outline"
                          onPress={() =>
                            handleCapacityChange(member.user_id, isAdmin ? 'member' : 'admin')
                          }
                          className="h-8 px-3 border-border rounded-lg"
                        >
                          <Text className="text-ink text-[10px] font-bold">
                            {isAdmin ? 'DEMOTE' : 'PROMOTE'}
                          </Text>
                        </Button>
                      </HStack>
                    )}
                  </HStack>
                </Box>
              </Pressable>
            );
          })}
        </VStack>
      </VStack>

      <CreateGroupModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        mode="edit"
        initialData={
          group
            ? {
                id: group.id,
                name: group.name,
                handle: group.handle,
                description: group.description,
                groupType: (group.group_type || group.type) as any,
                joinPolicy: group.join_policy as any,
                imageUrl: group.image_url,
              }
            : undefined
        }
        onSuccess={handleUpdateSuccess}
      />
    </ScreenWrapper>
  );
}
