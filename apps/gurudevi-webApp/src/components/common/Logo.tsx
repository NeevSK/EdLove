import React from 'react';

const Logo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-12 h-12 text-lg'
    };

    return (
        <div className={`${sizeClasses[size]} bg-orange-400 rounded-lg flex items-center justify-center font-black text-[#1a1a2e] shadow-lg shadow-orange-900/20`}>
            G
        </div>
    );
};

export default Logo;
