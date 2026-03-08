import React, { useEffect, useState } from 'react';
import { Platform, Linking } from 'react-native';
import { Button, ButtonText, VStack, Text, Box, Theme, hapticLight } from '@repo/ui';
import { useTranslation } from 'react-i18next';
import { supabase } from '@repo/core';

/**
 * RedirectToApp component
 * Shown on mobile web to suggest opening the native app.
 * Also handles "Session Handoff" by passing the access token via deep link.
 */
export const RedirectToApp = () => {
    const { t } = useTranslation();
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        if (Platform.OS === 'web') {
            supabase.auth.getSession().then(({ data: { session: s } }) => {
                setSession(s);
            });
        }
    }, []);

    if (Platform.OS !== 'web') return null;

    // Very basic check for mobile browser
    const isMobileWeb = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        window.navigator.userAgent
    );

    if (!isMobileWeb) return null;

    const handleOpenApp = () => {
        hapticLight();

        let url = 'gurudevi://';

        // If we have a session, signal that a web session exists without
        // exposing raw tokens in the URL (to prevent leakage via history/logs).
        if (session) {
            url += 'auth/callback?hasSession=true';
        }

        console.log('🔗 Harmonizer: Opening native app...', { hasSession: !!session });

        Linking.openURL(url).catch(() => {
            alert("Ensure the Gurudevi app is installed on your device.");
        });
    };

    return (
        <Box sx={{
            p: '$4',
            backgroundColor: Theme.colors.sanctuarySaffron + '10',
            borderRadius: Theme.corners.comfortable,
            borderWidth: 1,
            borderColor: Theme.colors.sanctuarySaffron + '30',
            mb: '$4',
            width: '100%',
            maxWidth: 400
        }}>
            <VStack space="sm">
                <Text fontWeight="$bold" color={Theme.colors.bark}>
                    {session ? (t('auth.continueInApp') || "Continue your journey in the App") : (t('auth.betterOnApp') || "Better on the App")}
                </Text>
                <Text size="sm" color={Theme.colors.bark}>
                    {session
                        ? (t('auth.handoffDesc') || "You're logged in here. Tap below to securely transfer your sanctuary soul to the native app.")
                        : (t('auth.openInAppDesc') || "Experience the full Sanctuary features by opening our native mobile app.")
                    }
                </Text>
                <Button
                    size="sm"
                    onPress={handleOpenApp}
                    sx={{
                        backgroundColor: Theme.colors.sanctuarySaffron,
                        borderRadius: Theme.corners.full,
                        mt: '$2',
                        alignSelf: 'flex-start'
                    }}
                >
                    <ButtonText fontWeight="$bold">
                        {session ? (t('auth.openAppAndSync') || "Open App & Sync") : (t('auth.openApp') || "Open App")}
                    </ButtonText>
                </Button>
            </VStack>
        </Box>
    );
};
