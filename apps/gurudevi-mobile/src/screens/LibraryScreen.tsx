import React, { useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Box, VStack, Text, HStack, Pressable } from "@gluestack-ui/themed";
import GlobalHeader from '../components/shared/GlobalHeader';
import LotusPetalFAB from '../components/shared/LotusPetalFAB';
import LibraryResourceCard, { ResourceType } from '../components/library/LibraryResourceCard';
import AddResourceModal from '../components/library/AddResourceModal';
import { Theme } from '../constants/Theme';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/shared/EmptyState';
import { BookOpen, Search } from 'lucide-react-native';
import SanctuaryInput from '../components/shared/SanctuaryInput';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router'; // Only if using Expo Router? No, this is TabNavigator. But can keep imports consistent if migrating. Actually using Linking for now.

// Mock Data until Supabase Hook is ready
const MOCK_RESOURCES = [
    { id: '1', title: 'Grade 10 Math Syllabus', type: 'pdf', isPublic: true, url: 'https://example.com/syllabus.pdf' },
    { id: '2', title: 'Calculus Intro Video', type: 'video', isPublic: false, url: 'https://youtube.com/watch?v=123' },
    { id: '3', title: 'Physics Notes', type: 'doc', isPublic: true, url: 'https://docs.google.com/doc' },
];

// Library categories for filtering
const LIBRARY_CATEGORIES = ['All', 'PDFs', 'Videos', 'Docs', 'Links'] as const;

export default function LibraryScreen() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false);

    // Mocking addition
    const [resources, setResources] = useState<any[]>(MOCK_RESOURCES);

    const handleAddResource = (data: any) => {
        setResources(prev => [{ id: Date.now().toString(), isPublic: false, ...data }, ...prev]);
    };

    const handleOpenResource = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    const filteredResources = resources.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader
                title={t('tabs.library') || 'Library'}
                subtitle="Knowledge Sanctuary"
                rightAction={
                    <TouchableOpacity onPress={() => setShowSearchBar(!showSearchBar)}>
                        <Search color={Theme.colors.sacredWhite} size={24} />
                    </TouchableOpacity>
                }
            />

            {/* Collapsible Search Bar */}
            {showSearchBar && (
                <VStack space="md" px="$4" py="$4">
                    <SanctuaryInput
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        leftIcon={Search}
                        autoFocus
                    />
                </VStack>
            )}

            <ScrollView
                contentContainerStyle={{ padding: Theme.spacing.md, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={Theme.colors.sanctuarySaffron} />
                }
            >
                {/* Horizontal Carousel for Resource Categories */}
                <VStack space="xl">
                    <VStack space="sm">
                        <Text color={Theme.colors.sacredWhite} size="lg" bold>
                            Categories
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                        >
                            {LIBRARY_CATEGORIES.map((category) => (
                                <Pressable key={category}>
                                    <Box
                                        sx={{
                                            paddingHorizontal: Theme.spacing.lg,
                                            paddingVertical: Theme.spacing.sm,
                                            backgroundColor: Theme.colors.deepIndigo,
                                            borderRadius: Theme.corners.comfortable,
                                            borderWidth: 1,
                                            borderColor: Theme.colors.sanctuarySaffron
                                        }}
                                    >
                                        <Text color={Theme.colors.sacredWhite} size="sm" bold>
                                            {category}
                                        </Text>
                                    </Box>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </VStack>

                    {/* Resources List */}
                    {filteredResources.length === 0 ? (
                        <EmptyState
                            icon={BookOpen}
                            title="Library is Empty"
                            description="Be the first to add knowledge to the sanctuary."
                        />
                    ) : (
                        <VStack space="md">
                            {filteredResources.map((res) => (
                                <LibraryResourceCard
                                    key={res.id}
                                    title={res.title}
                                    type={res.type as ResourceType}
                                    isPublic={res.isPublic}
                                    onPress={() => handleOpenResource(res.url)}
                                    onLike={() => console.log('Like', res.id)}
                                    onaddToDesk={() => console.log('Add to desk', res.id)}
                                />
                            ))}
                        </VStack>
                    )}
                </VStack>
            </ScrollView>

            <LotusPetalFAB
                onPress={() => setIsAddModalOpen(true)}
            />

            <AddResourceModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddResource}
            />
        </Box>
    );
}
