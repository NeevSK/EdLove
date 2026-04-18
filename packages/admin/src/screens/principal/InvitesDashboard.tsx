import React, { useEffect, useState, useCallback } from 'react';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Icon, 
    Button,
    ScrollView,
    Spinner,
    useSanctuaryToast as useToast,
    Toast,
    ToastTitle,
    Pressable
} from '@repo/ui';
import { ArrowLeft, Copy, Plus, X, ShieldAlert, Award, QrCode } from 'lucide-react-native';
import { formatDistanceToNow } from 'date-fns';
import { TouchableOpacity, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { invitesAPI, type InviteCode } from '../../invites';
import { handleAPIError } from '@repo/core';

interface InvitesDashboardProps {
    schoolId: string;
    userId: string;
    isPastView: boolean;
    onBack: () => void;
}

export const InvitesDashboard: React.FC<InvitesDashboardProps> = ({ schoolId, userId, isPastView, onBack }) => {
    const [inviteRole, setInviteRole] = useState<'teacher' | 'principal'>('teacher');
    const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const toast = useToast();

    const loadInviteCodes = useCallback(async () => {
        if (!schoolId) return;
        setLoading(true);
        try {
            const codes = await invitesAPI.getInviteCodesBySchool(schoolId);
            setInviteCodes(codes ?? []);
        } catch (error) {
            handleAPIError(error);
        } finally {
            setLoading(false);
        }
    }, [schoolId]);

    useEffect(() => {
        loadInviteCodes();
    }, [loadInviteCodes]);

    const handleRevoke = async (code: string) => {
        if (!schoolId || !userId) return;
        try {
            await invitesAPI.revokeInviteCode(schoolId, code, userId);
            setInviteCodes((current) => 
                current.map(inv => inv.code === code ? { ...inv, is_active: false } : inv)
            );
            toast.showToast({
                message: 'Revoked access key',
                type: 'success'
            });
        } catch (err) {
            handleAPIError(err);
        }
    };

    const handleGenerateCode = async () => {
        if (!schoolId || !userId) return;
        setGenerating(true);
        try {
            const newCode = await invitesAPI.generateInviteCode(schoolId, inviteRole, userId);
            setInviteCodes((current) => [newCode, ...current]);
            toast.showToast({
                message: 'New key generated',
                type: 'success'
            });
        } catch (err) {
            handleAPIError(err);
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = async (code: string) => {
        try {
            await Clipboard.setStringAsync(code);
            toast.showToast({
                message: 'Copied to clipboard',
                type: 'success'
            });
        } catch (err) {
            handleAPIError(err);
        }
    };

    return (
        <VStack className="flex-1 bg-silk">
            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack className="gap-8 p-6 pb-20">
                    {/* Header Group */}
                    <VStack className="gap-4">
                        <Pressable onPress={onBack} className="active:opacity-70">
                            <HStack className="items-center gap-2 bg-phase-surface px-4 py-2 rounded-xl border border-border self-start shadow-sm">
                                <Icon as={ArrowLeft} size="sm" className="text-ink" />
                                <Text className="text-sm font-black text-ink">Back</Text>
                            </HStack>
                        </Pressable>
                        
                        <VStack className="gap-1">
                            <Heading className="text-3xl font-black text-ink uppercase tracking-wider">
                                Governance
                            </Heading>
                            <Text className="text-sm font-bold text-ink/40 leading-relaxed">
                                Establish authority anchors and onboard faculty.
                            </Text>
                        </VStack>
                    </VStack>

                    {/* Generator Console */}
                    {!isPastView && (
                        <Box className="bg-phase-surface p-6 rounded-[32px] border border-border gap-6 shadow-sm">
                            <VStack className="gap-4">
                                <HStack className="justify-between items-center">
                                    <Heading className="text-xs font-black uppercase tracking-[0.2em] text-ink/30">Select Anchor Role</Heading>
                                    <Box className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                </HStack>
 
                                <HStack className="gap-2">
                                    <Pressable 
                                        onPress={() => setInviteRole('teacher')}
                                        className={`flex-1 h-12 rounded-2xl items-center justify-center border-2 transition-all ${inviteRole === 'teacher' ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                                    >
                                        <Text className={`font-black uppercase tracking-widest text-[10px] ${inviteRole === 'teacher' ? 'text-white' : 'text-ink/40'}`}>Teacher</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => setInviteRole('principal')}
                                        className={`flex-1 h-12 rounded-2xl items-center justify-center border-2 transition-all ${inviteRole === 'principal' ? 'bg-primary border-primary' : 'bg-transparent border-border'}`}
                                    >
                                        <Text className={`font-black uppercase tracking-widest text-[10px] ${inviteRole === 'principal' ? 'text-white' : 'text-ink/40'}`}>Principal</Text>
                                    </Pressable>
                                </HStack>
                            </VStack>
 
                            <Button 
                                onPress={handleGenerateCode}
                                isDisabled={generating}
                                className="bg-ink h-14 rounded-2xl items-center justify-center shadow-lg active:scale-95"
                            >
                                <HStack className="items-center gap-2">
                                    {generating ? (
                                        <Spinner color="white" size="small" />
                                    ) : (
                                        <>
                                            <Icon as={Plus} className="text-white" size="sm" />
                                            <Text className="text-white font-black uppercase tracking-[0.1em]">Generate Access Key</Text>
                                        </>
                                    )}
                                </HStack>
                            </Button>
                        </Box>
                    )}

                    {/* active keys list */}
                    <VStack className="gap-4">
                        <HStack className="justify-between items-center px-1">
                            <Heading className="text-lg font-black text-ink uppercase tracking-widest">Active Keys</Heading>
                            {loading && <Spinner color="amber" />}
                        </HStack>

                        {inviteCodes.length === 0 && !loading ? (
                            <Box className="p-12 items-center justify-center bg-ink/5 rounded-3xl border border-dashed border-border">
                                <Icon as={ShieldAlert} size="xl" className="text-ink/10 mb-3" />
                                <Text className="text-center font-bold text-ink/30 italic">No keys initialized</Text>
                            </Box>
                        ) : (
                            <VStack className="gap-3">
                                {inviteCodes.map((invite) => (
                                    <Box 
                                        key={invite.code} 
                                        className="bg-white p-5 rounded-3xl border border-border flex-row items-center shadow-sm"
                                    >
                                        <VStack className="flex-1 gap-2">
                                            <HStack className="items-baseline gap-2">
                                                <Text className="text-2xl font-black text-primary italic tracking-widest font-mono">
                                                    {invite.code}
                                                </Text>
                                                <Box className={`px-2 py-0.5 rounded-lg ${invite.role === 'principal' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                                                    <Text className={`text-[10px] font-black uppercase ${invite.role === 'principal' ? 'text-amber-600' : 'text-blue-600'}`}>
                                                        {invite.role}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                            
                                            <HStack className="gap-3">
                                                <Text className="text-[10px] font-bold text-ink/30 uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                                                </Text>
                                                <Box className={`w-1.5 h-1.5 rounded-full mt-1 ${invite.used ? 'bg-ink/30' : 'bg-green-500'}`} />
                                                <Text className={`text-[10px] font-black uppercase tracking-widest ${invite.used ? 'text-ink/30' : 'text-green-600'}`}>
                                                    {invite.used ? 'Redeemed' : 'Vivid'}
                                                </Text>
                                            </HStack>
                                        </VStack>

                                        <HStack className="gap-2">
                                            <Pressable 
                                                onPress={() => copyToClipboard(invite.code)}
                                                className="w-11 h-11 rounded-2xl bg-phase-surface items-center justify-center border border-border transition-transform active:scale-95"
                                            >
                                                <Icon as={Copy} className="text-ink/60" size="sm" />
                                            </Pressable>
                                            
                                            {!invite.used && invite.is_active !== false && (
                                                <Pressable 
                                                    onPress={() => handleRevoke(invite.code)}
                                                    className="w-11 h-11 rounded-2xl bg-red-500/10 items-center justify-center border border-red-500/20 transition-transform active:scale-95"
                                                >
                                                    <Icon as={X} size="sm" className="text-red-500" />
                                                </Pressable>
                                            )}
                                        </HStack>
                                    </Box>
                                ))}
                            </VStack>
                        )}
                    </VStack>
                </VStack>
            </ScrollView>
        </VStack>
    );
};

export type { InvitesDashboardProps };
