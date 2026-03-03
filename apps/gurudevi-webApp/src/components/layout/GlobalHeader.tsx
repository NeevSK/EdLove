import React from 'react';
import ProfileAvatar from '../common/ProfileAvatar';
import Logo from '../common/Logo';
import SanctuaryTitle from '../common/SanctuaryTitle';

const GlobalHeader: React.FC = () => {
    return (
        <header className="p-4 border-b border-gray-800 bg-[#16213e]/40 backdrop-blur-md sticky top-0 z-30">
            <div className="max-w-md mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Logo size="sm" />
                    <SanctuaryTitle subtitle="Teacher Sanctuary" />
                </div>
                <ProfileAvatar size={32} />
            </div>
        </header>
    );
};

export default GlobalHeader;
