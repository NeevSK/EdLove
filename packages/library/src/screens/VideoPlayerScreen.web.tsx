/**
 * VideoPlayerScreen.web.tsx  Pattern A: full web replacement
 *
 * On native, VideoPlayerScreen wraps expo-video's components with custom
 * controls. On web we use the browser-native <video> element instead, which
 * gives us full codec support, captions, and picture-in-picture for free.
 *
 * On web Metro resolves this file instead of VideoPlayerScreen.tsx.
 * No expo-av or expo-video import here.
 */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    useThemedColors,
    Theme,
    SanctuaryButton,
    formatTimeSecs,
} from '@repo/ui';
import { useNavigation } from '@react-navigation/native';
import { Play, Pause, RotateCcw, RotateCw, X, Maximize } from 'lucide-react-native';

interface VideoPlayerScreenProps {
    route: {
        params: {
            resourceId: string;
            title: string;
            url: string;
            creator: string;
        };
    };
    navigation?: any;
}

export default function VideoPlayerScreen({ route }: VideoPlayerScreenProps) {
    const { title, creator, url } = route.params;
    const navigation = useNavigation<any>();
    const colors = useThemedColors();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [hasError, setHasError] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-hide controls after 3 s of inactivity
    const resetHideTimer = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current);
        setShowControls(true);
        hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }, []);

    useEffect(() => {
        resetHideTimer();
        return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
    }, []);

    const handlePlayPause = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) { v.play(); } else { v.pause(); }
        resetHideTimer();
    }, [resetHideTimer]);

    const handleSeekBy = useCallback((delta: number) => {
        const v = videoRef.current;
        if (!v) return;
        v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
        resetHideTimer();
    }, [resetHideTimer]);

    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const v = videoRef.current;
        if (!v || v.duration === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        v.currentTime = ratio * v.duration;
        resetHideTimer();
    }, [resetHideTimer]);

    const handleFullscreen = useCallback(() => {
        const v = videoRef.current;
        if (!v) return;
        if (v.requestFullscreen) v.requestFullscreen();
        else if ((v as any).webkitRequestFullscreen) (v as any).webkitRequestFullscreen();
    }, []);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (hasError || !url) {
        return (
            <Box sx={{ flex: 1, backgroundColor: 'black', alignItems: 'center', justifyContent: 'center' }}
                <Text color="white" size="lg" style={{ textAlign: 'center', padding: Theme.spacing.xl }}
                    Unable to load video. Please check the URL and try again.>
                </Text>
                <SanctuaryButton onPress={() => navigation.goBack()} leftIcon={X}
                    Go Back
                </SanctuaryButton>
            </Box>
        );
    }

    return (
        <Box sx={{ flex: 1, backgroundColor: 'black' }}
            {/* Browser-native <video> element  full codec + PiP support */}
            {/* @ts-ignore  Pressable style={absoluteFill} type mismatch on web */}
            <Pressable
                onPress={() => { setShowControls(c => !c); resetHideTimer(); }}
                style={StyleSheet.absoluteFill}
                accessibilityLabel="Toggle controls"
            
                {/* @ts-ignore  'video' is a valid DOM element in react-native-web */}
                <video
                    ref={videoRef}
                    src={url}
                    style={styles.video as any}
                    playsInline
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                    onDurationChange={() => setDuration(videoRef.current?.duration ?? 0)}
                    onError={() => setHasError(true)}
                /
            ></Pressable>

            {/* Overlay controls */}
            {showControls && (
                <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none"
                    {/* Header */}>
                    <View style={styles.header} pointerEvents="auto"
                        <Pressable
                            onPress={() => navigation.goBack()}
                            accessibilityLabel="Close video"
                            style={styles.closeBtn}
                        
                            <X size={22} color="#fff" /
                        ></Pressable>
                        <VStack sx={{ flex: 1 }}
                            <Text style={styles.titleText} numberOfLines={1}>{title}</Text
                            >{creator ? <Text style={styles.creatorText}>{creator}</Text> : null}
                        </VStack>
                        <Pressable
                            onPress={handleFullscreen}
                            accessibilityLabel="Enter fullscreen"
                            style={styles.closeBtn}>
                        
                            <Maximize size={20} color="#fff" /
                        </Pressable>
                    </View>

                    {/* Playback buttons */}
                    <View style={styles.centerRow} pointerEvents="auto"
                        <Pressable onPress={() => handleSeekBy(-10)} style={styles.controlBtn} accessibilityLabel="Rewind 10 seconds"
                            <RotateCcw size={28} color="#fff" /
                            ><Text style={styles.seekLabel}>10</Text
                        ></Pressable>
                        <Pressable onPress={handlePlayPause} style={styles.playBtn} accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
                            {isPlaying
                                ? <Pause size={36} color="#fff" fill="#fff" /
                                >: <Play size={36} color="#fff" fill="#fff" />
                            >}
                        </Pressable>
                        <Pressable onPress={() => handleSeekBy(10)} style={styles.controlBtn} accessibilityLabel="Skip 10 seconds"
                            <RotateCw size={28} color="#fff" /
                            <Text style={styles.seekLabel}>10</Text
                        ></Pressable>
                    </View>

                    {/* Progress bar + timestamps */}
                    <View style={styles.footer} pointerEvents="auto"
                        <Text style={styles.timeText}>{formatTimeSecs(currentTime)}</Text
                        >{/* @ts-ignore  onClick on div in react-native-web */}
                        <div
                            style={styles.progressTrack as any}
                            onClick={handleProgressClick}
                            role="slider"
                            aria-label="Video progress"
                            aria-valuenow={Math.round(progress)}
                            aria-valuemin={0}
                            aria-valuemax={100}>
                        
                            <div style={{ ...styles.progressFill as any, width: `${progress}%` }} /
                        ></div>
                        <Text style={styles.timeText}>{formatTimeSecs(duration)}</Text
                    </View>
                </View>
            )}
        </Box>
    );
}

const styles = StyleSheet.create({
    video: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
    } as any,
    overlay: {
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 12,
        gap: 12,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    creatorText: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 12,
    },
    centerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
    },
    controlBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 52,
        height: 52,
    },
    seekLabel: {
        color: '#fff',
        fontSize: 11,
        marginTop: -4,
    },
    playBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: 'rgba(212,132,58,0.85)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 24,
        gap: 10,
    },
    timeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontVariant: ['tabular-nums'] as any,
        minWidth: 36,
        textAlign: 'center',
    },
    progressTrack: {
        flex: 1,
        height: 5,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.25)',
        cursor: 'pointer',
        overflow: 'hidden',
    } as any,
    progressFill: {
        height: '100%',
        backgroundColor: Theme.colors.sanctuarySaffron,
        borderRadius: 3,
        transition: 'width 0.1s linear',
    } as any,
});
