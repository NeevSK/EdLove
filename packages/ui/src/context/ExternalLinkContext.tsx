import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
    Box,
    HStack,
    Text,
    VStack,
} from '../gluestack';
import { useEnvironment } from './EnvironmentContext';
import { useLotusToast } from '../providers/ToastProvider';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../theme/Theme';
import SanctuaryButton from '../components/SanctuaryButton';
import SanctuaryModal from '../components/SanctuaryModal';
import {
    clearStoredExternalOpenPreference,
    ExternalLinkTrustLevel,
    ExternalOpenMethod,
    registerExternalLinkRuntime,
} from '../utils/linking';
import { ArrowLeftRight, Check, ExternalLink, Globe, ShieldAlert, ShieldCheck } from 'lucide-react-native';

interface PendingRequest {
    url: string;
    options: {
        title?: string;
        sourceLabel?: string;
        sourceBadge?: string;
        trustLevel?: ExternalLinkTrustLevel;
    };
    platform: 'web' | 'native';
    defaultMethod: ExternalOpenMethod;
    currentPreference?: ExternalOpenMethod;
    domain: string;
    overrideCount: number;
    resolve: (result: { method: ExternalOpenMethod; persistPreference: boolean } | null) => void;
}

type MethodDefinition = {
    id: ExternalOpenMethod;
    title: string;
    description: string;
};

const webMethods: MethodDefinition[] = [
    {
        id: 'new_tab',
        title: 'Open in New Tab',
        description: 'Keeps Gurudevi open and preserves your place in the sanctuary.',
    },
    {
        id: 'same_tab',
        title: 'Open Here',
        description: 'Replaces the current tab and follows the link in this browser view.',
    },
];

const nativeMethods: MethodDefinition[] = [
    {
        id: 'in_app_browser',
        title: 'Open in App Browser',
        description: 'Stays close to Gurudevi and returns smoothly when you are done.',
    },
    {
        id: 'external_browser',
        title: 'Open in Browser App',
        description: 'Hands off to your default browser for a fully external experience.',
    },
];

function getTrustCopy(level: ExternalLinkTrustLevel | undefined) {
    switch (level) {
        case 'verified':
            return {
                label: 'Verified source',
                note: 'This destination is known and trusted inside the sanctuary.',
                icon: ShieldCheck,
            };
        case 'broken':
            return {
                label: 'Broken or unverified',
                note: 'This link may fail. If it does, you can try another method or report it.',
                icon: ShieldAlert,
            };
        default:
            return {
                label: 'External source',
                note: 'You are moving beyond Gurudevi to a site we do not fully control.',
                icon: Globe,
            };
    }
}

export function ExternalLinkProvider({ children }: { children: React.ReactNode }) {
    const { reality } = useEnvironment();
    const { showToast } = useLotusToast();
    const { text, accent, glass } = useTheme();
    const [pendingRequest, setPendingRequest] = useState<PendingRequest | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<ExternalOpenMethod>('new_tab');
    const [rememberChoice, setRememberChoice] = useState(true);

    useEffect(() => {
        registerExternalLinkRuntime({
            promptForChoice: (request) => {
                setSelectedMethod(request.currentPreference ?? request.defaultMethod);
                setRememberChoice(!request.currentPreference);
                return new Promise((resolve) => {
                    setPendingRequest({ ...request, resolve });
                });
            },
            isOnline: () => reality.networkQuality !== 'offline',
            notifyOffline: (message) => showToast({ message, type: 'error' }),
        });

        return () => registerExternalLinkRuntime(null);
    }, [reality.networkQuality, showToast]);

    const methods = pendingRequest
        ? (pendingRequest.platform === 'web' ? webMethods : nativeMethods)
        : [];
    const trustCopy = getTrustCopy(pendingRequest?.options.trustLevel);
    const TrustIcon = trustCopy.icon;

    const modalSubtitle = useMemo(() => {
        if (!pendingRequest) return '';

        const source = pendingRequest.options.sourceLabel ?? 'Gurudevi';
        if (pendingRequest.currentPreference) {
            return `Your current default from ${source} can be changed here at any time.`;
        }
        return `Choose how links from ${source} should open on this ${pendingRequest.platform === 'web' ? 'browser' : 'device'}.`;
    }, [pendingRequest]);

    const closeRequest = (result: { method: ExternalOpenMethod; persistPreference: boolean } | null) => {
        if (!pendingRequest) return;
        pendingRequest.resolve(result);
        setPendingRequest(null);
    };

    return (
        <>
            {children}
            <SanctuaryModal
                isOpen={!!pendingRequest}
                onClose={() => closeRequest(null)}
                title={pendingRequest?.options.title ?? 'Open external link'}
                subtitle={modalSubtitle}
                icon={<ExternalLink size={18} color={accent.action} />}
                size="md"
                footer={pendingRequest ? (
                    <VStack sx={{ gap: Theme.spacing.sm }}>
                        <HStack sx={{ gap: Theme.spacing.sm, flexWrap: 'wrap' }}>
                            <SanctuaryButton
                                onPress={() => closeRequest({
                                    method: selectedMethod,
                                    persistPreference: rememberChoice,
                                })}
                                fullWidth
                            >
                                Open Now
                            </SanctuaryButton>
                        </HStack>
                        <HStack sx={{ gap: Theme.spacing.sm, flexWrap: 'wrap' }}>
                            <SanctuaryButton
                                variant="outline"
                                action="secondary"
                                onPress={() => closeRequest({
                                    method: selectedMethod,
                                    persistPreference: true,
                                })}
                                fullWidth
                            >
                                Set as Default
                            </SanctuaryButton>
                        </HStack>
                        {pendingRequest.currentPreference && (
                            <SanctuaryButton
                                variant="ghost"
                                action="secondary"
                                onPress={() => {
                                    clearStoredExternalOpenPreference();
                                    showToast({
                                        message: 'Link opening preference reset for this platform.',
                                        type: 'info',
                                    });
                                }}
                                leftIcon={ArrowLeftRight}
                            >
                                Reset Saved Preference
                            </SanctuaryButton>
                        )}
                    </VStack>
                ) : null}
            >
                {pendingRequest && (
                    <VStack sx={{ gap: Theme.spacing.md }}>
                        <Box
                            sx={{
                                backgroundColor: glass.surface.bg,
                                borderColor: glass.surface.border,
                                borderWidth: 1,
                                borderRadius: Theme.corners.comfortable,
                                padding: Theme.spacing.md,
                            }}
                        >
                            <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center', marginBottom: Theme.spacing.xs }}>
                                <TrustIcon size={16} color={trustCopy.label === 'Broken or unverified' ? accent.danger : accent.action} />
                                <Text sx={{ color: text.primary, fontWeight: '700' }}>
                                    {trustCopy.label}
                                </Text>
                            </HStack>
                            <Text sx={{ color: text.secondary, fontSize: 13, lineHeight: 20 }}>
                                {trustCopy.note}
                            </Text>
                            <Text sx={{ color: text.muted, fontSize: 12, marginTop: Theme.spacing.sm }}>
                                Destination: {pendingRequest.domain}
                            </Text>
                            {pendingRequest.options.sourceBadge ? (
                                <Text sx={{ color: accent.action, fontSize: 12, marginTop: 4, fontWeight: '700' }}>
                                    {pendingRequest.options.sourceBadge}
                                </Text>
                            ) : null}
                            {pendingRequest.overrideCount >= 2 && !pendingRequest.currentPreference ? (
                                <Text sx={{ color: text.secondary, fontSize: 12, marginTop: Theme.spacing.sm }}>
                                    You often choose a different link method. Saving a default may reduce friction.
                                </Text>
                            ) : null}
                        </Box>
                        <VStack sx={{ gap: Theme.spacing.sm }}>
                            {methods.map((method) => {
                                const isSelected = selectedMethod === method.id;
                                return (
                                    <Pressable
                                        key={method.id}
                                        accessibilityRole="button"
                                        onPress={() => setSelectedMethod(method.id)}
                                        style={[
                                            styles.optionCard,
                                            {
                                                borderColor: isSelected ? accent.action : glass.surface.border,
                                                backgroundColor: isSelected ? `${accent.action}14` : glass.surface.bg,
                                            },
                                        ]}
                                    >
                                        <HStack sx={{ gap: Theme.spacing.sm, alignItems: 'center' }}>
                                            <View
                                                style={[
                                                    styles.selectionDot,
                                                    {
                                                        borderColor: isSelected ? accent.action : text.muted,
                                                        backgroundColor: isSelected ? accent.action : 'transparent',
                                                    },
                                                ]}
                                            >
                                                {isSelected ? <Check size={10} color={Theme.colors.sacredWhite} /> : null}
                                            </View>
                                            <VStack sx={{ flex: 1 }}>
                                                <Text sx={{ color: text.primary, fontWeight: '700' }}>
                                                    {method.title}
                                                </Text>
                                                <Text sx={{ color: text.secondary, fontSize: 13, lineHeight: 20 }}>
                                                    {method.description}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </Pressable>
                                );
                            })}
                        </VStack>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => setRememberChoice((current) => !current)}
                            style={[
                                styles.rememberRow,
                                { borderColor: glass.surface.border },
                            ]}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    {
                                        borderColor: rememberChoice ? accent.action : text.muted,
                                        backgroundColor: rememberChoice ? accent.action : 'transparent',
                                    },
                                ]}
                            >
                                {rememberChoice ? <Check size={12} color={Theme.colors.sacredWhite} /> : null}
                            </View>
                            <VStack sx={{ flex: 1 }}>
                                <Text sx={{ color: text.primary, fontWeight: '700' }}>
                                    Remember my choice on this {pendingRequest.platform === 'web' ? 'browser' : 'device'}
                                </Text>
                                <Text sx={{ color: text.secondary, fontSize: 12 }}>
                                    You can still choose another method whenever you need to.
                                </Text>
                            </VStack>
                        </Pressable>
                    </VStack>
                )}
            </SanctuaryModal>
        </>
    );
}

const styles = StyleSheet.create({
    optionCard: {
        borderWidth: 1,
        borderRadius: Theme.corners.comfortable,
        padding: Theme.spacing.md,
    },
    selectionDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rememberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Theme.spacing.sm,
        borderWidth: 1,
        borderRadius: Theme.corners.comfortable,
        padding: Theme.spacing.md,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
