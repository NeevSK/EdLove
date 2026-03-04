import React, { useEffect, useState } from 'react';
import { VStack, HStack, Text, Button, Theme, useThemedColors, ScreenWrapper, LoadingOverlay, hapticLight, Box, Pressable, useLotusToast } from '@repo/ui';
import { UserCheck, UserX, Shield, Settings, Info } from 'lucide-react-native';
import { UserRole, useUserRole } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@repo/core';
import { communityAPI } from '../api/community';
import { CommunityGroup } from '../types';

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
    const { userId } = useUserRole();

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

    const handleApproval = async (userId: string, status: 'active' | 'rejected') => {
        try {
            await communityAPI.handleMemberRequest(groupId, userId, status);
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
            loadData();
        } catch (error) {
            console.error(error);
        }
    };

    if (!group) return <LoadingOverlay visible={true} />;

    return (
        <ScreenWrapper>
            <VStack sx={{ padding: Theme.spacing.lg, gap: Theme.spacing.xl }}>
                {/* Header & Settings */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <VStack>
                            <Text sx={{ fontSize: Theme.typography.fontSize.xl, fontWeight: '700' }}>{group.name}</Text>
                            <Text sx={{ color: colors.textSecondary }}>Member Management</Text>
                        </VStack>
                        <Pressable sx={{ padding: Theme.spacing.sm, borderRadius: Theme.corners.comfortable, backgroundColor: colors.tertiary }}>
                            <Settings size={20} color={colors.textPrimary} />
                        </Pressable>
                    </HStack>

                    <Box sx={{ padding: Theme.spacing.md, borderRadius: Theme.corners.comfortable, backgroundColor: colors.tertiary + '40', borderWidth: 1, borderColor: colors.border }}>
                        <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                            <Info size={16} color={Theme.colors.sanctuarySaffron} />
                            <Text sx={{ fontSize: Theme.typography.fontSize.xs, color: colors.textSecondary }}>
                                Current Policy: <Text sx={{ fontWeight: '700', color: Theme.colors.sanctuarySaffron }}>{policy.toUpperCase()}</Text>
                            </Text>
                        </HStack>
                    </Box>

                    <HStack sx={{ gap: Theme.spacing.sm }}>
                        <Button
                            label="No Verification"
                            onPress={() => handlePolicyChange('open')}
                            variant={policy === 'open' ? 'primary' : 'secondary'}
                            sx={{ flex: 1 }}
                        />
                        <Button
                            label="Need Verification"
                            onPress={() => handlePolicyChange('restricted')}
                            variant={policy === 'restricted' ? 'primary' : 'secondary'}
                            sx={{ flex: 1 }}
                        />
                    </HStack>
                </VStack>

                {/* Pending Requests */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text sx={{ fontWeight: '700' }}>Pending Requests ({pendingMembers.length})</Text>
                        {pendingMembers.length > 0 && (
                            <Pressable
                                onPress={() =>
                                    communityAPI.approveAllPending(groupId)
                                        .then(loadData)
                                        .catch(() => { /* non-fatal — individual approve buttons remain available */ })
                                }
                                accessibilityLabel="Approve all pending requests"
                            >
                                <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '600' }}>Approve All</Text>
                            </Pressable>
                        )}
                    </HStack>

                    {pendingMembers.length === 0 ? (
                        <Text sx={{ textAlign: 'center', color: colors.textSecondary, py: 20 }}>No pending requests at the moment.</Text>
                    ) : (
                        pendingMembers.map((request: any) => (
                            <Box
                                key={request.user_id}
                                sx={{
                                    padding: Theme.spacing.md,
                                    borderRadius: Theme.corners.comfortable,
                                    backgroundColor: colors.tertiary,
                                    borderWidth: 1,
                                    borderColor: colors.border
                                }}
                            >
                                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                    <VStack sx={{ gap: 2 }}>
                                        <Text sx={{ fontWeight: '600' }}>{request.user?.full_name}</Text>
                                        <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                            <Shield size={12} color={colors.textSecondary} />
                                            <Text sx={{ fontSize: 12, color: colors.textSecondary }}>{request.user?.role.toUpperCase()}</Text>
                                        </HStack>
                                        <HStack space="md" alignItems="center" mt="$1">
                                            {request.user?.index_number && (
                                                <Box px="$2" py="$0.5" sx={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', borderRadius: Theme.corners.tight, borderWidth: 1, borderColor: 'rgba(230, 126, 34, 0.3)' }}>
                                                    <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>INDEX: {request.user.index_number}</Text>
                                                </Box>
                                            )}
                                            {request.user?.nic_number && (
                                                <Box px="$2" py="$0.5" sx={{ backgroundColor: 'rgba(230, 126, 34, 0.1)', borderRadius: Theme.corners.tight, borderWidth: 1, borderColor: 'rgba(230, 126, 34, 0.3)' }}>
                                                    <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron, fontWeight: '700' }}>NIC: {request.user.nic_number}</Text>
                                                </Box>
                                            )}
                                        </HStack>
                                    </VStack>
                                    <HStack sx={{ gap: Theme.spacing.sm }}>
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'rejected')}
                                            accessibilityLabel={`Reject ${request.user?.full_name ?? 'member'}`}
                                            sx={{ padding: 10, borderRadius: 50, backgroundColor: `${colors.error}20` }}
                                        >
                                            <UserX size={20} color={colors.error} />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'active')}
                                            accessibilityLabel={`Approve ${request.user?.full_name ?? 'member'}`}
                                            sx={{ padding: 10, borderRadius: 50, backgroundColor: `${colors.success}20` }}
                                        >
                                            <UserCheck size={20} color={colors.success} />
                                        </Pressable>
                                    </HStack>
                                </HStack>
                            </Box>
                        ))
                    )}
                </VStack>

                {/* Active Members & Role Management */}
                <VStack sx={{ gap: Theme.spacing.md }}>
                    <Text sx={{ fontWeight: '700' }}>Active Members ({activeMembers.length})</Text>
                    {activeMembers.map((member) => {
                        const isOwner = member.role === 'owner';
                        const isAdmin = member.role === 'admin';
                        const isMe = member.user_id === userId;
                        const canManage = currentUserMemberRecord?.role === 'owner' && !isMe && !isOwner;

                        return (
                            <Pressable
                                key={member.user_id}
                                onPress={() => navigation.navigate('UserProfile', {
                                    userId: member.user_id,
                                    userName: member.user?.full_name || 'Member'
                                })}
                            >
                                <Box
                                    sx={{
                                        padding: Theme.spacing.md,
                                        borderRadius: Theme.corners.comfortable,
                                        backgroundColor: colors.tertiary,
                                        borderWidth: 1,
                                        borderColor: isOwner ? Theme.colors.sanctuarySaffron : colors.border
                                    }}
                                >
                                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                                        <HStack sx={{ gap: Theme.spacing.md, alignItems: 'center' }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text sx={{ fontWeight: '700' }}>{member.user?.full_name?.charAt(0) || '?'}</Text>
                                            </Box>
                                            <VStack sx={{ gap: 2 }}>
                                                <Text sx={{ fontWeight: '600' }}>{member.user?.full_name} {isMe ? '(You)' : ''}</Text>
                                                <HStack sx={{ gap: Theme.spacing.xs, alignItems: 'center' }}>
                                                    <Shield size={12} color={isOwner ? Theme.colors.sanctuarySaffron : (isAdmin ? colors.textPrimary : colors.textSecondary)} />
                                                    <Text sx={{
                                                        fontSize: 12,
                                                        fontWeight: (isOwner || isAdmin) ? '700' : '400',
                                                        color: isOwner ? Theme.colors.sanctuarySaffron : (isAdmin ? colors.textPrimary : colors.textSecondary)
                                                    }}>
                                                        {member.role.toUpperCase()}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        {canManage && (
                                            <HStack sx={{ gap: Theme.spacing.sm }}>
                                                <Button
                                                    label={isAdmin ? "Demote" : "Promote"}
                                                    onPress={() => handleRoleChange(member.user_id, isAdmin ? 'member' : 'admin')}
                                                    variant="outline"
                                                    sx={{ height: 32, paddingHorizontal: 12 }}
                                                />
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
        </ScreenWrapper>
    );

    async function handleRoleChange(targetUserId: string, newRole: 'admin' | 'member') {
        try {
            setLoading(true);
            await communityAPI.updateMemberRole(groupId, targetUserId, newRole);
            hapticLight();
            showToast({
                message: newRole === 'admin' ? "Guardian mantle bestowed." : "Relieved of administrative duties.",
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
}
