import React, { useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Box, VStack, Text, Pressable } from "@/ui";
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
import { useThemedColors } from '../hooks/useThemedColors';
import ScreenWrapper from '../components/shared/ScreenWrapper';

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
    const [selectedCategory, setSelectedCategory] = useState<typeof LIBRARY_CATEGORIES[number]>('All');
    const colors = useThemedColors();

    // Mocking addition
    const [resources, setResources] = useState<any[]>(MOCK_RESOURCES);

    const handleAddResource = (data: any) => {
        setResources(prev => [{ id: Date.now().toString(), isPublic: false, ...data }, ...prev]);
    };

    const handleOpenResource = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    // Filter by search query and category
    const filteredResources = resources.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());

        // Category filtering
        if (selectedCategory === 'All') {
            return matchesSearch;
        }

        const categoryMap: Record<string, string[]> = {
            'PDFs': ['pdf'],
            'Videos': ['video'],
            'Docs': ['doc'],
            'Links': ['link', 'text']
        };

        const types = categoryMap[selectedCategory] || [];
        return matchesSearch && types.includes(r.type);
    });

    return (
        <ScreenWrapper>
            <GlobalHeader
                title={t('tabs.library') || 'Library'}
                subtitle={t('library.knowledgeSanctuary')}
                searchProps={{
                    value: searchQuery,
                    onChangeText: setSearchQuery,
                    placeholder: t('library.searchPlaceholder')
                }}
            />


            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: Theme.spacing.md, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={Theme.colors.sanctuarySaffron} />
                }
            >
                {/* Horizontal Carousel for Resource Categories */}
                <VStack space="xl">
                    <VStack space="sm">
                        <Text color={colors.text} size="lg" bold>
                            {t('library.categories')}
                        </Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                        >
                            {LIBRARY_CATEGORIES.map((category) => (
                                <Pressable
                                    key={category}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Box
                                        sx={{
                                            paddingHorizontal: Theme.spacing.lg,
                                            paddingVertical: Theme.spacing.sm,
                                            backgroundColor: selectedCategory === category
                                                ? Theme.colors.sanctuarySaffron
                                                : colors.secondary,
                                            borderRadius: Theme.corners.comfortable,
                                            borderWidth: 1,
                                            borderColor: selectedCategory === category
                                                ? Theme.colors.sanctuarySaffron
                                                : colors.border
                                        }}
                                    >
                                        <Text
                                            color={selectedCategory === category
                                                ? Theme.colors.white  // Pure white for high contrast on saffron
                                                : colors.text
                                            }
                                            size="sm"
                                            bold={selectedCategory === category}
                                        >
                                            {t(`library.types.${category.toLowerCase()}`)}
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
                            title={t('library.emptyTitle')}
                            description={t('library.emptyDesc')}
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
        </ScreenWrapper>
    );
}
