import React from 'react';

const GlobalHeader: React.FC = () => {
    return (
        <header className="p-4 border-b border-gray-800 bg-[#16213e]/40 backdrop-blur-md sticky top-0 z-30">
            <div className="max-w-md mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center font-black text-[#1a1a2e]">G</div>
                    <h1 className="text-lg font-black tracking-tight text-white uppercase">Gurudevi</h1>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
                    <div className="w-full h-full bg-orange-400/20" />
                </div>
            </div>
        </header>
    );
};

export default GlobalHeader;
