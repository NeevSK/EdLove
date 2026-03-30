import React, { useCallback } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
    WebScreenHeader,
    useTheme,
    Text,
    openExternalURL,
    showExternalLinkOptions,
} from '@repo/ui';
import { LibraryThumbnailCard } from '../components/LibraryThumbnailCard';
import { useTranslation } from 'react-i18next';
import type { LibraryResource } from '../types';
import { useCollection } from '../hooks/useLibrary';
import { buildLibraryExternalLinkOptions } from '../utils/externalLinks';
import { useStore } from '@repo/core';
import { ArrowLeft } from 'lucide-react-native';

function StackFallback() {
    return (
        <div className="sanctuary-card" style={{ padding: '32px', textAlign: 'center' }}            Loading collection...
        </div    );
}

export default function CollectionDetailScreenWeb() {
    const route = useRoute<any>();
    const navigation = useNavigation<any>();
    const { id } = route?.params || {};
    
    const { user } = useStore();
    const theme = useTheme();
    const { t } = useTranslation();

    const { collection, isLoading, error, refetch } = useCollection(id, user?.id);

    const handleOpenResource = useCallback((resource: LibraryResource) => {
        if (!resource.url) return;
        if (resource.type === 'pdf') {
            navigation.navigate('PDFViewer', {
                resourceId: resource.id,
                title: resource.title,
                url: resource.url,
                creator: resource.creator_name,
            });
            return;
        }
        if (resource.type === 'video' || resource.type === 'movie_trailer') {
            navigation.navigate('VideoPlayer', {
                resourceId: resource.id,
                title: resource.title,
                url: resource.url,
                creator: resource.creator_name ?? '',
            });
            return;
        }
        openExternalURL(resource.url, buildLibraryExternalLinkOptions(resource, 'Collection')).catch((err: any) => console.error("Couldn't load page", err));
    }, [navigation]);

    const handleOpenResourceOptions = useCallback((resource: LibraryResource) => {
        if (!resource.url || resource.type === 'pdf' || resource.type === 'video' || resource.type === 'movie_trailer') {
            return;
        }

        showExternalLinkOptions(resource.url, buildLibraryExternalLinkOptions(resource, 'Collection')).catch((err: any) =            console.error("Couldn't show external link options", err)
        );
    }, []);

    if (!id) return <StackFallback />;

    const getYoutubeThumbnail = (url?: string) => {
        if (!url) return undefined;
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : undefined;
    };

    if (isLoading) return <StackFallback />;

    if (error || !collection) {
        return (
            <div className="sanctuary-screen"                <div className="sanctuary-container" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px' }}                    <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.3)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border)', maxWidth: '500px' }}                        <div style={{ fontSize: '48px', marginBottom: '24px' }}>Library</div                        <Text style={{ fontSize: 20, fontWeight: '700', color: 'var(--ink)', marginBottom: 12 }}                            {error ? t('library.errorLoading') : t('library.emptyTitle')}
                        </Text                        <Text style={{ color: 'var(--ink-ghost)', marginBottom: 32, lineHeight: 24 }}                            {error || t('library.emptyDesc')}
                        </Text                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}                            <button className="secondary-button" onClick={() => navigation.goBack()}                                <ArrowLeft size={16} /> {t('library.goBack')}
                            </button                            <button className="premium-button" onClick={() => refetch()}                                {t('library.retry') || 'Retry'}
                            </button                        </div                    </div                </div            </div        );
    }

    return (
        <div className="sanctuary-screen"            <div className="sanctuary-container"                <WebScreenHeader
                    title={collection.name}
                    note={collection.is_virtual ? t('library.dynamicCollection') : t('library.curatedCollection')}
                    actions={(
                        <button className="secondary-button" onClick={() => navigation.goBack()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}                            <ArrowLeft size={16} /                            {t('library.backToLibrary')}
                        </button                    )}
                /
                <div style={{ marginBottom: 40, background: 'rgba(255,255,255,0.3)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border)' }}                    <Text style={{ fontSize: 18, color: theme.text.primary, lineHeight: 28, marginBottom: 12, fontWeight: '500' }}                        {collection.description || t('library.noDescription')}
                    </Text                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}                        <div style={{ padding: '6px 12px', borderRadius: '100px', background: 'var(--action-soft)', color: 'var(--action)', fontSize: '12px', fontWeight: '800' }}                            {t('library.resourcesCount', { count: collection.resources.length })}
                        </div                        {collection.creator_name && (
                            <div style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}                                {t('library.curatedBy')} <span style={{ fontWeight: '700', color: 'var(--ink)' }}>{collection.creator_name}</span                            </div                        )}
                        <div style={{ width: '4px', height: '4px', borderRadius: '2px', background: 'var(--border)' }} /                        <div style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}                            {collection.is_virtual ? t('library.dynamic') : t('library.collection')}
                        </div                    </div                </div
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '24px',
                        paddingBottom: '80px',
                    }}
                                    {collection.resources.map((res: LibraryResource) => (
                        <LibraryThumbnailCard
                            key={res.id}
                            title={res.title}
                            type={res.type}
                            subject={res.subjects?.[0] ?? 'General'}
                            thumbnailUrl={res.media?.url || (res as any).thumbnail_url || (res.type === 'video' || res.type === 'movie_trailer' ? getYoutubeThumbnail(res.url) : undefined)}
                            endorsements={res.endorsements}
                            verified={res.verified}
                            onPress={() => handleOpenResource(res)}
                            onLongPress={res.url ? () => handleOpenResourceOptions(res) : undefined}
                        /                    ))}
                    {collection.resources.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '60px', textAlign: 'center' }}                            <Text style={{ color: theme.text.muted }}>{t('library.emptyCollection')}</Text                        </div                    )}
                </div            </div        </div    );
}
