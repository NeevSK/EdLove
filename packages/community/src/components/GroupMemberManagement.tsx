import React, { useEffect, useState } from 'react';
import { VStack, HStack, Text, Button, Theme, useThemedColors, ScreenWrapper, LoadingOverlay, hapticLight, Box, Pressable, useLotusToast } from '@repo/ui';
import { UserCheck, UserX, Shield, Settings, Info } from 'lucide-react-native';
import { UserRole } from '@repo/core';
import { communityAPI } from '../api/community';
import { CommunityGroup } from '../types';

interface GroupMemberManagementProps {
    groupId: string;
}

export default function GroupMemberManagement({ groupId }: GroupMemberManagementProps) {
    const colors = useThemedColors();
    const { showToast } = useLotusToast();
    const [group, setGroup] = useState<CommunityGroup | null>(null);
    const [pendingMembers, setPendingMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [policy, setPolicy] = useState<string>('restricted');

    useEffect(() => {
        loadData();
    }, [groupId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const groupData = await communityAPI.getGroupById(groupId);
            const pending = await communityAPI.getPendingMembers(groupId);
            setGroup(groupData);
            setPendingMembers(pending);
            setPolicy(groupData.join_policy);
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
                            <Pressable onPress={() => communityAPI.approveAllPending(groupId).then(loadData)}>
                                <Text sx={{ color: Theme.colors.sanctuarySaffron, fontWeight: '600' }}>Approve All</Text>
                            </Pressable>
                        )}
                    </HStack>

                    {pendingMembers.length === 0 ? (
                        <Text sx={{ textAlign: 'center', color: colors.textSecondary, py: 20 }}>No pending requests at the moment.</Text>
                    ) : (
                        pendingMembers.map((request) => (
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
                                        {request.user?.index_number && (
                                            <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron }}>Index: {request.user.index_number}</Text>
                                        )}
                                        {request.user?.nic_number && (
                                            <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron }}>NIC: {request.user.nic_number}</Text>
                                        )}
                                    </VStack>
                                    <HStack sx={{ gap: Theme.spacing.sm }}>
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'rejected')}
                                            sx={{ padding: 10, borderRadius: 50, backgroundColor: '#EF444420' }}
                                        >
                                            <UserX size={20} color="#EF4444" />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'active')}
                                            sx={{ padding: 10, borderRadius: 50, backgroundColor: '#10B98120' }}
                                        >
                                            <UserCheck size={20} color="#10B981" />
                                        </Pressable>
                                    </HStack>
                                </HStack>
                            </Box>
                        ))
                    )}
                </VStack>
            </VStack>
            <LoadingOverlay visible={loading} />
        </ScreenWrapper>
    );
}
