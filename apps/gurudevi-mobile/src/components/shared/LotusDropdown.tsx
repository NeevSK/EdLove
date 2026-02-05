/**
 * LOTUS DROPDOWN - Reusable Dropdown Component
 * 
 * A themed dropdown component that supports:
 * - Label above dropdown
 * - Error state with error message
 * - Options array with label/value pairs
 * - Matches LotusTextInput styling
 * 
 * Philosophy: Consistent, accessible dropdown that matches sanctuary aesthetic
 * 
 * @example
 * ```tsx
 * import LotusDropdown from './components/LotusDropdown';
 * 
 * function MyForm() {
 *   const [category, setCategory] = useState('');
 *   const options = [
 *     { label: 'Self', value: 'self' },
 *     { label: 'Classroom', value: 'classroom' },
 *   ];
 * 
 *   return (
 *     <LotusDropdown
 *       label="Category"
 *       value={category}
 *       options={options}
 *       onChange={setCategory}
 *     />
 *   );
 * }
 * ```
 */

import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem,
} from '@gluestack-ui/themed';
import { ChevronDown } from 'lucide-react-native';
import Theme from '../../constants/Theme';

// ============================================================================
// TYPES
// ============================================================================

interface LotusDropdownProps {
    label: string;
    value: string;
    options: Array<{ label: string; value: string }>;
    onChange: (value: string) => void;
    error?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LotusDropdown: FC<LotusDropdownProps> = ({
    label,
    value,
    options,
    onChange,
    error,
}) => {
    return (
        <View style={styles.container}>
            {/* Label */}
            <Text style={styles.label}>{label}</Text>

            {/* Select Dropdown */}
            <Select
                selectedValue={value}
                onValueChange={onChange}
            >
                <SelectTrigger
                    style={[
                        styles.trigger,
                        error && styles.triggerError,
                    ]}
                >
                    <SelectInput
                        placeholder="Select an option"
                        style={styles.input}
                    />
                    {/* @ts-ignore */}
                    <SelectIcon style={styles.icon}>
                        <View>
                            {/* @ts-ignore */}
                            <ChevronDown
                                size={20}
                                color={Theme.colors.sacredWhite}
                            />
                        </View>
                    </SelectIcon>
                </SelectTrigger>

                <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent style={styles.content}>
                        {options.map((option) => (
                            <SelectItem
                                key={option.value}
                                label={option.label}
                                value={option.value}
                                style={styles.item}
                            />
                        ))}
                    </SelectContent>
                </SelectPortal>
            </Select>

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
    trigger: {
        backgroundColor: Theme.colors.deepIndigo,
        borderWidth: 2,
        borderColor: Theme.colors.dimGray,
        borderRadius: Theme.corners.comfortable,
        padding: Theme.spacing.md,
        minHeight: 50,
    },
    triggerError: {
        borderColor: Theme.colors.emberRed,
    },
    input: {
        color: Theme.colors.sacredWhite,
        fontSize: Theme.typography.fontSize.md,
    },
    icon: {
        marginRight: 0,
    },
    content: {
        backgroundColor: Theme.colors.deepIndigo,
        borderRadius: Theme.corners.comfortable,
    },
    item: {
        backgroundColor: Theme.colors.deepIndigo,
        color: Theme.colors.sacredWhite,
    },
    errorText: {
        color: Theme.colors.emberRed,
        fontSize: Theme.typography.fontSize.sm,
        marginTop: Theme.spacing.xs,
    },
});

export default LotusDropdown;
