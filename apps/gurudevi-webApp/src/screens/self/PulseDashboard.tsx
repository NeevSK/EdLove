import React from 'react';
import Greeting from '../../components/self/Greeting';
import DailyResonanceCard from '../../components/self/DailyResonanceCard';
import { Sparkles, BookOpen } from 'lucide-react';

interface PulseDashboardProps {
    onEnterDetails?: () => void;
}

const PulseDashboard: React.FC<PulseDashboardProps> = ({ onEnterDetails }) => {
    return (
        <div className="flex-1 flex flex-col space-y-6 px-4 pt-8 pb-24 max-w-2xl mx-auto w-full">
            <Greeting />

            {/* Additional sections will be added incrementally */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={onEnterDetails}
                    className="text-orange-400 font-bold hover:underline"
                >
                    Enter Full Sanctuary →
                </button>
            </div>
        </div>
    );
};

export default PulseDashboard;
