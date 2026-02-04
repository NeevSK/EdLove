/**
 * LotusPetalFAB - Usage Examples
 * 
 * This file demonstrates different ways to use the Lotus Petal FAB component.
 * Copy these examples to your screens as needed.
 */

import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';
import LotusPetalFAB from './LotusPetalFAB';
import Theme from '../constants/Theme';

// ============================================================================
// EXAMPLE 1: Basic Usage (Simplest)
// ============================================================================

export function BasicFABExample() {
    const [currentTab] = useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');

    const handleFabPress = () => {
        console.log('FAB pressed!');
        // Add your action here
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Your screen content here</Text>
            
            {/* The FAB will appear in the bottom-right corner */}
            <LotusPetalFAB
                currentTab={currentTab}
                onPress={handleFabPress}
            />
        </View>
    );
}

// ============================================================================
// EXAMPLE 2: With Scroll Hide/Show Behavior
// ============================================================================

export function ScrollAwareFABExample() {
    const [currentTab] = useState<'library' | 'self' | 'classroom' | 'community' | 'profile'>('library');
    const scrollY = useSharedValue(0);

    // Track scroll position
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleFabPress = () => {
        console.log('Upload resource');
        // Navigate to upload screen
    };

    return (
        <View style={styles.container}>
            <ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                <Text style={styles.text}>Scroll down to hide the FAB</Text>
                <Text style={styles.text}>Scroll up to show it again</Text>
                {/* Add more content here to enable scrolling */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <Text key={i} style={styles.text}>Item {i + 1}</Text>
                ))}
            </ScrollView>

            {/* FAB will hide when scrolling down */}
            <LotusPetalFAB
                currentTab={currentTab}
                onPress={handleFabPress}
                scrollY={scrollY}
            />
        </View>
    );
}

// ============================================================================
// EXAMPLE 3: Context-Aware with Tab Navigation
// ============================================================================

export function ContextAwareFABExample() {
    const [currentTab, setCurrentTab] = useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');

    const handleFabPress = () => {
        // Different actions based on current tab
        switch (currentTab) {
            case 'self':
                console.log('Log mood - Navigate to mood check-in');
                // navigation.navigate('MoodCheckIn');
                break;
            case 'classroom':
                console.log('Create lesson - Navigate to lesson creator');
                // navigation.navigate('CreateLesson');
                break;
            case 'community':
                console.log('Post announcement - Navigate to new post');
                // navigation.navigate('NewPost');
                break;
            case 'library':
                console.log('Upload resource - Navigate to upload');
                // navigation.navigate('UploadResource');
                break;
            case 'profile':
                console.log('Edit profile - Navigate to edit profile');
                // navigation.navigate('EditProfile');
                break;
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Current tab: {currentTab}</Text>
            
            {/* Buttons to simulate tab changes */}
            <View style={styles.tabButtons}>
                <Text onPress={() => setCurrentTab('self')}>Self</Text>
                <Text onPress={() => setCurrentTab('classroom')}>Classroom</Text>
                <Text onPress={() => setCurrentTab('community')}>Community</Text>
                <Text onPress={() => setCurrentTab('library')}>Library</Text>
                <Text onPress={() => setCurrentTab('profile')}>Profile</Text>
            </View>

            {/* FAB icon changes based on currentTab */}
            <LotusPetalFAB
                currentTab={currentTab}
                onPress={handleFabPress}
            />
        </View>
    );
}

// ============================================================================
// EXAMPLE 4: Conditional/Disabled State
// ============================================================================

export function ConditionalFABExample() {
    const [currentTab] = useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('community');
    const [isLoading, setIsLoading] = useState(false);

    const handleFabPress = async () => {
        setIsLoading(true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Action completed!');
        } catch (error) {
            console.error('Action failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                {isLoading ? 'Processing...' : 'Ready to post'}
            </Text>

            {/* FAB is disabled during loading */}
            <LotusPetalFAB
                currentTab={currentTab}
                onPress={handleFabPress}
                disabled={isLoading}
            />
        </View>
    );
}

// ============================================================================
// EXAMPLE 5: Complete Integration (All Features)
// ============================================================================

export function CompleteFABExample() {
    const [currentTab, setCurrentTab] = useState<'self' | 'classroom' | 'community' | 'library' | 'profile'>('self');
    const [isProcessing, setIsProcessing] = useState(false);
    const scrollY = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollY.value = event.contentOffset.y;
        },
    });

    const handleFabPress = async () => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            // Your async action here
            console.log(`Action for ${currentTab} tab`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView
                onScroll={scrollHandler}
                scrollEventThrottle={16}
            >
                {/* Your scrollable content */}
                <Text style={styles.text}>Complete example with all features</Text>
                {Array.from({ length: 30 }).map((_, i) => (
                    <Text key={i} style={styles.text}>Content {i + 1}</Text>
                ))}
            </ScrollView>

            {/* FAB with all features enabled */}
            <LotusPetalFAB
                currentTab={currentTab}
                onPress={handleFabPress}
                scrollY={scrollY}
                disabled={isProcessing}
            />
        </View>
    );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.creamSilence,
    },
    text: {
        padding: Theme.spacing.md,
        fontSize: Theme.typography.fontSize.lg,
        color: Theme.colors.charcoalTruth,
    },
    tabButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: Theme.spacing.md,
    },
});
