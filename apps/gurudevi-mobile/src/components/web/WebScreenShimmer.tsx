import React from 'react';
import WebSkeleton from './WebSkeleton';

//  Generic page shimmer 
export default function WebScreenShimmer({ variant = 'cards' }: { variant?: 'cards' | 'list' | 'profile' | 'full' }) {
    return (
        <div className="wsm-root" role="status" aria-busy="true" aria-label="Loading&"
            {/* Section heading */}
            <div className="wsm-intro"
                <WebSkeleton width="80px" height="14px" borderRadius="4px" style={{ marginBottom: '12px' }} /
                <WebSkeleton width="40%" height="48px" borderRadius="12px" style={{ marginBottom: '16px' }} /
                <WebSkeleton width="60%" height="18px" borderRadius="6px" style={{ marginBottom: '48px' }} /
            </div

            {variant === 'cards' && <CardsShimmer />}
            {variant === 'list' && <ListShimmer />}
            {variant === 'profile' && <ProfileShimmer />}
            {variant === 'full' && <FullShimmer />}

            <style>{CSS}</style
        </div
    );
}

//  Card grid shimmer (Library, Community, Self dashboard) 
function CardsShimmer() {
    return (
        <
            {/* Search / filter bar */}
            <div className="wsm-search-bar" style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}
                <WebSkeleton height="48px" borderRadius="16px" style={{ flex: 1 }} /
                <WebSkeleton width="140px" height="48px" borderRadius="16px" /
            </div
            {/* Card grid */}
            <div className="wsm-grid"
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="wsm-card" style={{ animationDelay: `${i * 100}ms` }}
                        <WebSkeleton height="240px" borderRadius="16px 16px 0 0" /
                        <div className="wsm-card-body" style={{ padding: '24px' }}
                            <WebSkeleton height="20px" width="70%" borderRadius="6px" style={{ marginBottom: '12px' }} /
                            <WebSkeleton height="14px" width="90%" borderRadius="4px" style={{ marginBottom: '8px' }} /
                            <WebSkeleton height="14px" width="40%" borderRadius="4px" /
                        </div
                    </div
                ))}
            </div
        </
    );
}

//  List shimmer (Notifications, Settings, Classroom list) 
function ListShimmer() {
    return (
        <div className="wsm-list"
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="wsm-list-item" style={{ animationDelay: `${i * 80}ms` }}
                    <WebSkeleton variant="circle" width="48px" style={{ flexShrink: 0 }} /
                    <div style={{ flex: 1, marginLeft: '20px' }}
                        <WebSkeleton height="16px" width="40%" borderRadius="4px" style={{ marginBottom: '8px' }} /
                        <WebSkeleton height="12px" width="70%" borderRadius="4px" /
                    </div
                    <WebSkeleton width="80px" height="32px" borderRadius="10px" /
                </div
            ))}
        </div
    );
}

//  Profile shimmer 
function ProfileShimmer() {
    return (
        <div className="wsm-profile"
            <div className="wsm-profile-header"
                <WebSkeleton variant="circle" width="120px" style={{ marginBottom: '24px' }} /
                <WebSkeleton height="32px" width="220px" borderRadius="10px" style={{ marginBottom: '12px' }} /
                <WebSkeleton height="16px" width="160px" borderRadius="6px" /
            </div
            <div className="wsm-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '900px', margin: '48px auto 0' }}
                <WebSkeleton height="300px" borderRadius="24px" /
            </div
        </div
    );
}

//  Full-page shimmer (initial app shell load) 
function FullShimmer() {
    return (
        <div className="wsm-full"
            <WebSkeleton height="240px" borderRadius="24px" style={{ marginBottom: '32px' }} /
            <div className="wsm-grid"
                {[200, 200, 200].map((h, i) => (
                    <WebSkeleton key={i} height={`${h}px`} borderRadius="20px" /
                ))}
            </div
        </div
    );
}

//  CSS 
const CSS = `
.wsm-root {
    padding: 40px 48px 60px 48px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.wsm-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
    gap: 32px;
}

.wsm-card, .wsm-list-item, .wsm-intro, .wsm-profile-header, .wsm-full {
    animation: wsmFadeInDown 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes wsmFadeInDown {
    from { 
        opacity: 0; 
        transform: translateY(20px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

.wsm-card {
    border-radius: 20px;
    background: var(--card-bg, rgba(255,255,255,0.4));
    backdrop-filter: blur(10px);
    border: 1px solid var(--border, rgba(42,35,24,0.1));
    overflow: hidden;
}

.wsm-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
}

.wsm-list-item {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 18px;
    background: var(--card-bg, rgba(255,255,255,0.3));
    border: 1px solid var(--border, rgba(42,35,24,0.08));
}

.wsm-profile-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40px 0;
}

@media (max-width: 1024px) {
    .wsm-root { padding: 32px 24px; }
    .wsm-grid { grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr)); }
}
@media (max-width: 768px) {
    .wsm-root { padding: 20px 16px 100px 16px; }
    .wsm-intro { margin-bottom: 24px; }
}
`;

//  Named helpers exported for direct use 
export function StackFallback({ variant }: { variant?: 'cards' | 'list' | 'profile' | 'full' }) {
    return <WebScreenShimmer variant={variant ?? 'cards'} />;
}
