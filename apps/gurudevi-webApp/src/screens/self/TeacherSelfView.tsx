import React, { useState } from 'react';
import FeatureCarousel from '../../components/self/FeatureCarousel';
import MoodLotus from '../../components/self/MoodLotus';
import FireJournal from '../../components/self/FireJournal';
import DailyRhythm from '../../components/self/DailyRhythm';
import JoyJar from '../../components/self/JoyJar';
import GratitudeGlimmers from '../../components/self/GratitudeGlimmers';
import WisdomSeeds from '../../components/self/WisdomSeeds';
import TomorrowPrep from '../../components/self/TomorrowPrep';
import EnergyForecast from '../../components/self/EnergyForecast';
import WindDown from '../../components/self/WindDown';
import VentingSpace from '../../components/self/VentingSpace';
import SanctuaryIntroduction from '../../components/self/SanctuaryIntroduction';
import { Flower, Flame, Repeat, Sparkles, Heart, Lightbulb, Calendar, Battery, Moon, MessageCircle } from 'lucide-react';

const CORE_FEATURES = [
    { id: 'mood', icon: Flower, category: 'core' },
    { id: 'fire', icon: Flame, category: 'core' },
    { id: 'rhythm', icon: Repeat, category: 'core' },
];

const MORE_TOOLS_FEATURES = [
    { id: 'joyJar', icon: Sparkles, category: 'discover' },
    { id: 'gratitude', icon: Heart, category: 'discover' },
    { id: 'wisdom', icon: Lightbulb, category: 'discover' },
    { id: 'tomorrowPrep', icon: Calendar, category: 'discover' },
    { id: 'energyForecast', icon: Battery, category: 'contextual' },
    { id: 'windDown', icon: Moon, category: 'contextual' },
    { id: 'venting', icon: MessageCircle, category: 'discover' },
];

const TeacherSelfView: React.FC = () => {
    const [activeFeature, setActiveFeature] = useState('mood');
    const [showMoreTools, setShowMoreTools] = useState(false);

    const allFeatures = showMoreTools ? [...CORE_FEATURES, ...MORE_TOOLS_FEATURES] : CORE_FEATURES;

    const renderFeature = () => {
        switch (activeFeature) {
            case 'mood':
                return <MoodLotus />;
            case 'fire':
                return <FireJournal />;
            case 'rhythm':
                return <DailyRhythm />;
            case 'joyJar':
                return <JoyJar />;
            case 'gratitude':
                return <GratitudeGlimmers />;
            case 'wisdom':
                return <WisdomSeeds />;
            case 'tomorrowPrep':
                return <TomorrowPrep />;
            case 'energyForecast':
                return <EnergyForecast />;
            case 'windDown':
                return <WindDown />;
            case 'venting':
                return <VentingSpace />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400 italic">
                        {activeFeature.charAt(0).toUpperCase() + activeFeature.slice(1)} Feature Coming Soon...
                    </div>
                );
        }
    };

    return (
        <div className="flex-1 flex flex-col space-y-6 px-4 pt-6 pb-24 max-w-2xl mx-auto w-full">
            <SanctuaryIntroduction />
            <div className="flex flex-col space-y-4">
                {/* Feature selection */}
                <FeatureCarousel
                    features={allFeatures}
                    activeFeature={activeFeature}
                    onSelectFeature={setActiveFeature}
                    showMoreTools={showMoreTools}
                    onToggleMoreTools={() => setShowMoreTools(!showMoreTools)}
                />

                {/* Dynamic Content Workbench */}
                <div className="bg-[#16213e]/60 backdrop-blur-md rounded-3xl p-8 border border-gray-700/50 shadow-2xl min-h-[400px]">
                    {renderFeature()}
                </div>
            </div>
        </div>
    );
};

export default TeacherSelfView;
