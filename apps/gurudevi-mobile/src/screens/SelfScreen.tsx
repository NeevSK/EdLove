import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Pressable,
    Center,
    Input,
    InputField,
    Button,
    ButtonText
} from "@gluestack-ui/themed";
import { Mic, Send, MessageCircle, Repeat, Sun, FileText } from 'lucide-react-native';
import DailyRhythm from '../components/DailyRhythm';

const SUB_FEATURES = [
    { id: 'venting', label: 'Venting Space', icon: MessageCircle },
    { id: 'rhythm', label: 'Daily Rhythm', icon: Repeat },
    { id: 'shadow', label: 'Shadow Assistant', icon: Sun },
    { id: 'notes', label: 'Personal Notes', icon: FileText },
];

export default function SelfScreen() {
    const [greeting, setGreeting] = useState('');
    const [activeFeature, setActiveFeature] = useState('venting');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 17) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    return (
        <Box sx={{ flex: 1, backgroundColor: '$backgroundDark950' }}>
            <ScrollView sx={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 1. Atmospheric Header */}
                <VStack space="xs" px="$6" pt="$16" pb="$8">
                    <Text color="#F5F1E8" size="lg" sx={{ opacity: 0.8 }}>{greeting},</Text>
                    <Heading color="#FF9933" size="4xl" sx={{ lineHeight: '$5xl' }}>Teacher</Heading>
                </VStack>

                {/* 2. Sub-Feature Carousel */}
                <Box sx={{ height: 100 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
                    >
                        {SUB_FEATURES.map((feature) => (
                            <Pressable
                                key={feature.id}
                                onPress={() => setActiveFeature(feature.id)}
                            >
                                <VStack
                                    alignItems="center"
                                    justifyContent="center"
                                    space="xs"
                                    sx={{
                                        width: 100,
                                        height: 80,
                                        borderRadius: '$xl',
                                        backgroundColor: activeFeature === feature.id ? '#FF9933' : '$backgroundDark900',
                                        borderWidth: 1,
                                        borderColor: activeFeature === feature.id ? '#FF9933' : 'transparent',
                                    }}
                                >
                                    <feature.icon
                                        color={activeFeature === feature.id ? 'white' : '#666'}
                                        size={24}
                                    />
                                    <Text
                                        size="xs"
                                        bold={activeFeature === feature.id}
                                        color={activeFeature === feature.id ? '$white' : '$textDark400'}
                                        textAlign="center"
                                    >
                                        {feature.label}
                                    </Text>
                                </VStack>
                            </Pressable>
                        ))}
                    </ScrollView>
                </Box>

                {/* 3. Dynamic Content Workbench */}
                <Box px="$6" mt="$6">
                    <Box
                        p="$6"
                        sx={{
                            backgroundColor: '$backgroundDark900',
                            borderRadius: '$3xl',
                            minHeight: 300
                        }}
                    >
                        {activeFeature === 'venting' && (
                            <VStack space="lg" sx={{ flex: 1 }}>
                                <VStack space="xs">
                                    <Heading color="$textDark100" size="lg">Venting Space</Heading>
                                    <Text color="$textDark400" size="sm">Release the weight of the day.</Text>
                                </VStack>

                                <Box
                                    sx={{
                                        flex: 1,
                                        backgroundColor: '$backgroundDark800',
                                        borderRadius: '$2xl',
                                        padding: '$4',
                                        minHeight: 150
                                    }}
                                >
                                    <Input variant="outline" size="md" sx={{ borderWidth: 0, flex: 1 }}>
                                        <InputField
                                            placeholder="Speak your truth..."
                                            multiline
                                            color="$textDark100"
                                            sx={{ textAlignVertical: 'top' }}
                                        />
                                    </Input>
                                </Box>

                                <HStack space="md" justifyContent="flex-end">
                                    <Button size="md" variant="link" action="primary" sx={{ borderRadius: '$full', width: 44, height: 44, backgroundColor: '$backgroundDark800' }}>
                                        <Mic color="#FF9933" size={20} />
                                    </Button>
                                    <Button size="md" action="primary" sx={{ borderRadius: '$full', backgroundColor: '#FF9933', paddingHorizontal: '$4' }}>
                                        <ButtonText color="$white" mr="$2">Unburden</ButtonText>
                                        <Send color="white" size={16} />
                                    </Button>
                                </HStack>
                            </VStack>
                        )}

                        {activeFeature === 'rhythm' && (
                            <DailyRhythm />
                        )}

                        {activeFeature === 'shadow' && (
                            <Center sx={{ flex: 1 }}>
                                <Sun size={48} color="#FF9933" />
                                <Text color="$textDark400" mt="$4" textAlign="center">
                                    Your Shadow Assistant is preparing your teaching focus for tomorrow.
                                </Text>
                            </Center>
                        )}

                        {activeFeature === 'notes' && (
                            <VStack space="md">
                                <Heading color="$textDark100" size="lg">Personal Notes</Heading>
                                <Text color="$textDark400">Your garden of insights.</Text>
                                <Button variant="outline" action="primary" sx={{ borderColor: '#FF9933', borderRadius: '$full' }}>
                                    <ButtonText color="#FF9933">New Insight</ButtonText>
                                </Button>
                            </VStack>
                        )}
                    </Box>
                </Box>
            </ScrollView>
        </Box>
    );
}