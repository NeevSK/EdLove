/**
 * WELCOME MODAL (Web)
 * Web override of WelcomeModal.tsx with portal-style overlay dialog.
 * Standardized to Zero-Legacy: purged raw HTML/inline styles and fixed syntax corruption in style objects.
 */

import React, { useEffect } from 'react';
import {
    Box,
    VStack,
    Text,
    Heading,
    Button,
    ButtonText,
    Icon,
    HStack,
    AnimatedView
} from '@repo/ui';
import { Sparkles, ArrowRight } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
    const { t } = useTranslation();

    // Escape listener
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <Box 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-md bg-obsidian/80 backdrop-blur-md"
            // Ensure clicking the overlay closes the modal
            nativeID="modal-overlay"
        >
            <AnimatedView 
                entering={SlideInUp.duration(500).springify()}
                className="w-full max-w-md bg-sacredWhite rounded-3xl p-lg shadow-2xl border border-mistGray/10 overflow-hidden"
            >
                <VStack className="items-center gap-6">
                    {/* Lotus/Sparkles Container */}
                    <Box className="w-20 h-20 bg-sanctuarySaffron/10 rounded-full items-center justify-center">
                        <Text className="text-5xl leading-none">🪷</Text>
                    </Box>

                    <VStack className="items-center gap-3">
                        <Heading className="text-obsidian text-center leading-tight" size="xl">
                            {t('welcome.title') || 'Welcome Home'}
                        </Heading>
                        <Text className="text-mistGray text-center text-sm px-4">
                            {t('welcome.message') || 'A sacred space for your teaching journey to flourish.'}
                        </Text>
                    </VStack>

                    <Box className="w-full h-px bg-mistGray/5" />

                    <VStack className="w-full gap-4">
                        <Box className="bg-emeraldGreen/5 p-4 rounded-2xl border border-emeraldGreen/10">
                            <Text className="text-emeraldGreen text-xs text-center font-bold">
                                {t('welcome.description') || 'Join our global community of mindful educators.'}
                            </Text>
                        </Box>

                        <Button
                            onPress={onClose}
                            className="bg-sanctuarySaffron h-16 rounded-2xl shadow-xl shadow-sanctuarySaffron/30 active:scale-95 transition-transform"
                        >
                            <HStack className="items-center gap-2">
                                <ButtonText className="text-obsidian font-black uppercase tracking-widest text-sm">
                                    {t('welcome.start') || 'Begin Journey'}
                                </ButtonText>
                                <Icon as={ArrowRight} size={18} className="text-obsidian" />
                            </HStack>
                        </Button>
                    </VStack>
                </VStack>
            </AnimatedView>

            {/* Custom keyframe styles for web portal feel */}
            <style dangerouslySetInnerHTML={{ __html: `
                #modal-overlay {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}} />
        </Box>
    );
}
