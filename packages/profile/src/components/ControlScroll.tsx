import React, { useState } from 'react';
import { StyleSheet, Modal } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Pressable,
    Divider,
    Heading,
    Theme,
    hapticLight,
    hapticSuccess,
    useTheme,
    ThemeMode
} from '@repo/ui';
import { Globe, Moon, Database, ChevronRight, Check, X, Sun, Zap, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface ControlScrollProps {
    currentLanguage: string;
    onLanguageChange: (lang: 'si' | 'ta' | 'en') => void;
}

export default function ControlScroll({ currentLanguage, onLanguageChange }: ControlScrollProps) {
    const { t } = useTranslation();
    const { themeMode, setThemeMode } = useTheme();
    const [showThemeModal, setShowThemeModal] = useState(false);

    const getThemeLabel = (mode: ThemeMode) => {
        switch (mode) {
            case 'system': return 'System Default';
            case 'light': return 'Light Mode';
            case 'dark': return 'Dark Mode';
            case 'auto': return 'Auto (Time-based)';
            default: return 'System Default';
        }
    };

    const renderThemeOption = (mode: ThemeMode, Icon: any, label: string, description: string) => {
        const isActive = themeMode === mode;

        return (
            <Pressable
                onPress={() => {
                    if (!isActive) {
                        hapticSuccess();
                        setThemeMode(mode);
                        setShowThemeModal(false);
                    }
                }}
            >
                <Box
                    sx={{
                        padding: Theme.spacing.md,
                        backgroundColor: isActive ? 'rgba(230, 126, 34, 0.1)' : Theme.colors.ink,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: isActive ? Theme.colors.sanctuarySaffron : 'transparent',
                        marginBottom: Theme.spacing.sm,
                    }}
                >
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <HStack space="md" sx={{ alignItems: 'center' }}>
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 12,
                                    backgroundColor: isActive ? 'rgba(230, 126, 34, 0.2)' : 'rgba(255,255,255,0.05)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Icon size={20} color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.mistGray} />
                            </Box>
                            <VStack>
                                <Text sx={{ color: isActive ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite, fontWeight: isActive ? '700' : '500' }}>
                                    {label}
                                </Text>
                                <Text sx={{ color: Theme.colors.dimGray }} size="xs">
                                    {description}
                                </Text>
                            </VStack>
                        </HStack>
                        {isActive && <Check size={20} color={Theme.colors.sanctuarySaffron} />}
                    </HStack>
                </Box>
            </Pressable>
        );
    };

    const renderLanguageItem = (lang: 'si' | 'ta' | 'en', label: string) => {
        const isActive = currentLanguage === lang;
        return (
            <Pressable
                onPress={() => {
                    if (!isActive) {
                        hapticSuccess();
                        onLanguageChange(lang);
                    }
                }}
            >
                <Box
                    sx={{
                        paddingVertical: Theme.spacing.md,
                        paddingHorizontal: Theme.spacing.lg,
                        backgroundColor: isActive ? 'rgba(230, 126, 34, 0.1)' : 'transparent',
                        borderRadius: Theme.corners.comfortable,
                    }}
                >
                    <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                            sx={{ color: isActive ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite, fontWeight: isActive ? '700' : '500' }}
                        >
                            {label}
                        </Text>
                        {isActive && <Check size={18} color={Theme.colors.sanctuarySaffron} />}
                    </HStack>
                </Box>
            </Pressable>
        );
    };

    return (
        <VStack space="2xl" sx={{ paddingBottom: 100 }}>
            {/* Language Section */}
            <VStack space="sm">
                <Text sx={{ color: Theme.colors.dimGray, marginLeft: Theme.spacing.md, textTransform: 'uppercase', fontWeight: 'bold' }} size="xs">
                    {t('profile.language') || 'LANGUAGE'}
                </Text>

                <Box style={styles.sectionContainer}>
                    <HStack sx={{ padding: Theme.spacing.md }} space="md" alignItems="center">
                        <Box style={styles.iconBox}>
                            <Globe size={20} color={Theme.colors.sanctuarySaffron} />
                        </Box>
                        <VStack>
                            <Text sx={{ color: Theme.colors.sacredWhite, fontWeight: 'bold' }}>
                                {t('profile.appLanguage') || 'App Language'}
                            </Text>
                            <Text sx={{ color: Theme.colors.mistGray }} size="xs">
                                {t('profile.chooseLanguage') || 'Choose your preferred language'}
                            </Text>
                        </VStack>
                    </HStack>

                    <Divider sx={{ backgroundColor: Theme.colors.ink }} />
                    <VStack sx={{ padding: Theme.spacing.xs }}>
                        {renderLanguageItem('si', '\u0DC3\u0DD2\u0D82\u0DC4\u0DBD')}
                        {renderLanguageItem('ta', '\u0BA4\u0BAE\u0BBF\u0BB4\u0BCD')}
                        {renderLanguageItem('en', 'English')}
                    </VStack>
                </Box>
            </VStack>

            {/* App Settings Section */}
            <VStack space="sm">
                <Text sx={{ color: Theme.colors.dimGray, marginLeft: Theme.spacing.md, textTransform: 'uppercase', fontWeight: 'bold' }} size="xs">
                    {t('profile.settings') || 'SETTINGS'}
                </Text>

                <Box style={styles.sectionContainer}>
                    {/* Theme Selector */}
                    <Pressable onPress={() => {
                        hapticLight();
                        setShowThemeModal(true);
                    }}>
                        <HStack sx={{ padding: Theme.spacing.md, justifyContent: 'space-between', alignItems: 'center' }}>
                            <HStack space="md" alignItems="center">
                                <Box style={[styles.iconBox, { backgroundColor: 'rgba(142, 68, 173, 0.1)' }]}>
                                    <Moon size={20} color="#9B59B6" />
                                </Box>
                                <VStack>
                                    <Text sx={{ color: Theme.colors.sacredWhite }}>Theme</Text>
                                    <Text sx={{ color: Theme.colors.dimGray }} size="xs">{getThemeLabel(themeMode)}</Text>
                                </VStack>
                            </HStack>
                            <ChevronRight size={20} color={Theme.colors.mistGray} />
                        </HStack>
                    </Pressable>

                    <Divider sx={{ backgroundColor: Theme.colors.ink, marginLeft: 56 }} />
                    
                    {/* Data Saver (Placeholder) */}
                    <Pressable onPress={hapticLight}>
                        <HStack sx={{ padding: Theme.spacing.md, justifyContent: 'space-between', alignItems: 'center' }}>
                            <HStack space="md" alignItems="center">
                                <Box style={[styles.iconBox, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                                    <Database size={20} color="#2ECC71" />
                                </Box>
                                <VStack>
                                    <Text sx={{ color: Theme.colors.sacredWhite }}>Data Saver</Text>
                                    <Text sx={{ color: Theme.colors.dimGray }} size="xs">Reduce usage</Text>
                                </VStack>
                            </HStack>
                            <Box style={styles.comingSoonBadge}>
                                <Text sx={{ color: Theme.colors.ink, fontWeight: 'bold' }} size="2xs">SOON</Text>
                            </Box>
                        </HStack>
                    </Pressable>
                </Box>
            </VStack>

            {/* Theme Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showThemeModal}
                onRequestClose={() => setShowThemeModal(false)}
            >
                <Box sx={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
                    <Box
                        sx={{
                            backgroundColor: Theme.colors.ink,
                            borderTopLeftRadius: Theme.corners.generous,
                            borderTopRightRadius: Theme.corners.generous,
                            padding: Theme.spacing.xl,
                            paddingBottom: 40,
                        }}
                    >
                        <HStack sx={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: Theme.spacing.xl }}>
                            <Heading sx={{ color: Theme.colors.sacredWhite }} size="lg">
                                {t('profile.chooseTheme') || 'Choose Theme'}
                            </Heading>
                            <Pressable
                                onPress={() => setShowThemeModal(false)}
                                sx={{ padding: Theme.spacing.xs }}
                            >
                                <X color={Theme.colors.mistGray} size={24} />
                            </Pressable>
                        </HStack>

                        <VStack space="md">
                            {renderThemeOption('system', Smartphone, 'System Default', 'Follow device settings')}
                            {renderThemeOption('light', Sun, 'Light Mode', 'Always use light colors')}
                            {renderThemeOption('dark', Moon, 'Dark Mode', 'Always use dark colors')}
                            {renderThemeOption('auto', Zap, 'Auto (Time-based)', 'Changes based on time of day')}
                        </VStack>

                        <Text sx={{ color: Theme.colors.dimGray, marginTop: Theme.spacing.lg, textAlign: 'center' }} size="xs">
                            Auto mode adjusts theme based on time of day (evening: 8 PM - 6 AM)
                        </Text>
                    </Box>
                </Box>
            </Modal>
        </VStack>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        backgroundColor: Theme.colors.ink,
        borderRadius: Theme.corners.generous,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 12,
        backgroundColor: 'rgba(230, 126, 34, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    comingSoonBadge: {
        backgroundColor: Theme.colors.mistGray,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    }
});
