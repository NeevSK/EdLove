import React, { useEffect, useState } from 'react';
import { 
    VStack, 
    HStack, 
    Text, 
    Button, 
    ScreenWrapper, 
    LoadingOverlay, 
    hapticLight, 
    Box, 
    Pressable, 
    useSanctuaryToast,
    useTheme
} from '@repo/ui';
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
    const { theme } = useTheme();
    const { showToast } = useSanctuaryToast();
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
            <VStack className="p-lg gap-xl">
                {/* Header & Settings */}
                <VStack className="gap-md">
                    <HStack className="justify-between items-center">
                        <VStack>
                            <Text className="text-xl font-bold text-phaseText-primary">
                                {group.name}
                            </Text>
                            <Text className="text-phaseText-secondary">
                                Member Management
                            </Text>
                        </VStack>
                        <Pressable 
                            onPress={() => setIsEditModalOpen(true)}
                            className="p-sm rounded-comfortable bg-phase-interactive"
                        >
                            <Settings size={20} color={theme.text.primary} />
                        </Pressable>
                    </HStack>

                    <Box className="p-md rounded-comfortable bg-phase-interactive/40 border border-phase-interactive/20">
                        <HStack className="gap-sm items-center">
                            <Info size={16} color={theme.accent.action} />
                            <Text className="text-xs text-phaseText-secondary">
                                Current Policy: <Text className="font-bold text-phase-accent">{policy?.toUpperCase()}</Text>
                            </Text>
                        </HStack>
                    </Box>

                    <HStack className="gap-sm">
                        <Button
                            variant={policy === 'open' ? 'solid' : 'outline'}
                            onPress={() => handlePolicyChange('open')}
                            className="flex-1 h-10"
                        >
                            <Text className={`text-xs font-bold ${policy === 'open' ? 'text-phaseText-inverse' : 'text-phaseText-primary'}`}>
                                NO VERIFICATION
                            </Text>
                        </Button>
                        <Button
                            variant={policy === 'restricted' ? 'solid' : 'outline'}
                            onPress={() => handlePolicyChange('restricted')}
                            className="flex-1 h-10"
                        >
                            <Text className={`text-xs font-bold ${policy === 'restricted' ? 'text-phaseText-inverse' : 'text-phaseText-primary'}`}>
                                NEED VERIFICATION
                            </Text>
                        </Button>
                    </HStack>
                </VStack>

                {/* Pending Requests */}
                <VStack className="gap-md">
                    <HStack className="justify-between items-center">
                        <Text className="font-bold text-phaseText-primary">
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
                                <Text className="text-phase-accent font-semibold">
                                    Approve All
                                </Text>
                            </Pressable>
                        )}
                    </HStack>

                    {pendingMembers.length === 0 ? (
                        <Text className="text-center text-phaseText-secondary py-5">
                            No pending requests at the moment.
                        </Text>
                    ) : (
                        pendingMembers.map((request: any) => (
                            <Box
                                key={request.user_id}
                                className="p-md rounded-comfortable bg-phase-surface border border-phase-interactive/20"
                            >
                                <HStack className="justify-between items-center">
                                    <VStack className="gap-0.5 flex-1">
                                        <Text className="font-semibold text-phaseText-primary">
                                            {request.user?.full_name}
                                        </Text>
                                        <HStack className="gap-xs items-center">
                                            <Shield size={12} color={theme.text.secondary} />
                                            <Text className="text-xs text-phaseText-secondary">
                                                {request.user?.authority?.toUpperCase() || 'USER'}
                                            </Text>
                                        </HStack>
                                        <HStack className="gap-md items-center mt-1">
                                            {request.user?.index_number && (
                                                <Box className="bg-amber-500/10 rounded-tight border border-amber-500/30 px-2 py-0.5">
                                                    <Text className="text-[10px] text-amber-500 font-bold">
                                                        INDEX: {request.user.index_number}
                                                    </Text>
                                                </Box>
                                            )}
                                            {request.user?.nic_number && (
                                                <Box className="bg-amber-500/10 rounded-tight border border-amber-500/30 px-2 py-0.5">
                                                    <Text className="text-[10px] text-amber-500 font-bold">
                                                        NIC: {request.user.nic_number}
                                                    </Text>
                                                </Box>
                                            )}
                                        </HStack>
                                    </VStack>
                                    <HStack className="gap-sm">
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'rejected')}
                                            className="p-2.5 rounded-full bg-red-500/20"
                                        >
                                            <UserX size={20} color={theme.accent.danger} />
                                        </Pressable>
                                        <Pressable
                                            onPress={() => handleApproval(request.user_id, 'active')}
                                            className="p-2.5 rounded-full bg-green-500/20"
                                        >
                                            <UserCheck size={20} color={theme.accent.sageGreen} />
                                        </Pressable>
                                    </HStack>
                                </HStack>
                            </Box>
                        ))
                    )}
                </VStack>

                {/* Active Members & Capacity Management */}
                <VStack className="gap-md">
                    <Text className="font-bold text-phaseText-primary">
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
                                    className={`p-md rounded-comfortable bg-phase-surface border ${
                                        isOwner ? 'border-phase-accent' : 'border-phase-interactive/20'
                                    }`}
                                >
                                    <HStack className="justify-between items-center">
                                        <HStack className="gap-md items-center flex-1">
                                            <Box className="w-10 h-10 rounded-full bg-phase-interactive items-center justify-center">
                                                <Text className="font-bold text-phaseText-primary">
                                                    {member.user?.full_name?.charAt(0) || '?'}
                                                </Text>
                                            </Box>
                                            <VStack className="gap-0.5">
                                                <Text className="font-semibold text-phaseText-primary">
                                                    {member.user?.full_name} {isMe ? '(You)' : ''}
                                                </Text>
                                                <HStack className="gap-xs items-center">
                                                    <Shield size={12} color={isOwner ? theme.accent.action : (isAdmin ? theme.text.primary : theme.text.secondary)} />
                                                    <Text className={`text-xs ${
                                                        (isOwner || isAdmin) ? 'font-bold' : 'font-normal'
                                                    } ${
                                                        isOwner ? 'text-phase-accent' : (isAdmin ? 'text-phaseText-primary' : 'text-phaseText-secondary')
                                                    }`}>
                                                        {member.capacity.toUpperCase()}
                                                    </Text>
                                                </HStack>
                                            </VStack>
                                        </HStack>

                                        {canManage && !isOwner && !isMe && (
                                            <HStack className="gap-sm">
                                                <Button
                                                    variant="outline"
                                                    onPress={() => handleCapacityChange(member.user_id, isAdmin ? 'member' : 'admin')}
                                                    className="h-8 px-3"
                                                >
                                                    <Text className="text-phaseText-primary text-[10px] font-bold">
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
