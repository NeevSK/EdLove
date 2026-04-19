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
                message: 'Access Key Revoked',
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
                message: 'New Governance Key Generated',
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
                message: 'Copied to Command Buffer',
                type: 'success'
            });
        } catch (err) {
            handleAPIError(err);
        }
    };

    return (
        <VStack className="flex-1 bg-phase-canvas">
            <ScrollView showsVerticalScrollIndicator={false}>
                <VStack className="gap-8 p-5 pb-24">
                    {/* Header Group */}
                    <VStack className="gap-5">
                        <Pressable onPress={() => { hapticLight(); onBack(); }} className="active:opacity-70">
                            <HStack className="items-center gap-2 bg-phase-surface px-4 py-2.5 rounded-2xl border border-phase-border self-start shadow-sm">
                                <Icon as={ArrowLeft} size="sm" className="text-phaseText-primary" />
                                <Text className="text-[13px] font-black text-phaseText-primary uppercase tracking-widest">Back</Text>
                            </HStack>
                        </Pressable>
                        
                        <VStack className="gap-1.5 px-1">
                            <Heading className="text-[32px] font-black text-phaseText-primary uppercase tracking-tighter leading-none">
                                Governance
                            </Heading>
                            <Text className="text-[14px] font-medium text-phaseText-secondary leading-relaxed">
                                Establish authority anchors and synchronize faculty onboarding protocols.
                            </Text>
                        </VStack>
                    </VStack>

                    {/* Generator Console */}
                    {!isPastView && (
                        <Box className="bg-phase-surface p-7 rounded-[40px] border border-phase-border gap-7 shadow-sm">
                            <VStack className="gap-5">
                                <HStack className="justify-between items-center px-1">
                                    <Heading className="text-[10px] font-black uppercase tracking-[0.25em] text-phaseText-muted">Select Authority Scope</Heading>
                                    <Box className="w-2 h-2 rounded-full bg-phase-interactive shadow-[0_0_8px_rgba(var(--color-phase-interactive),0.5)]" />
                                </HStack>
 
                                <HStack className="gap-3">
                                    <Pressable 
                                        onPress={() => { hapticLight(); setInviteRole('teacher'); }}
                                        className={`flex-1 h-14 rounded-2xl items-center justify-center border-2 transition-all ${inviteRole === 'teacher' ? 'bg-phase-interactive border-phase-interactive shadow-md' : 'bg-phase-canvas border-phase-border'}`}
                                    >
                                        <Text className={`font-black uppercase tracking-widest text-[11px] ${inviteRole === 'teacher' ? 'text-white' : 'text-phaseText-muted'}`}>Staff Anchor</Text>
                                    </Pressable>
                                    <Pressable 
                                        onPress={() => { hapticLight(); setInviteRole('principal'); }}
                                        className={`flex-1 h-14 rounded-2xl items-center justify-center border-2 transition-all ${inviteRole === 'principal' ? 'bg-phase-interactive border-phase-interactive shadow-md' : 'bg-phase-canvas border-phase-border'}`}
                                    >
                                        <Text className={`font-black uppercase tracking-widest text-[11px] ${inviteRole === 'principal' ? 'text-white' : 'text-phaseText-muted'}`}>Lead Anchor</Text>
                                    </Pressable>
                                </HStack>
                            </VStack>
 
                            <Button 
                                onPress={() => { hapticMedium(); handleGenerateCode(); }}
                                isDisabled={generating}
                                className="bg-phaseText-primary h-16 rounded-[20px] items-center justify-center shadow-lg active:scale-95 transition-all"
                            >
                                <HStack className="items-center gap-3">
                                    {generating ? (
                                        <Spinner color="white" size="small" />
                                    ) : (
                                        <>
                                            <Icon as={Plus} className="text-white" size="sm" />
                                            <Text className="text-white font-black uppercase tracking-[0.2em] text-[12px]">Generate Access Key</Text>
                                        </>
                                    )}
                                </HStack>
                            </Button>
                        </Box>
                    )}

                    {/* active keys list */}
                    <VStack className="gap-5">
                        <HStack className="justify-between items-center px-1">
                            <Heading className="text-[20px] font-black text-phaseText-primary uppercase tracking-widest">Active Anchors</Heading>
                            {loading && <Spinner color="phase-interactive" />}
                        </HStack>

                        {inviteCodes.length === 0 && !loading ? (
                            <Box className="p-16 items-center justify-center bg-phase-surface/50 rounded-[40px] border border-dashed border-phase-border">
                                <Icon as={ShieldAlert} size="xl" className="text-phaseText-muted/20 mb-4" />
                                <Text className="text-center font-black text-phaseText-muted uppercase tracking-widest text-[11px]">No initialized vectors</Text>
                            </Box>
                        ) : (
                            <VStack className="gap-4">
                                {inviteCodes.map((invite) => (
                                    <Box 
                                        key={invite.code} 
                                        className="bg-phase-surface p-6 rounded-[32px] border border-phase-border flex-row items-center shadow-sm"
                                    >
                                        <VStack className="flex-1 gap-2.5">
                                            <HStack className="items-center gap-3">
                                                <Text className="text-2xl font-black text-phase-interactive italic tracking-[0.15em] font-mono leading-none">
                                                    {invite.code}
                                                </Text>
                                                <Box className={`px-2.5 py-1 rounded-lg ${invite.authority === 'principal' ? 'bg-phase-warning/10 border border-phase-warning/20' : 'bg-phase-interactive/10 border border-phase-interactive/20'}`}>
                                                    <Text className={`text-[9px] font-black uppercase tracking-widest ${invite.authority === 'principal' ? 'text-phase-warning' : 'text-phase-interactive'}`}>
                                                        {invite.authority}
                                                    </Text>
                                                </Box>
                                            </HStack>
                                            
                                            <HStack className="items-center gap-3">
                                                <Text className="text-[10px] font-black text-phaseText-muted uppercase tracking-[0.1em]">
                                                    {formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}
                                                </Text>
                                                <Box className="w-1 h-1 rounded-full bg-phase-border" />
                                                <Box className={`w-2 h-2 rounded-full ${invite.used ? 'bg-phaseText-muted' : 'bg-phase-success shadow-[0_0_6px_rgba(var(--color-phase-success),0.4)]'}`} />
                                                <Text className={`text-[10px] font-black uppercase tracking-widest ${invite.used ? 'text-phaseText-muted' : 'text-phase-success'}`}>
                                                    {invite.used ? 'Redeemed' : 'Active'}
                                                </Text>
                                            </HStack>
                                        </VStack>

                                        <HStack className="gap-2.5">
                                            <Pressable 
                                                onPress={() => { hapticLight(); copyToClipboard(invite.code); }}
                                                className="w-12 h-12 rounded-2xl bg-phase-canvas items-center justify-center border border-phase-border shadow-inner transition-transform active:scale-90"
                                            >
                                                <Icon as={Copy} className="text-phaseText-primary" size="sm" />
                                            </Pressable>
                                            
                                            {!invite.used && invite.is_active !== false && (
                                                <Pressable 
                                                    onPress={() => { hapticMedium(); handleRevoke(invite.code); }}
                                                    className="w-12 h-12 rounded-2xl bg-phase-danger/10 items-center justify-center border border-phase-danger/20 shadow-inner transition-transform active:scale-90"
                                                >
                                                    <Icon as={X} size="sm" className="text-phase-danger" />
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
