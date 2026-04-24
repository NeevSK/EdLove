import React, { useState, useEffect } from 'react';
import {
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    useTheme,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    Pressable,
    Icon as SanctuaryIcon,
} from '@repo/ui';
import { supabase } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { Check, X, RefreshCw, Trash2 } from 'lucide-react-native';
import { usePermissions } from '@repo/core';

export default function CuratorReviewScreen() {
    const { can, flags } = usePermissions();
    const navigation = useNavigation<any>();
    
    const isLibraryEnabled = flags.isLibraryManagementEnabled;
    const canManage = can('manage', 'LibraryCuratorDashboard');

    const [items, setItems] = useState<any[]>([]);
    const [brokenResources, setBrokenResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'staging' | 'broken'>('staging');
    const theme = useTheme();

    if (!isLibraryEnabled || !canManage) {
        return (
            <ScreenWrapper>
                <GlobalHeader title="Curator Review" showBack onBack={() => navigation.goBack()} />
                <Box className="flex-1 justify-center items-center p-xl">
                    <Text className="text-phaseText-secondary text-center">
                        Access Denied. Curation features are currently restricted.
                    </Text>
                </Box>
            </ScreenWrapper>
        );
    }

    const fetchStaging = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('staging')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error) setItems(data || []);
        setLoading(false);
    };

    const fetchBroken = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('library_resources')
            .select('*')
            .or('link_status.eq.broken,fail_count.gt.0')
            .order('fail_count', { ascending: false });

        if (!error) setBrokenResources(data || []);
        setLoading(false);
    };

    const handleRepair = async (id: string) => {
        // @ts-ignore - Alert.prompt is iOS only but we use it for curators who use iOS/Web
        Alert.prompt(
            'Repair Link',
            'Enter new URL for this resource:',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Update',
                    onPress: (url?: string) => {
                        if (!url) return;
                        (async () => {
                            const { error } = await supabase
                                .from('library_resources')
                                .update({ url, link_status: 'working', fail_count: 0 })
                                .eq('id', id);
                            if (!error) {
                                Alert.alert('Success', 'Link restored.');
                                fetchBroken();
                            }
                        })();
                    }
                }
            ]
        );
    };

    useEffect(() => {
        if (activeTab === 'staging') fetchStaging();
        else fetchBroken();
    }, [activeTab]);

    const handlePublish = async (id: string) => {
        try {
            // First mark as approved in staging
            const { error: updateError } = await supabase
                .from('staging')
                .update({ status: 'approved' })
                .eq('id', id);

            if (updateError) throw updateError;

            // Call the Edge Function
            const { error } = await supabase.functions.invoke('publish-resource', {
                body: { staging_id: id }
            });

            if (error) throw error;

            Alert.alert('Success', 'Resource published to the Cosmos!');
            fetchStaging();
        } catch (err: any) {
            Alert.alert('Error', err.message);
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <Box className="p-4 mb-3 rounded-2xl bg-phase-surface border border-phase-border">
            <VStack className="gap-2">
                <HStack className="justify-between items-center">
                    <Text className="text-base font-bold text-phaseText-primary flex-1">
                        {item.title}
                    </Text>
                    <Box 
                        className="px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${theme.accent.action}22` }}>
                        <Text 
                            className="text-[10px] font-bold"
                            style={{ color: theme.accent.action }}>
                            {item.content_type?.toUpperCase() || 'EXTERNAL'}
                        </Text>
                    </Box>
                </HStack>

                <Text className="text-[13px] text-phaseText-secondary" numberOfLines={2}>
                    {item.description}
                </Text>

                <HStack className="gap-3 mt-2">
                    <Pressable
                        style={({ pressed }) => [
                            styles.actionBtn, 
                            { backgroundColor: theme.accent.action, opacity: pressed ? 0.8 : 1 }
                        ]}
                        onPress={() => handlePublish(item.id)}
                    >
                        <SanctuaryIcon as={Check} size={16} color="#fff" />
                        <Text className="text-white font-bold text-xs">Publish</Text>
                    </Pressable>

                    <Pressable
                        className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-phase-surface/80 border border-phase-border active:opacity-80"
                        onPress={() => {/* TODO */ }}
                    >
                        <SanctuaryIcon as={X} size={16} color={theme.text.secondary} />
                        <Text className="text-phaseText-secondary text-xs font-bold">Reject</Text>
                    </Pressable>
                </HStack>
            </VStack>
        </Box>
    );

    const handleDeleteResource = async (id: string) => {
        Alert.alert(
            'Delete Resource',
            'Are you sure? This link is broken and will be removed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        const { error } = await supabase
                            .from('library_resources')
                            .delete()
                            .eq('id', id);
                        if (!error) fetchBroken();
                    }
                }
            ]
        );
    };

    const renderBrokenItem = ({ item }: { item: any }) => (
        <Box className="p-4 mb-3 rounded-2xl bg-phase-danger/5 border border-phase-danger/10">
            <VStack className="gap-2">
                <HStack className="justify-between items-center">
                    <Text className="text-base font-bold text-phaseText-primary flex-1">{item.title}</Text>
                    <Box className="px-2 py-0.5 rounded bg-phase-danger/20">
                        <Text className="text-[10px] text-phase-danger font-bold">{item.fail_count || 0} REPORTS</Text>
                    </Box>
                </HStack>
                <Text className="text-[12px] text-phaseText-secondary" numberOfLines={1}>{item.url}</Text>
                <HStack className="gap-3 mt-2">
                    <Pressable
                        className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-phase-accent active:opacity-80"
                        onPress={() => handleRepair(item.id)}
                    >
                        <SanctuaryIcon as={RefreshCw} size={14} color="#fff" />
                        <Text className="text-white text-xs font-bold">Fix Link</Text>
                    </Pressable>
                    <Pressable
                        className="flex-row items-center gap-1.5 px-3 py-2 rounded-lg bg-phase-danger/10 active:opacity-80"
                        onPress={() => handleDeleteResource(item.id)}
                    >
                        <SanctuaryIcon as={Trash2} size={14} color={theme.accent.danger} />
                        <Text className="text-phase-danger text-xs font-bold">Remove</Text>
                    </Pressable>
                </HStack>
            </VStack>
        </Box>
    );

    return (
        <ScreenWrapper>
            <GlobalHeader
                title="Curator Dashboard"
                subtitle="Review incoming knowledge streams"
                onBack={() => navigation.goBack()}
            />

            <HStack className="px-4 mb-4 border-b border-phase-border">
                <Pressable
                    onPress={() => setActiveTab('staging')}
                    style={[styles.tab, activeTab === 'staging' && { borderBottomColor: theme.accent.action, borderBottomWidth: 2 }]}
                >
                    <Text 
                        className="font-bold"
                        style={{ color: activeTab === 'staging' ? theme.text.primary : theme.text.secondary }}>
                        Staged
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => setActiveTab('broken')}
                    style={[styles.tab, activeTab === 'broken' && { borderBottomColor: theme.accent.danger, borderBottomWidth: 2 }]}
                >
                    <Text 
                        className="font-bold"
                        style={{ color: activeTab === 'broken' ? theme.accent.danger : theme.text.secondary }}>
                        Broken Links
                    </Text>
                </Pressable>
            </HStack>

            {loading ? (
                <ActivityIndicator size="large" color={theme.accent.action} style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={activeTab === 'staging' ? items : brokenResources}
                    keyExtractor={item => item.id}
                    renderItem={activeTab === 'staging' ? renderItem : renderBrokenItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <Box className="mt-20 items-center">
                            <Text className="text-phaseText-secondary text-center">
                                The wisdom stream is quiet today.
                            </Text>
                        </Box>
                    }
                />
            )}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    }
});


