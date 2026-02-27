import React, { useState } from 'react';
import { Flower } from 'lucide-react';

const MOODS = [
    { id: 'joy', color: 'bg-yellow-400', label: 'Joyful' },
    { id: 'peace', color: 'bg-green-400', label: 'Peaceful' },
    { id: 'energy', color: 'bg-orange-400', label: 'Energetic' },
    { id: 'calm', color: 'bg-blue-400', label: 'Calm' },
    { id: 'tired', color: 'bg-purple-400', label: 'Tired' },
    { id: 'stressed', color: 'bg-red-400', label: 'Stressed' },
];

interface MoodLotusProps {
    userId?: string;
}

const MoodLotus: React.FC<MoodLotusProps> = ({ userId }) => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const handleMoodSelect = (moodId: string) => {
        setSelectedMood(moodId);
        // In a real app, we would save this to Supabase here
        console.log(`Mood selected for user ${userId}: ${moodId}`);
    };

    return (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">How is your spirit today?</h3>
                <p className="text-gray-400 text-sm">Select the petal that resonates with you.</p>
            </div>

            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Central Core */}
                <div className="absolute z-10 w-16 h-16 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center shadow-2xl">
                    <Flower className={`w-8 h-8 ${selectedMood ? 'text-orange-400' : 'text-gray-500'} transition-colors duration-500`} />
                </div>

                {/* Petals */}
                {MOODS.map((mood, index) => {
                    const angle = (index * 360) / MOODS.length;
                    const isSelected = selectedMood === mood.id;

                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleMoodSelect(mood.id)}
                            className="absolute group"
                            style={{
                                transform: `rotate(${angle}deg) translateY(-80px)`,
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div
                                className={`w-12 h-20 rounded-full transition-all duration-500 border-2 ${isSelected
                                        ? `${mood.color} border-white scale-125 shadow-[0_0_20px_rgba(255,255,255,0.4)]`
                                        : `bg-white/5 border-white/10 group-hover:bg-white/10 group-hover:scale-110`
                                    }`}
                                style={{ transform: `rotate(${-angle}deg)` }}
                            >
                                <div className={`w-full h-full flex items-center justify-center ${isSelected ? 'text-white' : 'text-transparent group-hover:text-gray-400'} text-[8px] font-bold uppercase`}>
                                    {mood.label.substring(0, 3)}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {selectedMood && (
                <div className="text-center animate-in fade-in slide-in-from-top-4">
                    <p className="text-orange-400 font-bold text-lg capitalize">{selectedMood}</p>
                    <p className="text-gray-500 text-xs">Selection recorded in your sanctuary.</p>
                </div>
            )}
        </div>
    );
};

export default MoodLotus;
