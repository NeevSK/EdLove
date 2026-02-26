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
} from '@repo/ui';
import { Globe, Moon, Database, ChevronRight, Check, X, Sun, Zap, Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Theme } from '@repo/ui';
import { hapticLight, hapticSuccess } from '@repo/ui';
import { useTheme, ThemeMode } from '@repo/ui';

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
        }
    };

    const renderThemeOption = (mode: ThemeMode, icon: any, label: string, description: string) => {
        const isActive = themeMode === mode;
        const IconComponent = icon;

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
                        backgroundColor: isActive ? 'rgba(230, 126, 34, 0.1)' : Theme.colors.deepIndigo,
                        borderRadius: Theme.corners.comfortable,
                        borderWidth: 1,
                        borderColor: isActive ? Theme.colors.sanctuarySaffron : 'transparent',
                    }}
                >
                    <HStack justifyContent="space-between" alignItems="center">
                        <HStack space="md" alignItems="center">
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
                                <IconComponent size={20} color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.mistGray} />
                            </Box>
                            <VStack>
                                <Text color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite} bold={isActive}>
                                    {label}
                                </Text>
                                <Text color={Theme.colors.dimGray} size="xs">
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
                    <HStack justifyContent="space-between" alignItems="center">
                        <Text
                            color={isActive ? Theme.colors.sanctuarySaffron : Theme.colors.sacredWhite}
                            bold={isActive}
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
        <VStack space="2xl" pb={100}>
            {/* Language Section */}
            <VStack space="sm">
                <Text color={Theme.colors.dimGray} size="xs" ml={Theme.spacing.md} textTransform="uppercase" bold>
                    {t('profile.language') || 'LANGUAGE'}
                </Text>

                <Box style={styles.sectionContainer}>
                    <HStack p={Theme.spacing.md} space="md" alignItems="center">
                        <Box style={styles.iconBox}>
                            <Globe size={20} color={Theme.colors.sanctuarySaffron} />
                        </Box>
                        <VStack>
                            <Text color={Theme.colors.sacredWhite} bold>
                                {t('profile.appLanguage') || 'App Language'}
                            </Text>
                            <Text color={Theme.colors.mistGray} size="xs">
                                Choose your preferred language
                            </Text>
                        </VStack>
                    </HStack>

                    <Divider bg={Theme.colors.deepIndigo} />

                    <VStack p={Theme.spacing.xs}>
                        {renderLanguageItem('si', 'සිංහල')}
                        {renderLanguageItem('ta', 'தமிழ்')}
                        {renderLanguageItem('en', 'English')}
                    </VStack>
                </Box>
            </VStack>

            {/* App Settings Section */}
            <VStack space="sm">
                <Text color={Theme.colors.dimGray} size="xs" ml={Theme.spacing.md} textTransform="uppercase" bold>
                    {t('profile.settings') || 'SETTINGS'}
                </Text>

                <Box style={styles.sectionContainer}>
                    {/* Theme Selector */}
                    <Pressable onPress={() => {
                        hapticLight();
                        setShowThemeModal(true);
                    }}>
                        <HStack p={Theme.spacing.md} justifyContent="space-between" alignItems="center">
                            <HStack space="md" alignItems="center">
                                <Box style={[styles.iconBox, { backgroundColor: 'rgba(142, 68, 173, 0.1)' }]}>
                                    <Moon size={20} color="#9B59B6" />
                                </Box>
                                <VStack>
                                    <Text color={Theme.colors.sacredWhite}>Theme</Text>
                                    <Text color={Theme.colors.dimGray} size="xs">{getThemeLabel(themeMode)}</Text>
                                </VStack>
                            </HStack>
                            <ChevronRight size={20} color={Theme.colors.mistGray} />
                        </HStack>
                    </Pressable>

                    <Divider bg={Theme.colors.deepIndigo} ml={56} />

                    {/* Data Saver (Placeholder) */}
                    <Pressable onPress={hapticLight}>
                        <HStack p={Theme.spacing.md} justifyContent="space-between" alignItems="center">
                            <HStack space="md" alignItems="center">
                                <Box style={[styles.iconBox, { backgroundColor: 'rgba(46, 204, 113, 0.1)' }]}>
                                    <Database size={20} color="#2ECC71" />
                                </Box>
                                <VStack>
                                    <Text color={Theme.colors.sacredWhite}>Data Saver</Text>
                                    <Text color={Theme.colors.dimGray} size="xs">Reduce usage</Text>
                                </VStack>
                            </HStack>
                            <Box style={styles.comingSoonBadge}>
                                <Text color={Theme.colors.midnightBlue} size="2xs" bold>SOON</Text>
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
                            backgroundColor: Theme.colors.voidIndigo,
                            borderTopLeftRadius: Theme.corners.generous,
                            borderTopRightRadius: Theme.corners.generous,
                            padding: Theme.spacing.xl,
                            paddingBottom: 40,
                        }}
                    >
                        <HStack justifyContent="space-between" alignItems="center" mb={Theme.spacing.xl}>
                            <Heading color={Theme.colors.sacredWhite} size="lg">
                                Choose Theme
                            </Heading>
                            <Pressable onPress={() => setShowThemeModal(false)} p={Theme.spacing.xs}>
                                <X color={Theme.colors.mistGray} size={24} />
                            </Pressable>
                        </HStack>

                        <VStack space="md">
                            {renderThemeOption('system', Smartphone, 'System Default', 'Follow device settings')}
                            {renderThemeOption('light', Sun, 'Light Mode', 'Always use light colors')}
                            {renderThemeOption('dark', Moon, 'Dark Mode', 'Always use dark colors')}
                            {renderThemeOption('auto', Zap, 'Auto (Time-based)', 'Changes based on time of day')}
                        </VStack>

                        <Text color={Theme.colors.dimGray} size="xs" mt={Theme.spacing.lg} textAlign="center">
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
        backgroundColor: Theme.colors.midnightBlue,
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
        backgroundColor: Theme.colors.stoneGray,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    }
});
