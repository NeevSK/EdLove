/**
 * LOTUS TEXT INPUT - Reusable Text Input Component
 * 
 * A themed text input component that supports:
 * - Label above input
 * - Error state with error message
 * - Disabled state with opacity
 * - Multiline support
 * - Secure text entry (password)
 * - Various keyboard types
 * 
 * Philosophy: Consistent, accessible input fields that match sanctuary aesthetic
 * 
 * @example
 * ```tsx
 * import LotusTextInput from './components/LotusTextInput';
 * 
 * function MyForm() {
 *   const [name, setName] = useState('');
 *   const [error, setError] = useState('');
 * 
 *   return (
 *     <LotusTextInput
 *       label="Your Name"
 *       value={name}
 *       onChangeText={setName}
 *       placeholder="Enter your name"
 *       error={error}
 *     />
 *   );
 * }
 * ```
 */

import React, { FC } from 'react';
import { TextInput, View, Text, StyleSheet } from 'react-native';
import Theme from '../constants/Theme';

// ============================================================================
// TYPES
// ============================================================================

interface LotusTextInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    multiline?: boolean;
    error?: string;
    disabled?: boolean;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'numeric' | 'email-address';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LotusTextInput: FC<LotusTextInputProps> = ({
    label,
    value,
    onChangeText,
    placeholder,
    multiline = false,
    error,
    disabled = false,
    secureTextEntry = false,
    keyboardType = 'default',
}) => {
    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>{label}</Text>
            
            {/* Text Input */}
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multiline,
                    error && styles.inputError,
                    disabled && styles.disabled,
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={Theme.colors.dimGray}
                multiline={multiline}
                editable={!disabled}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
            />
            
            {/* Error Message */}
            {error && (
                <Text style={styles.errorText}>{error}</Text>
            )}
        </View>
    );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        marginBottom: Theme.spacing.md,
    },
    label: {
        color: Theme.colors.sacredWhite,
        fontSize: Theme.typography.fontSize.md,
        fontWeight: Theme.typography.fontWeight.medium,
        marginBottom: Theme.spacing.sm,
    },
    input: {
        backgroundColor: Theme.colors.deepIndigo,
        borderWidth: 2,
        borderColor: Theme.colors.dimGray,
        borderRadius: Theme.corners.comfortable,
        padding: Theme.spacing.md,
        color: Theme.colors.sacredWhite,
        fontSize: Theme.typography.fontSize.md,
    },
    multiline: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: Theme.colors.emberRed,
    },
    disabled: {
        opacity: 0.6,
    },
    errorText: {
        color: Theme.colors.emberRed,
        fontSize: Theme.typography.fontSize.sm,
        marginTop: Theme.spacing.xs,
    },
});

export default LotusTextInput;
