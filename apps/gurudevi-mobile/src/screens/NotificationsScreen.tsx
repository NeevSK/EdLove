import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@repo/ui';

export default function NotificationsScreen() {
    const { t } = useTranslation();
    const { phase } = useTheme();
    const isDark = phase === 'night';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]}>
            <Text style={[styles.text, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {t('notifications.title') || 'Notifications'}
            </Text>
            <Text style={[styles.subtext, { color: isDark ? '#AAAAAA' : '#666666' }]}>
                {t('notifications.empty') || 'No new notifications'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtext: {
        fontSize: 14,
        textAlign: 'center',
    },
});
