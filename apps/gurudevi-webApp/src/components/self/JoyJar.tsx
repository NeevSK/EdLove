import React, { useState } from 'react';
import { Sparkles, PlusCircle, Star } from 'lucide-react';

interface JoyMoment {
    id: string;
    text: string;
    timestamp: Date;
}

const JoyJar: React.FC = () => {
    const [moments, setMoments] = useState<JoyMoment[]>([]);
    const [newMoment, setNewMoment] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddMoment = () => {
        if (!newMoment.trim()) return;
        setIsAdding(true);

        // Simulate animation delay
        setTimeout(() => {
            const moment: JoyMoment = {
                id: Math.random().toString(36).substr(2, 9),
                text: newMoment,
                timestamp: new Date(),
            };
            setMoments([moment, ...moments]);
            setNewMoment('');
            setIsAdding(false);
        }, 800);
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                    <span>Joy Jar</span>
                </h3>
                <p className="text-gray-400 text-sm">Capture your small wins and happy moments.</p>
            </div>

            <div className="relative group">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMoment}
                        onChange={(e) => setNewMoment(e.target.value)}
                        disabled={isAdding}
                        placeholder="What brought you joy today?"
                        className="flex-1 bg-black/20 border border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMoment()}
                    />
                    <button
                        onClick={handleAddMoment}
                        disabled={!newMoment || isAdding}
                        className="p-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl shadow-lg shadow-yellow-900/40 disabled:opacity-50 transition-all"
                    >
                        <PlusCircle className={`w-6 h-6 ${isAdding ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 hide-scrollbar">
                {moments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-gray-800 rounded-2xl text-gray-600 space-y-2">
                        <Star className="w-8 h-8 opacity-20" />
                        <p className="text-sm italic">The jar is empty. Add your first spark!</p>
                    </div>
                ) : (
                    moments.map((moment) => (
                        <div
                            key={moment.id}
                            className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 duration-500"
                        >
                            <Star className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                            <div className="flex flex-col space-y-1">
                                <p className="text-white text-sm leading-relaxed">{moment.text}</p>
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                    {moment.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default JoyJar;
