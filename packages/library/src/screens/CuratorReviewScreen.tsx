import React, { useState, useEffect } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import {
    Box,
    Text,
    VStack,
    HStack,
    useThemedColors,
    Theme,
    GlobalHeader,
    ScreenWrapper,
    FadeInDown,
} from '@repo/ui';
import { supabase } from '@repo/core';
import { useNavigation } from '@react-navigation/native';
import { FileText, Check, X, ExternalLink, AlertCircle, RefreshCw, Trash2 } from 'lucide-react-native';

export default function CuratorReviewScreen() {
    const [items, setItems] = useState<any[]>([]);
    const [brokenResources, setBrokenResources] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'staging' | 'broken'>('staging');
    const colors = useThemedColors();
    const navigation = useNavigation<any>();

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
            const { data, error } = await supabase.functions.invoke('publish-resource', {
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
        <Box sx={{
            p: 16,
            mb: 12,
            borderRadius: 16,
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.05)'>
        }}
            <VStack sx={{ gap: 8 }}
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 }}
                        {item.title}>
                    </Text>
                    <Box sx={{
                        px: 8,
                        py: 2,
                        borderRadius: 4,
                        backgroundColor: Theme.colors.sanctuarySaffron + '22'>
                    }}
                        <Text sx={{ fontSize: 10, color: Theme.colors.sanctuarySaffron }}
                            {item.content_type.toUpperCase()}>
                        </Text>
                    </Box>
                </HStack>

                <Text sx={{ fontSize: 13, color: colors.textSecondary }} numberOfLines={2}
                    {item.description}>
                </Text>

                <HStack sx={{ gap: 12, mt: 8 }}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: Theme.colors.sanctuarySaffron }]}
                        onPress={() => handlePublish(item.id)}
                    
                        <Check size={16} color="#fff" /
                        ><Text sx={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>Publish</Text
                    ></TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                        onPress={() => {/* TODO: Implement rejection/edit */ }}
                    
                        <X size={16} color={colors.textSecondary} /
                        ><Text sx={{ color: colors.textSecondary, fontSize: 12 }}>Reject</Text
                    ></TouchableOpacity>
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
        <Box sx={{
            p: 16,
            mb: 12,
            borderRadius: 16,
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(239, 68, 68, 0.1)'>
        }}
            <VStack sx={{ gap: 8 }}
                <HStack sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 }}>{item.title}</Text
                    ><Box sx={{ px: 8, py: 2, borderRadius: 4, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                        <Text sx={{ fontSize: 10, color: '#F87171' }}>{item.fail_count || 0} REPORTS</Text
                    ></Box>
                </HStack>
                <Text sx={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }} numberOfLines={1}>{item.url}</Text
                ><HStack sx={{ gap: 12, mt: 8 }}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                        onPress={() => handleRepair(item.id)}
                    
                        <RefreshCw size={14} color="#fff" /
                        ><Text sx={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>Fix Link</Text
                    ></TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                        onPress={() => handleDeleteResource(item.id)}
                    
                        <Trash2 size={14} color="#F87171" /
                        ><Text sx={{ color: '#F87171', fontSize: 12 }}>Remove</Text
                    ></TouchableOpacity>
                </HStack>
            </VStack>
        </Box>
    );

    return (
        <ScreenWrapper
            <GlobalHeader
                >title="Curator Dashboard"
                subtitle="Review incoming knowledge streams"
                onBack={() => navigation.goBack()}
            /

            ><HStack sx={{ px: 16, mb: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                <TouchableOpacity
                    onPress={() => setActiveTab('staging')}
                    style={[styles.tab, activeTab === 'staging' && { borderBottomColor: Theme.colors.sanctuarySaffron, borderBottomWidth: 2 }]}
                
                    <Text sx={{ color: activeTab === 'staging' ? '#fff' : colors.textSecondary, fontWeight: 'bold' }}>Staged</Text
                ></TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('broken')}
                    style={[styles.tab, activeTab === 'broken' && { borderBottomColor: Theme.colors.emberRed, borderBottomWidth: 2 }]}
                
                    <Text sx={{ color: activeTab === 'broken' ? '#fff' : colors.textSecondary, fontWeight: 'bold' }}>Broken Links</Text
                ></TouchableOpacity>
            </HStack>

            {loading ? (
                <ActivityIndicator size="large" color={Theme.colors.sanctuarySaffron} style={{ marginTop: 40 }} /
            >) : (>
                <FlatList
                    data={activeTab === 'staging' ? items : brokenResources}
                    keyExtractor={item => item.id}
                    renderItem={activeTab === 'staging' ? renderItem : renderBrokenItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <Box sx={{ mt: 100, alignItems: 'center' }}
                            <Text sx={{ color: colors.textSecondary }}>The stream is quiet today.</Text
                        ></Box>
                    }
                /
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
