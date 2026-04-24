/**
 * FireJournal.web.tsx
 *
 * Web-specific implementation for the fire journal catharsis.
 * Purged raw HTML fragments in favor of @repo/ui primitives and NativeWind v4.
 */

import React, { useState } from 'react';
import { useFireJournal } from '../hooks/useFireJournal';
import { 
    Box, 
    VStack, 
    HStack, 
    Text, 
    Heading, 
    Input, 
    InputField, 
    Button, 
    ButtonText,
    Icon
} from '@repo/ui';
import { Flame, CheckCircle } from 'lucide-react-native';

interface FireJournalProps {
    userId?: string;
    onBurned?: () => void;
}

export default function FireJournal({ userId, onBurned }: FireJournalProps) {
    const { burnEntry } = useFireJournal(userId);
    const [content, setContent] = useState('');
    const [burning, setBurning] = useState(false);
    const [burned, setBurned] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const handleChange = (val: string) => {
        setContent(val);
        setCharCount(val.length);
    };

    const handleBurn = async () => {
        if (!content.trim() || burning) return;
        setBurning(true);

        // Dramatic pause – let the user "see" it burning
        await new Promise(r => setTimeout(r, 1200));

        try {
            if (userId) {
                await burnEntry(content);
            }
            onBurned?.();
        } catch { /* non-fatal – the release is in the writing, not the save */ }

        setContent('');
        setCharCount(0);
        setBurning(false);
        setBurned(true);
        setTimeout(() => setBurned(false), 3000);
    };

    return (
        <VStack className="gap-lg">
            {/* Header */}
            <HStack className="items-center gap-3">
                <Box className="p-2 bg-emberRed/10 rounded-lg">
                    <Icon as={Flame} className="text-emberRed" size={20} />
                </Box>
                <VStack className="gap-0">
                    <Heading size="sm" className="text-sacredWhite font-bold">Fire Journal</Heading>
                    <Text className="text-xs text-mistGray">Write it. Burn it. Release it.</Text>
                </VStack>
            </HStack>

            {burned ? (
                <Box className="p-xl bg-emberRed/10 rounded-comfortable items-center border border-emberRed/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Text className="text-5xl mb-4">🔥</Text>
                    <HStack className="items-center gap-2 mb-2">
                        <Icon as={CheckCircle} className="text-emberRed" size={18} />
                        <Text className="text-lg font-bold text-emberRed">Released.</Text>
                    </HStack>
                    <Text className="text-sm text-mistGray text-center">
                        The words are ash now. You're lighter.
                    </Text>
                </Box>
            ) : (
                <VStack className="gap-4">
                    <Box className="relative">
                        <Input
                            className={`rounded-comfortable min-h-[160px] transition-all duration-300 border-2 ${
                                burning 
                                    ? 'border-emberRed bg-emberRed/5 opacity-40 animate-pulse' 
                                    : 'border-white/10 bg-white/5 focus:border-sanctuarySaffron'
                            }`}
                        >
                            <InputField
                                placeholder="Write what's weighing on you. No one will read this. It will burn."
                                value={content}
                                onChangeText={handleChange}
                                multiline
                                readOnly={burning}
                                className={`text-base p-4 leading-relaxed ${burning ? 'text-emberRed/60' : 'text-sacredWhite'}`}
                                placeholderTextColor="#6A6358"
                                style={{ outline: 'none' } as any}
                            />
                        </Input>
                        {charCount > 0 && !burning && (
                            <Box className="absolute bottom-3 right-4">
                                <Text className="text-[10px] text-mistGray">{charCount} characters</Text>
                            </Box>
                        )}
                        {burning && (
                            <Box className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <Text className="text-6xl animate-bounce">🔥</Text>
                            </Box>
                        )}
                    </Box>

                    <Button
                        onPress={handleBurn}
                        isDisabled={burning || !content.trim()}
                        className={`h-14 rounded-comfortable flex-row items-center justify-center gap-2 ${
                            content.trim() && !burning ? 'bg-emberRed shadow-lg shadow-emberRed/20' : 'bg-white/10'
                        }`}
                    >
                        <Icon as={Flame} className={content.trim() ? 'text-white' : 'text-mistGray'} size={20} />
                        <ButtonText className={`font-bold text-base ${content.trim() ? 'text-white' : 'text-mistGray'}`}>
                            {burning ? 'Burning...' : 'Burn & Release 🔥'}
                        </ButtonText>
                    </Button>
                </VStack>
            )}

            <Box className="p-md bg-obsidian rounded-comfortable border border-white/5 mt-4">
                <Text className="text-mistGray text-center text-[11px] italic">
                    GuruDevi: "Let the smoke carry away the weight of what you cannot change."
                </Text>
            </Box>
        </VStack>
    );
}
