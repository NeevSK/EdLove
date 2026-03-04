import React from 'react';

const SanctuaryTitle: React.FC<{ subtitle?: string }> = ({ subtitle }) => {
    return (
        <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight text-white uppercase leading-none">Gurudevi</h1>
            {subtitle && <span className="text-[10px] text-orange-400/80 font-bold uppercase tracking-widest mt-1">{subtitle}</span>}
        </div>
    );
};

export default SanctuaryTitle;
