import React from 'react';
import Greeting from '../../components/self/Greeting';
import DailyResonanceCard from '../../components/self/DailyResonanceCard';
import PulseActionItem from '../../components/self/PulseActionItem';
import { Sparkles, BookOpen, Calendar } from 'lucide-react';

interface PulseDashboardProps {
    onEnterDetails?: () => void;
}

const PulseDashboard: React.FC<PulseDashboardProps> = ({ onEnterDetails }) => {
    return (
        <div className="flex-1 flex flex-col space-y-6 px-4 pt-8 pb-24 max-w-2xl mx-auto w-full">
            <Greeting />

            <div className="space-y-6 flex flex-col">
                <DailyResonanceCard
                    title="Daily Spark"
                    content="May your day be filled with peace and resonance."
                    author="Sanctuary"
                    icon={Sparkles}
                    type="motivation"
                />

                <DailyResonanceCard
                    title="Seed of Wisdom"
                    content="Every student brings a unique harmony to the classroom."
                    icon={BookOpen}
                    type="wisdom"
                />

                <div className="bg-[#16213e]/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-white font-bold text-lg">Today's Pulse</h3>
                        <Calendar className="w-5 h-5 text-orange-400" />
                    </div>

                    <div className="space-y-3">
                        <PulseActionItem
                            title="Mark Morning Attendance"
                            time="Before 9:00 AM"
                            status="pending"
                        />
                        <PulseActionItem
                            title="Grade Science Assignment"
                            time="By End of Day"
                            status="upcoming"
                        />
                    </div>
                </div>
            </div>

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
