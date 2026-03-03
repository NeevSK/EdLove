import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface DailyResonanceCardProps {
    title: string;
    content: string;
    author?: string;
    icon: LucideIcon;
    type: 'motivation' | 'wisdom';
}

const DailyResonanceCard: React.FC<DailyResonanceCardProps> = ({
    title,
    content,
    author,
    icon: Icon,
    type
}) => {
    return (
        <div
            data-type={type}
            className="bg-[#16213e]/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-1000"
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-orange-400 font-bold uppercase tracking-wider text-xs">
                    {title}
                </h3>
                <Icon className="w-5 h-5 text-orange-400 opacity-80" />
            </div>

            <p className="text-lg text-white font-medium leading-relaxed mb-4 italic">
                "{content}"
            </p>

            {author && (
                <p className="text-right text-gray-400 text-sm font-medium">— {author}</p>
            )}
        </div>
    );
};

export default DailyResonanceCard;
