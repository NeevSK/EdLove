import React, { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions, TouchableOpacity, FlatList } from 'react-native';
import {
    ScreenWrapper,
    GlobalHeader,
    useThemedColors,
    Theme,
    Box,
    Text,
    FadeInDown,
    HorizontalChipRow,
    HStack,
    VStack,
    SanctuaryLocation,
    LocationSubscription,
    LocationObject
} from '@repo/ui';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Search, Map as MapIcon, Layers, X, Globe, Star } from 'lucide-react-native';
import { libraryAPI } from '../api/library';
import { supabase } from '@repo/core';
import { useMapPresence } from '../hooks/useMapPresence';
import { useUserRole } from '@repo/core';
// Removed: import * as Location from 'expo-location';

export default function MapScreen() {
    const colors = useThemedColors();
    const navigation = useNavigation();
    const [layers, setLayers] = useState<any[]>([]);
    const [selectedLayer, setSelectedLayer] = useState<string>('cosmos');
    const [projection, setProjection] = useState<'earth' | 'cosmos'>('cosmos');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { role, userId } = useUserRole();
    const { presences, updateLocation } = useMapPresence(`presence:map:${selectedLayer}`);

    useEffect(() => {
        if (searchQuery.trim().length > 2) {
            const delayDebounceFn = setTimeout(async () => {
                setIsSearching(true);
                try {
                    const results = await libraryAPI.searchMapUniverse(searchQuery);
                    setSearchResults(results);
                } catch (err) {
                    console.error('Map search failed:', err);
                } finally {
                    setIsSearching(false);
                }
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    useEffect(() => {
        const fetchLayers = async () => {
            const { data } = await supabase.from('map_layers').select('*').order('created_at');
            if (data) {
                setLayers(data.map(l => ({
                    label: l.name,
                    value: l.layer_type,
                    projection: l.projection_type
                })));
                setLoading(false);
            }
        };
        fetchLayers();
    }, []);

    // Track user location for Community Aura
    useEffect(() => {
        if (!userId || !role) return;

        let locationSubscription: LocationSubscription | null = null;

        const startTracking = async () => {
            const { status } = await SanctuaryLocation.requestPermissionsAsync();
            if (status !== 'granted') return;

            locationSubscription = await SanctuaryLocation.watchPositionAsync(
                {
                    accuracy: SanctuaryLocation.Accuracy.Balanced,
                    timeInterval: 10000,
                    distanceInterval: 50,
                },
                (location: LocationObject) => {
                    updateLocation({
                        userId: userId!,
                        vibe: 'active',
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        role: role || 'guest',
                    });
                }
            );
        };

        startTracking();

        return () => {
            if (locationSubscription) locationSubscription.remove();
        };
    }, [userId, role, updateLocation, selectedLayer]);

    const handleLayerSelect = (value: string) => {
        setSelectedLayer(value);
        const layer = layers.find(l => l.value === value);
        if (layer?.projection) setProjection(layer.projection);
    };

    return (
        <ScreenWrapper scroll={false}>
            <GlobalHeader
                title="Knowledge Map"
                subtitle="The TrÃ¼be of Shared Wisdom"
                showBack
                onBack={() => navigation.goBack()}
                showSearch
                searchProps={{
                    value: searchQuery,
                    onChangeText: setSearchQuery,
                    placeholder: "Search Sri Lanka, Schools, Topics..."
                }}
            />

            {searchResults.length > 0 && (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[styles.searchResultsOverlay, { backgroundColor: colors.primary, borderBottomColor: colors.border }]}
                >
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => `${item.result_type}-${item.id}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.searchResultItem}
                                onPress={() => {
                                    if (item.result_type === 'layer') handleLayerSelect(item.layer_type);
                                    setSearchQuery('');
                                }}
                            >
                                <HStack sx={{ gap: 12, alignItems: 'center' }}>
                                    <Box sx={{
                                        p: 8,
                                        borderRadius: 8,
                                        backgroundColor: item.result_type === 'layer'
                                            ? Theme.colors.sanctuarySaffron + '11'
                                            : colors.secondary
                                    }}>
                                        {item.result_type === 'layer' ? (
                                            <Globe size={18} color={Theme.colors.sanctuarySaffron} />
                                        ) : (
                                            <Star size={18} color={Theme.colors.sanctuarySaffron} />
                                        )}
                                    </Box>
                                    <VStack sx={{ flex: 1 }}>
                                        <Text sx={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
                                            {item.name}
                                        </Text>
                                        <Text sx={{ fontSize: 11, color: colors.textSecondary }} numberOfLines={1}>
                                            {item.result_type === 'layer' ? `Map Layer â€¢ ${item.projection_type}` : 'Resource Node'}
                                        </Text>
                                    </VStack>
                                </HStack>
                            </TouchableOpacity>
                        )}
                        style={{ maxHeight: 300 }}
                    />
                </Animated.View>
            )}

            <Box sx={{ p: 12, backgroundColor: colors.secondary }}>
                <HorizontalChipRow
                    chips={layers.length > 0 ? layers : [{ label: 'Assembling...', value: 'loading' }]}
                    selectedValue={selectedLayer}
                    onSelect={handleLayerSelect}
                    size="sm"
                />
            </Box>

            <Box sx={{ flex: 1, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' }}>
                {/* Community Aura Visualization */}
                {presences.map((presence) => (
                    <Animated.View
                        key={presence.userId}
                        entering={FadeIn}
                        exiting={FadeOut}
                        style={[
                            styles.aura,
                            {
                                backgroundColor: getVibeColor(presence.vibe, colors),
                                // Simplified positioning for placeholder visualization
                                // In a real Mapbox implementation, these would be markers
                                left: 50 + (Math.random() * 100),
                                top: 50 + (Math.random() * 100),
                            }
                        ]}
                    >
                        <Box sx={{ width: 12, height: 12, borderRadius: 6, backgroundColor: getVibeColor(presence.vibe, colors) }} />
                    </Animated.View>
                ))}

                <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.placeholder}>
                    <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: Theme.colors.sanctuarySaffron + '11',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 16
                    }}>
                        {projection === 'earth' ? (
                            <MapIcon size={40} color={Theme.colors.sanctuarySaffron} />
                        ) : (
                            <Layers size={40} color={Theme.colors.sanctuarySaffron} />
                        )}
                    </Box>
                    <Text sx={{ fontSize: 20, fontWeight: '900', color: colors.textPrimary }}>
                        {projection === 'earth' ? 'Geographic Island' : 'Epistemic Cosmos'}
                    </Text>
                    <Text sx={{ fontSize: 13, color: colors.textSecondary, textAlign: 'center', maxWidth: 280, marginTop: 8 }}>
                        {projection === 'earth'
                            ? `Mapping the physical presence of ${layers.find(l => l.value === selectedLayer)?.label || 'entities'} across Sri Lanka and the world.`
                            : `Exploring the hidden islands of thought, mind maps, and pathways within the ${layers.find(l => l.value === selectedLayer)?.label || 'cosmos'}.`
                        }
                    </Text>
                </Animated.View>
            </Box>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        alignItems: 'center',
    },
    searchResultsOverlay: {
        position: 'absolute',
        top: 110, // Approx header height
        left: 0,
        right: 0,
        zIndex: 100,
        borderBottomWidth: 1,
        maxHeight: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    searchResultItem: {
        padding: 16,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    aura: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0.4,
    }
});

const getVibeColor = (vibe: string, colors: any) => {
    switch (vibe.toLowerCase()) {
        case 'active': return colors.action || Theme.colors.sanctuarySaffron;
        case 'reflecting': return colors.secondary || Theme.colors.gurudeviViolet;
        case 'teaching': return colors.success || Theme.colors.sanctuarySaffron;
        default: return Theme.colors.sanctuarySaffron;
    }
};

