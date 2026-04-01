import React, { useEffect, useState } from 'react';
import { VStack, HStack, Text, Button, Theme, useThemedColors, ScreenWrapper, LoadingOverlay, hapticLight, Box, Pressable, useLotusToast } from '@repo/ui';
import { UserCheck, UserX, Shield, Settings, Info } from 'lucide-react-native';
import { usePermissions } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@repo/core';
import { communityAPI } from '../api/community';
import { CommunityGroup } from '../types';
import CreateGroupModal from './CreateGroupModal';

interface GroupMemberManagementProps {
    groupId: string;
}

export default function GroupMemberManagement({ groupId }: GroupMemberManagementProps) {
    const navigation = useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [group, setGroup] = useState<CommunityGroup | null>(null);
    const [pendingMembers, setPendingMembers] = useState<any[]>([]);
    const [activeMembers, setActiveMembers] = useState<any[]>([]);
    const [currentUserMemberRecord, setCurrentUserMemberRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [policy, setPolicy] = useState<string>('restricted');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { context, can } = usePermissions();
    const userId = context.userId;

    useEffect(() => {
        loadData();
    }, [groupId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [groupData, pending, active] = await Promise.all([
                communityAPI.getGroupById(groupId),
                communityAPI.getPendingMembers(groupId),
                communityAPI.getActiveMembers(groupId)
            ]);

            setGroup(groupData);
            setPendingMembers(pending);
            setActiveMembers(active);
            setPolicy(groupData.join_policy);

            const myRecord = active.find((m: any) => m.user_id === userId);
            setCurrentUserMemberRecord(myRecord);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (targetUserId: string, status: 'active' | 'rejected') => {
        try {
            await communityAPI.handleMemberRequest(groupId, targetUserId, status);
            hapticLight();
            showToast({
                message: status === 'active' ? "Access granted to the Sanctuary." : "The request has been gently declined.",
                type: status === 'active' ? 'success' : 'info'
            });
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    const handlePolicyChange = async (newPolicy: string) => {
        try {
            await communityAPI.updateJoiningPolicy(groupId, newPolicy);
            setPolicy(newPolicy);
            hapticLight();
            showToast({
                message: `Joining policy updated to ${newPolicy.toUpperCase()}.`,
                type: 'success'
            });
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    async function handleCapacityChange(targetUserId: string, newCapacity: 'admin' | 'member') {
        try {
            setLoading(true);
            await communityAPI.updateMemberAuthority(groupId, targetUserId, newCapacity);
            hapticLight();
            showToast({
                message: newCapacity === 'admin' ? "Guardian mantle bestowed." : "Relieved of administrative duties.",
                type: 'success'
            });
            await loadData();
        } catch (error) {
            console.error(error);
            showToast({ message: "Higher authority required for this shift.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }

    if (!group && loading) {
        return <LoadingOverlay visible={true} />;
    }

    if (!group) return null;

    return (
        <ScreenWrapper>
            <VStack sx={{ padding: Theme.spacing.lg, gap: Theme.spacing.xl }}>
                {/* Header & Settings */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <VStack>
                            <Text sx={{ fontSize: Theme.typography.fontSize.xl, fontWeight: '700', color: Theme.colors.sacredWhite }}>
                                {group.name}
                            </Text>
                            <Text sx={{ color: colors?.textSecondary || Theme.colors.mistGray }}>
                                Member Management
                            </Text>
                        </VStack>
                        <Pressable 
                            onPress={() => setIsEditModalOpen(true)}
                            sx={{ 
                                padding: Theme.spacing.sm, 
                                borderRadius: Theme.corners.comfortable, 
                                backgroundColor: colors?.tertiary || Theme.colors.ink 
                            }}
                        >
                            <Settings size={20} color={colors?.textPrimary || Theme.colors.sacredWhite} />
                        </Pressable>
                    </HStack>

                    <Box 
                        sx={{ 
                            padding: Theme.spacing.md, 
                            borderRadius: Theme.corners.comfortable, 
                            backgroundColor: (colors?.tertiary || Theme.colors.ink) + '40', 
                            borderWidth: 1, 
                            borderColor: colors?.border || 'rgba(255,255,255,0.1)' 
                        }}
                    >
                        <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                            <Info size={16} color={Theme.colors.sanctuarySaffron} />
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors?.textSecondary || Theme.colors.mistGray }}>
                                Current Policy: <Text sx={{ fontWeight: '700', color: Theme.colors.sanctuarySaffron }}>{policy?.toUpperCase()}</Text>
                            </Text>
                        </HStack>
                    </Box>

                    <HStack sx={{ gap: Theme.spacing.sm }}>
                        <Button
                            variant={policy === 'open' ? 'solid' : 'outline'}
                            onPress={() => handlePolicyChange('open')}
                            sx={{ flex: 1, height: 40 }}
                        >
                            <Text sx={{ color: policy === 'open' ? Theme.colors.obsidian : Theme.colors.sacredWhite, fontSize: 12, fontWeight: '700' }}>
                                NO VERIFICATION
                            </Text>
                        </Button>
                        <Button
                            variant={policy === 'restricted' ? 'solid' : 'outline'}
                            onPress={() => handlePolicyChange('restricted')}
                            sx={{ flex: 1, height: 40 }}
                        >
                            <Text sx={{ color: policy === 'restricted' ? Theme.colors.obsidian : Theme.colors.sacredWhite, fontSize: 12, fontWeight: '700' }}>
                                NEED VERIFICATION
                            </Text>
                        </Button>
                    </HStack>
                </VStack>

                {/* Pending Requests */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                            Pending Requests ({pendingMembers.length})
                        </Text>
                        {pendingMembers.length > 0 && (
                            <Pressable
                                onPress={() => {
                                    communityAPI.approveAllPending(groupId)
                                        .then(loadData)
                                        .catch(() => { /* non-fatal */ });
                                }}
                            >
                                <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '600' }}>
                                    Approve All
                                </Text>
                            </Pressable>
                        )}
                    </HStack>

                    {pendingMembers.length === 0 ? (
                        <Text sx={{ textAlign: 'center', color: colors?.textSecondary || Theme.colors.mistGray, py: 20 }}>
                            No pending requests at the moment.
                        </Text>
                    ) : (
                        pendingMembers.map((request: any) => (
                            <Box
                                key={request.user_id}
                                sx={{
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors?.tertiary || Theme.colors.ink,
                                    borderWidth: 1,
                                    borderColor: colors?.border || 'rgba(255,255,255,0.1)'
                                }}
                            >
                                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <VStack sx={{ gap: 2, flex: 1 }}>
                                        <Text sx={{ fontWeight: '600', color: Theme.colors.sacredWhite }}>
                                            {request.user?.full_name}
                                        </Text>
                                        <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                            <Shield size={12} color={colors?.textSecondary || Theme.colors.mistGray} />
                                            <Text sx={{ fontSize: 12, color: colors?.textSecondary || Theme.colors.mistGray }}>
                                                {request.user?.authority?.toUpperCase() || 'USER'}
                                            </Text>
                                        </HStack>
                                        <HStack space="md" sx={{ alignItems: 'center', marginTop: 4 }}>
                                            {request.user?.index_number && (
                                                <Box sx={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', borderRadius: Theme.corners.tight, borderWidth: 1, borderColor: 'rgba(230, 126, 34, 0.3)', paddingHorizontal: 8, paddingVertical: 2 }}>
                                                    <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>
                                                        INDEX: {request.user.index_number}
                                                    </Text>
                                                </Box>
                                            )}
                                            {request.user?.nic_number && (
                                                <Box sx={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', borderRadius: Theme.corners.tight, borderWidth: 1, borderColor: 'rgba(230, 126, 34, 0.3)', paddingHorizontal: 8, paddingVertical: 2 }}>
                                                    <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>
                                                        NIC: {request.user.nic_number}
                                                    </Text>
                                                </Box>
                                            )}
                                        </HStack>
                                    </VStack>
                                    <HStack sx={{ gap: Theme.spacing.sm }}>
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'rejected')}
                                            sx={{ padding: 10, borderRadius: 50, backgroundColor: (colors?.error || Theme.colors.emberRed) + '20' }}
                                        >
                                            <UserX size={20} color={colors?.error || Theme.colors.emberRed} />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'active')}
                                            sx={{ padding: 10, borderRadius: 50, backgroundColor: (colors?.success || Theme.colors.sageGreen) + '20' }}
                                        >
                                            <UserCheck size={20} color={colors?.success || Theme.colors.sageGreen} />
                                        </Pressable>
                                    </HStack>
                                </HStack>
                            </Box>
                        ))
                    )}
                </VStack>

                {/* Active Members & Capacity Management */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <Text sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                        Active Members ({activeMembers.length})
                    </Text>
                    {activeMembers.map((member) => {
                        const isOwner = member.capacity === 'owner';
                        const isAdmin = member.capacity === 'admin';
                        const isMe = member.user_id === userId;
                        const canManage = can('manage', { __typename: 'CommunityGroup', groupId, memberId: member.user_id } as any);

                        return (
                            <Pressable 
                                key={member.user_id}
                                onPress={() => navigation.navigate('PublicProfile', {
                                    id: member.user_id,
                                    type: 'user'
                                })}
                            >
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors?.tertiary || Theme.colors.ink,
                                        borderWidth: 1,
                                        borderColor: isOwner ? Theme.colors.sanctuarySaffron : (colors?.border || 'rgba(255,255,255,0.1)')
                                    }}
                                >
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center', flex: 1 }}>
                                            <Box 
                                                sx={{ 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: 20, 
                                                    backgroundColor: colors?.secondary || Theme.colors.obsidian, 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center' 
                                                }}
                                            >
                                                <Text sx={{ fontWeight: '700', color: Theme.colors.sacredWhite }}>
                                                    {member.user?.full_name?.charAt(0) || '?'}
                                                </Text>
                                            </Box>
                                            <VStack sx={{ gap: 2 }}>
                                                <Text sx={{ fontWeight: '600', color: Theme.colors.sacredWhite }}>
                                                    {member.user?.full_name} {isMe ? '(You)' : ''}
                                                </Text>
                                                <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                                    <Shield size={12} color={isOwner ? Theme.colors.sanctuarySaffron : (isAdmin ? (colors?.textPrimary || Theme.colors.sacredWhite) : (colors?.textSecondary || Theme.colors.mistGray))} />
                                                    <Text sx={{
                                                        fontSize: 12,
                                                        fontWeight: (isOwner || isAdmin) ? '700' : '400',
                                                        color: isOwner ? Theme.colors.sanctuarySaffron : (isAdmin ? (colors?.textPrimary || Theme.colors.sacredWhite) : (colors?.textSecondary || Theme.colors.mistGray))
                                                    }}>
                                                        {member.capacity.toUpperCase()}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        {canManage && !isOwner && !isMe && (
                                            <HStack sx={{ gap: Theme.spacing.sm }}>
                                                <Button
                                                    variant="outline"
                                                    onPress={() => handleCapacityChange(member.user_id, isAdmin ? 'member' : 'admin')}
                                                    sx={{ height: 32, paddingHorizontal: 12 }}
                                                >
                                                    <Text sx={{ color: Theme.colors.sacredWhite, fontSize: 10, fontWeight: '700' }}>
                                                        {isAdmin ? "DEMOTE" : "PROMOTE"}
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
            <LoadingOverlay visible={loading} />
            
            <CreateGroupModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                mode="edit"
                initialData={group ? {
                    id: group.id,
                    name: group.name,
                    handle: group.handle,
                    description: group.description,
                    groupType: (group.group_type || group.type) as any,
                    joinPolicy: group.join_policy as any,
                    imageUrl: group.image_url
                } : undefined}
                onSuccess={(updatedGroup) => {
                    setGroup(updatedGroup as any);
                    setPolicy(updatedGroup.join_policy as any);
                    setIsEditModalOpen(false);
                }}
            />
        </ScreenWrapper>
    );
}
