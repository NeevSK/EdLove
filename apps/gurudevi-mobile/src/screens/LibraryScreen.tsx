import React, { useState } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Box, VStack, Text, HStack } from "@gluestack-ui/themed";
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

export default function LibraryScreen() {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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
                    <TouchableOpacity onPress={() => { }}>
                        <Search color={Theme.colors.sacredWhite} size={24} />
                    </TouchableOpacity>
                }
            />

            <VStack space="md" px="$4" py="$4">
                <SanctuaryInput
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    leftIcon={Search}
                />
            </VStack>

            <ScrollView
                contentContainerStyle={{ padding: Theme.spacing.md, paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={Theme.colors.sanctuarySaffron} />
                }
            >
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
