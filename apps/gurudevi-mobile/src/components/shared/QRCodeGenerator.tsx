import React from 'react';
import QRCode from 'react-native-qrcode-svg';
import { View, StyleSheet } from 'react-native';
import { Text } from '@gluestack-ui/themed';
import { Theme } from '../../constants/Theme';

interface QRCodeGeneratorProps {
    value: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    label?: string;
}

export default function QRCodeGenerator({
    value,
    size = 150,
    color = 'black',
    backgroundColor = 'white',
    label
}: QRCodeGeneratorProps) {
    if (!value) return null;

    return (
        <View style={styles.center}>
            <View style={[styles.qrContainer, { backgroundColor, borderRadius: Theme.corners.comfortable, padding: Theme.spacing.md }]}>
                <QRCode
                    value={value}
                    size={size}
                    color={color}
                    backgroundColor={backgroundColor}
                />
            </View>
            {label && (
                <Text color={Theme.colors.pearlGray} size="sm" mt={Theme.spacing.xs as any} textAlign="center">
                    {label}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
