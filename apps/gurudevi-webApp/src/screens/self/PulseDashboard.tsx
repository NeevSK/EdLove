import React from 'react';
import Greeting from '../../components/self/Greeting';
import DailyResonanceSection from '../../components/self/DailyResonanceSection';
import ActionList from '../../components/self/ActionList';
import { ArrowRight, Heart } from 'lucide-react';

interface PulseDashboardProps {
    onEnterDetails?: () => void;
}

const PulseDashboard: React.FC<PulseDashboardProps> = ({ onEnterDetails }) => {
    return (
        <div className="flex flex-col space-y-8 px-6 pt-6 pb-24 max-w-md mx-auto w-full">
            <Greeting />

            <DailyResonanceSection />

            <ActionList />

            {/* Enter Full Sanctuary Button */}
            <button
                onClick={onEnterDetails}
                className="w-full bg-gradient-to-r from-orange-400 to-orange-600 p-5 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all shadow-xl shadow-orange-900/40"
            >
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                        <Heart className="text-white w-6 h-6 animate-pulse" />
                    </div>
                    <div className="text-left">
                        <span className="block text-white font-black text-lg">Enter Sanctuary</span>
                        <span className="text-orange-100/80 text-xs font-bold uppercase tracking-wider">Your Inner Workbench</span>
                    </div>
                </div>
                <ArrowRight className="text-white w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

export default PulseDashboard;
