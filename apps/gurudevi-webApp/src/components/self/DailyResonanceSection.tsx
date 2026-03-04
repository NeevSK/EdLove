import React from 'react';
import DailyResonanceCard from './DailyResonanceCard';
import { Sparkles, Lightbulb } from 'lucide-react';

const DailyResonanceSection: React.FC = () => {
    return (
        <div className="grid grid-cols-1 gap-4">
            <DailyResonanceCard
                type="motivation"
                title="Daily Spark"
                content="Your presence is the most powerful lesson you offer your students."
                icon={Sparkles}
            />
            <DailyResonanceCard
                type="wisdom"
                title="Seed of Wisdom"
                content="True teaching is the art of being, not just doing."
                author="Ancient Proverb"
                icon={Lightbulb}
            />
        </div>
    );
};

export default DailyResonanceSection;
