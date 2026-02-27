import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
    id: string;
    icon: LucideIcon;
    category: string;
}

interface FeatureCarouselProps {
    features: Feature[];
    activeFeature: string;
    onSelectFeature: (id: string) => void;
    showMoreTools: boolean;
    onToggleMoreTools: () => void;
}

const FeatureCarousel: React.FC<FeatureCarouselProps> = ({
    features,
    activeFeature,
    onSelectFeature,
    showMoreTools,
    onToggleMoreTools
}) => {
    return (
        <div className="flex overflow-x-auto pb-4 hide-scrollbar space-x-3 snap-x">
            {features.map((feature) => (
                <button
                    key={feature.id}
                    onClick={() => onSelectFeature(feature.id)}
                    className={`flex-shrink-0 w-24 h-20 rounded-2xl border transition-all flex flex-col items-center justify-center space-y-1.5 snap-center ${activeFeature === feature.id
                        ? 'bg-orange-400 border-orange-400 text-white shadow-lg shadow-orange-400/20'
                        : 'bg-[#16213e]/40 border-gray-700/30 text-gray-400 hover:border-orange-400/50'
                        }`}
                >
                    <feature.icon className={`w-6 h-6 ${activeFeature === feature.id ? 'text-white' : 'text-gray-400'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tight truncate w-full px-1">
                        {feature.id.replace(/([A-Z])/g, ' $1')}
                    </span>
                </button>
            ))}

            {/* More Tools Toggle */}
            <button
                onClick={onToggleMoreTools}
                className={`flex-shrink-0 w-24 h-20 rounded-2xl border border-dashed transition-all flex flex-col items-center justify-center space-y-1 snap-center ${showMoreTools
                    ? 'bg-orange-400 border-orange-400 text-white'
                    : 'bg-[#16213e]/20 border-gray-700/50 text-gray-400 hover:border-orange-400/50'
                    }`}
            >
                <span className="text-xl font-bold">{showMoreTools ? '−' : '+'}</span>
                <span className="text-[10px] font-bold uppercase tracking-tight">
                    {showMoreTools ? 'Less' : 'More'}
                </span>
            </button>
        </div>
    );
};

export default FeatureCarousel;
