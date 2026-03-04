import React from 'react';

interface ProfileAvatarProps {
    size?: number;
    className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ size = 32, className = "" }) => {
    return (
        <div
            className={`rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border border-orange-400/50 overflow-hidden shadow-lg shadow-orange-900/20 active:scale-95 transition-transform ${className}`}
            style={{ width: size, height: size }}
        >
            <div className="w-full h-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-black text-xs">P</span>
            </div>
        </div>
    );
};

export default ProfileAvatar;
