import {
  BadgeCheck,
  BookMarked,
  Bookmark,
  BookOpen,
  Clapperboard,
  Cpu,
  File,
  FileText,
  Link,
  Lock,
  ThumbsUp,
  Video,
} from 'lucide-react-native';
import type React from 'react';
import { useState } from 'react';

interface LibraryThumbnailCardWebProps {
  title?: string;
  type?: string;
  subject?: string;
  thumbnailUrl?: string;
  endorsements?: number;
  verified?: boolean;
  isLocked?: boolean;
  has_bookmarked?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  onBookmarkToggle?: () => void | Promise<void>;
}

const TYPE_CONFIG: Record<
  string,
  {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    color: string;
    label: string;
  }
> = {
  lesson: { icon: BookOpen, color: '#dd9b28', label: 'Lesson' },
  worksheet: { icon: FileText, color: '#c77b22', label: 'Worksheet' },
  guide: { icon: BookMarked, color: '#6798d6', label: 'Guide' },
  reading: { icon: BookOpen, color: '#5a9a7c', label: 'Reading' },
  video: { icon: Video, color: '#5b9fcb', label: 'Video' },
  link: { icon: Link, color: '#dd9b28', label: 'Link' },
  pdf: { icon: File, color: '#d36d63', label: 'PDF' },
  story: { icon: BookOpen, color: '#8e78cb', label: 'Story' },
  movie_trailer: { icon: Clapperboard, color: '#c7658f', label: 'Film' },
  tech_guide: { icon: Cpu, color: '#6798d6', label: 'Tech' },
  other: { icon: BookOpen, color: '#8a8b95', label: 'File' },
};

function resolveType(type?: string): keyof typeof TYPE_CONFIG {
  const normalized = type?.toLowerCase() ?? 'other';
  return TYPE_CONFIG[normalized] ? normalized : 'other';
}

export function LibraryThumbnailCard({
  title,
  type,
  subject,
  thumbnailUrl,
  endorsements = 0,
  verified = false,
  onPress,
  onLongPress,
  isLocked = false,
  has_bookmarked = false,
  onBookmarkToggle,
}: LibraryThumbnailCardWebProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cfg = TYPE_CONFIG[resolveType(type)]!;
  const Icon = cfg.icon;
  const tintSurface = `${cfg.color}18`;
  const tintBorder = `${cfg.color}33`;

  return (
    <button
      className="sanctuary-card"
      type="button"
      onClick={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={(event) => {
        if (!onLongPress) return;
        event.preventDefault();
        void onLongPress();
      }}
      style={{
        width: '100%',
        minHeight: '248px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(252,249,242,0.96) 100%)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        boxShadow: isHovered
          ? '0 24px 44px rgba(15, 23, 42, 0.12)'
          : '0 10px 24px rgba(15, 23, 42, 0.06)',
        borderColor: isHovered ? tintBorder : 'var(--border)',
      }}
    >
      <div
        style={{
          height: '132px',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: thumbnailUrl
            ? `linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02)), url(${thumbnailUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${tintSurface} 0%, rgba(255,255,255,0.72) 100%)`,
          borderBottom: '1px solid rgba(120, 120, 120, 0.12)',
        }}
      >
        {!thumbnailUrl && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: tintSurface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={24} color={cfg.color} />
            </div>
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              background: 'rgba(252,249,242,0.94)',
              borderRadius: '999px',
              border: `1px solid ${tintBorder}`,
            }}
          >
            <Icon size={12} color={cfg.color} />
            <span
              style={{
                fontSize: '10px',
                fontWeight: '800',
                color: cfg.color,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {cfg.label}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {onBookmarkToggle && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  void onBookmarkToggle();
                }}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.6)',
                  background: 'rgba(252,249,242,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label={has_bookmarked ? 'Remove bookmark' : 'Bookmark resource'}
              >
                <Bookmark
                  size={14}
                  color={has_bookmarked ? '#dd9b28' : '#3d3a36'}
                  fill={has_bookmarked ? '#dd9b28' : 'transparent'}
                />
              </button>
            )}
            {verified ? (
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '999px',
                  background: 'rgba(252,249,242,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BadgeCheck size={16} color="#5a9a7c" />
              </div>
            ) : isLocked ? (
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '999px',
                  background: 'rgba(252,249,242,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={14} color="#6b6b72" />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          padding: '16px 16px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: '700',
              color: cfg.color,
              marginBottom: '4px',
              letterSpacing: '0.02em',
            }}
          >
            {subject || 'General wisdom'}
          </div>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--ink)',
              margin: 0,
              lineHeight: '1.4',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {endorsements > 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 8px',
                borderRadius: '999px',
                background: tintSurface,
              }}
            >
              <ThumbsUp size={12} color="#dd9b28" />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#dd9b28',
                }}
              >
                {endorsements}
              </span>
            </div>
          ) : (
            <div />
          )}
          <div
            style={{
              marginLeft: 'auto',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--ink-ghost)',
            }}
          >
            Open
          </div>
        </div>
      </div>
    </button>
  );
}

export default LibraryThumbnailCard;
