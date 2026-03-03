import React, { useState } from 'react';
import { Flame } from 'lucide-react';
import SectionHeader from '../common/SectionHeader';

const FireJournal: React.FC = () => {
    const [thought, setThought] = useState('');
    const [isBurning, setIsBurning] = useState(false);

    const handleBurn = () => {
        if (!thought.trim()) return;
        setIsBurning(true);
        setTimeout(() => {
            setThought('');
            setIsBurning(false);
        }, 2000);
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <SectionHeader
                title="Fire Journal"
                subtitle="Write down your internal noise and let it go into the flames."
                icon={Flame}
                iconColor="text-red-500"
            />

            <div className="relative group">
                <textarea
                    value={thought}
                    onChange={(e) => setThought(e.target.value)}
                    placeholder="What is weighing on your heart today?"
                    className="w-full h-48 bg-red-900/10 border border-red-900/20 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 transition-all resize-none italic"
                />

                {isBurning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl animate-out fade-out duration-2000">
                        <div className="flex flex-col items-center space-y-2">
                            <Flame className="w-12 h-12 text-red-500 animate-bounce" />
                            <span className="text-red-500 font-bold uppercase tracking-tighter">Ashes to Peace...</span>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={handleBurn}
                disabled={!thought.trim() || isBurning}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-red-900/40 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                Surrender to Fire
            </button>
        </div>
    );
};

export default FireJournal;
