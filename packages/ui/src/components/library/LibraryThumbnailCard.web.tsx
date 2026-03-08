import React from 'react';
import {
    BookOpen,
    Video,
    File,
    Link,
    BookMarked,
    FileText,
    Clapperboard,
    Cpu,
    ThumbsUp,
    BadgeCheck,
    Lock
} from 'lucide-react-native';

const TYPE_CONFIG: any = {
    lesson: { icon: BookOpen, color: '#f59e0b', label: 'Lesson' },
    worksheet: { icon: FileText, color: '#d97706', label: 'Worksheet' },
    guide: { icon: BookMarked, color: '#3b82f6', label: 'Guide' },
    reading: { icon: BookOpen, color: '#10b981', label: 'Reading' },
    video: { icon: Video, color: '#0ea5e9', label: 'Video' },
    link: { icon: Link, color: '#f59e0b', label: 'Link' },
    pdf: { icon: File, color: '#ef4444', label: 'PDF' },
    story: { icon: BookOpen, color: '#8b5cf6', label: 'Story' },
    movie_trailer: { icon: Clapperboard, color: '#ec4899', label: 'Film' },
    tech_guide: { icon: Cpu, color: '#3b82f6', label: 'Tech' },
    other: { icon: BookOpen, color: '#6b7280', label: 'File' },
};

export function LibraryThumbnailCard({
    title,
    type,
    subject,
    thumbnailUrl,
    endorsements = 0,
    verified = false,
    onPress,
    isLocked = false
}: any) {
    const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.other;
    const Icon = cfg.icon;

    return (
        <div
            className="sanctuary-card"
            onClick={onPress}
            style={{
                width: '100%',
                height: '240px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}
        >
            {/* Thumbnail / Visual Area */}
            <div style={{
                height: '140px',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                background: thumbnailUrl ? `url(${thumbnailUrl}) center/cover no-repeat` : `rgba(var(--water-rgb), 0.05)`
            }}>
                {/* Overlay Grain/Gradient */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6))',
                    zIndex: 1
                }} />

                {/* Type Badge */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <Icon size={12} color="white" />
                    <span style={{ fontSize: '10px', fontWeight: '800', color: 'white', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {cfg.label}
                    </span>
                </div>

                {/* Verified Badge */}
                {verified ? (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                        <BadgeCheck size={18} color="#10b981" />
                    </div>
                ) : isLocked && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                        <Lock size={16} color="rgba(255,255,255,0.6)" />
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="card-body-inner" style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--water)', marginBottom: '4px', opacity: 0.8 }}>
                        {subject || 'General Wisdom'}
                    </div>
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: 'var(--ink)',
                        margin: 0,
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {title}
                    </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                    {endorsements > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ThumbsUp size={12} color="var(--sun)" />
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ink-ghost)' }}>{endorsements}</span>
                        </div>
                    )}
                    <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: '600', color: 'var(--ink-ghost)' }}>
                        Read More →
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LibraryThumbnailCard;
