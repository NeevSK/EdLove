import React from 'react';
import { Clock } from 'lucide-react';

interface PulseActionItemProps {
    title: string;
    time: string;
    status: 'pending' | 'upcoming' | 'completed';
    onPress?: () => void;
}

const PulseActionItem: React.FC<PulseActionItemProps> = ({
    title,
    time,
    status,
    onPress
}) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'pending':
                return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
            case 'upcoming':
                return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
            case 'completed':
                return 'bg-green-400/10 text-green-400 border-green-400/20';
            default:
                return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
        }
    };

    return (
        <div
            onClick={onPress}
            className={`flex items-center justify-between p-4 bg-[#16213e]/40 backdrop-blur-sm rounded-xl border border-gray-700/30 hover:bg-[#16213e]/60 transition-all cursor-pointer group`}
        >
            <div className="flex flex-col space-y-1">
                <h4 className="text-white font-semibold text-sm group-hover:text-orange-400 transition-colors">
                    {title}
                </h4>
                <div className="flex items-center space-x-1.5 text-gray-400 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{time}</span>
                </div>
            </div>

            <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusStyles()}`}>
                {status}
            </div>
        </div>
    );
};

export default PulseActionItem;
