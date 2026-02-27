import React from 'react';
import ProfileAvatar from '../common/ProfileAvatar';

const GlobalHeader: React.FC = () => {
    return (
        <header className="p-4 border-b border-gray-800 bg-[#16213e]/40 backdrop-blur-md sticky top-0 z-30">
            <div className="max-w-md mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center font-black text-[#1a1a2e]">G</div>
                    <h1 className="text-lg font-black tracking-tight text-white uppercase">Gurudevi</h1>
                </div>
                <ProfileAvatar size={32} />
            </div>
        </header>
    );
};

export default GlobalHeader;
