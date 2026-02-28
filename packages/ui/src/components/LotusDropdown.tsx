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
    const styles = useMemo(() => StyleSheet.create({'');
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

import React, { FC, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
    Select,
    SelectTrigger,
    SelectInput,
    SelectIcon,
    SelectPortal,
    SelectBackdrop,
    SelectContent,
    SelectItem
} from '../gluestack';
import { ChevronDown } from 'lucide-react-native';
import { Theme, typography } from '../theme/Theme';

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
    const styles = useMemo(() => StyleSheet.create({
        container: {
            marginBottom: Theme.spacing.md,
        },
        label: {
            fontSize: Theme.typography.fontSize.md,
            color: Theme.colors.sacredWhite,
            marginBottom: Theme.spacing.xs,
            fontWeight: '600',
        },
        trigger: {
            backgroundColor: Theme.colors.shroud,
            borderRadius: Theme.corners.comfortable,
            borderWidth: 1,
            borderColor: Theme.colors.shroud, // Default border
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            // height: 48, // Default height
        },
        triggerError: {
            borderColor: Theme.colors.emberRed,
        },
        input: {
            color: Theme.colors.sacredWhite,
            flex: 1,
        },
        icon: {
            marginRight: 8,
        },
        content: {
            backgroundColor: Theme.colors.shroud,
            borderColor: Theme.colors.dimGray,
            borderWidth: 1,
            borderRadius: Theme.corners.comfortable,
        },
        item: {
            fontSize: 16,
            backgroundColor: Theme.colors.shroud,
            padding: 12,
        },
        errorText: {
            fontSize: Theme.typography.fontSize.sm,
            color: Theme.colors.emberRed,
            marginTop: Theme.spacing.xs,
        },
    }), []);

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

export default LotusDropdown;
