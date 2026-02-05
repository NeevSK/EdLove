import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    ScrollView,
    Image,
    Button,
    ButtonText
} from "@gluestack-ui/themed";
import { Theme } from '../../constants/Theme';
import { useCommunity } from '../../hooks/useCommunity';
import GlobalHeader from '../../components/shared/GlobalHeader';
import PostCard from '../../components/community/PostCard';
import { Users, Settings } from 'lucide-react-native';

// Mock params for now, in real nav this comes from route
interface GroupDetailScreenProps {
    groupId?: string; // Should come from route.params
}

export default function GroupDetailScreen({ groupId = '1' }: GroupDetailScreenProps) {
    const { groups, posts, fetchPosts } = useCommunity();

    // In real app we get group from ID
    const group = groups.find(g => g.id === groupId) || {
        name: 'Science Club',
        description: 'Exploring the universe together.',
        member_count: 42,
        type: 'public'
    };

    React.useEffect(() => {
        fetchPosts(groupId);
    }, [groupId]);

    return (
        <Box sx={{ flex: 1, backgroundColor: Theme.colors.voidIndigo }}>
            <GlobalHeader title={group.name} showBackButton />
            <ScrollView>
                {/* Cover Area */}
                <Box h={150} sx={{ backgroundColor: Theme.colors.deepIndigo }}>
                    {/* Placeholder for cover image */}
                    <Box sx={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={48} color={Theme.colors.dimGray} />
                    </Box>
                </Box>

                <VStack space="md" p="$4" mt="-$8">
                    {/* Group info card */}
                    <Box
                        p="$4"
                        sx={{
                            backgroundColor: Theme.colors.midnightBlue,
                            borderRadius: Theme.corners.generous,
                            ...Theme.shadows.md
                        }}
                    >
                        <HStack justifyContent="space-between" alignItems="flex-start">
                            <VStack space="xs" flex={1}>
                                <Heading size="xl" color={Theme.colors.sacredWhite}>{group.name}</Heading>
                                <Text color={Theme.colors.mistGray} size="sm">{group.description}</Text>
                                <HStack space="xs" alignItems="center" mt="$2">
                                    <Users size={14} color={Theme.colors.sanctuarySaffron} />
                                    <Text color={Theme.colors.sanctuarySaffron} size="xs" bold>
                                        {group.member_count} Members
                                    </Text>
                                </HStack>
                            </VStack>
                            <Button variant="outline" size="xs" action="secondary">
                                <Settings size={14} color={Theme.colors.mistGray} />
                            </Button>
                        </HStack>
                    </Box>

                    {/* Feed */}
                    <Heading size="md" color={Theme.colors.pearlGray} mt="$2">Discussions</Heading>

                    <VStack space="md">
                        {posts.map(post => (
                            <PostCard
                                key={post.id}
                                {...post}
                                author={{
                                    id: post.author_id,
                                    name: post.author_name,
                                    avatarUrl: post.author_avatar,
                                }}
                                createdAt={post.created_at}
                                reactions={Object.values(post.reactions || {}).reduce((a, b) => a + b, 0)}
                                comments={0}
                            />
                        ))}
                    </VStack>
                </VStack>
            </ScrollView>
        </Box>
    );
}
