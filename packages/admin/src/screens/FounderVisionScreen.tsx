import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
    useThemedColors, 
    Text, 
    HStack, 
    VStack, 
    Box, 
    GlassCard 
} from '@repo/ui';
import { UniversalPerspective } from '@repo/library';
import { GitMerge, Zap, Shield, Share2 } from 'lucide-react-native';

/**
 * FounderVisionScreen - Strategic App-Logic Visualization.
 * 
 * Demonstrates the "Universal Perspective" for the Founder role.
 * Maps out the platform's architectural priorities as a mind-map/flowchart.
 */
export default function FounderVisionScreen() {
    const theme = useThemedColors();
    
    // Theoretical topology for App Architecture
    const appLogicTopology = {
        nodes: [
            { id: 'core', label: 'Gurudevi Core', type: 'topic', group: 'foundation' },
            { id: 'auth', label: 'Auth & Identity', type: 'persona', group: 'security' },
            { id: 'library', label: 'Library Sphere', type: 'topic', group: 'resource' },
            { id: 'community', label: 'Community Weaving', type: 'topic', group: 'resonance' },
            { id: 'analytics', label: 'Resonance Metrics', type: 'topic', group: 'governance' },
            { id: 'mobile', label: 'Native Pulse', type: 'persona', group: 'deployment' },
            { id: 'web', label: 'Web Parity', type: 'persona', group: 'deployment' }
        ],
        links: [
            { source: 'core', target: 'auth', relationship: 'dependency' },
            { source: 'core', target: 'library', relationship: 'core_feature' },
            { source: 'core', target: 'community', relationship: 'core_feature' },
            { source: 'library', target: 'analytics', relationship: 'data_flow' },
            { source: 'community', target: 'analytics', relationship: 'data_flow' },
            { source: 'core', target: 'mobile', relationship: 'isomorphic' },
            { source: 'core', target: 'web', relationship: 'isomorphic' }
        ],
        context: { title: 'Strategic Resonance Topology' }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.scene.backgroundPrimary }]}>
            <View style={styles.header}>
                <HStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <VStack>
                        <Text style={styles.title}>Strategic Vision</Text>
                        <Text style={styles.subtitle}>Mapping the App Topology</Text>
                    </VStack>
                    <TouchableOpacity style={styles.shareButton}>
                        <Share2 size={20} color={theme.status.warning} />
                    </TouchableOpacity>
                </HStack>
            </View>

            <View style={styles.mappingContainer}>
                <UniversalPerspective 
                    topology={appLogicTopology as any}
                    initialPerspective="vastu" // Start as a Mind-map
                    title="Architecture Pulse"
                />
            </View>

            <View style={styles.statsFooter}>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.statusScroll}>
                    <StatusPill icon={GitMerge} label="7 Ecosystem Nodes" color={theme.status.warning} />
                    <StatusPill icon={Zap} label="High Resonance" color={theme.status.success} />
                    <StatusPill icon={Shield} label="RLS Protected" color={theme.status.info} />
                </ScrollView>
            </View>
        </View>
    );
}

const StatusPill = ({ icon: Icon, label, color }: any) => {
    const theme = useThemedColors();
    return (
        <GlassCard style={styles.pill}>
            <HStack style={{ alignItems: 'center', gap: 6 }}>
                <Icon size={14} color={color} />
                <Text style={styles.pillText}>{label}</Text>
            </HStack>
        </GlassCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 20
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.5
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)'
    },
    shareButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 179, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    mappingContainer: {
        flex: 1,
        borderRadius: 30,
        marginHorizontal: 16,
        overflow: 'hidden',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)'
    },
    statsFooter: {
        paddingVertical: 24
    },
    statusScroll: {
        paddingHorizontal: 24,
        gap: 12,
        flexDirection: 'row'
    },
    pill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20
    },
    pillText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '600'
    }
});
