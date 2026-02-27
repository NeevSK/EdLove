import React, { useState } from 'react';
import { MessageCircle, Send, Ghost } from 'lucide-react';

const VentingSpace: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isSent, setIsSent] = useState(false);

    const handleSend = () => {
        if (!message.trim()) return;
        setIsSent(true);
        setTimeout(() => {
            setMessage('');
            setIsSent(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                    <span>Venting Space</span>
                </h3>
                <p className="text-gray-400 text-sm">Speak your truth. This space is anonymous and ephemeral.</p>
            </div>

            <div className="relative group">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Whisper into the void..."
                    className="w-full h-48 bg-blue-900/10 border border-blue-900/20 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all resize-none italic"
                />

                {isSent && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/10 backdrop-blur-sm rounded-2xl animate-out fade-out duration-1000">
                        <div className="flex flex-col items-center space-y-2">
                            <Ghost className="w-12 h-12 text-blue-400 animate-bounce" />
                            <span className="text-blue-400 font-bold">Released...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center px-2">
                <div className="flex items-center space-x-2 text-gray-600 text-[10px] uppercase font-bold tracking-widest">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span>Anonymous Connection Active</span>
                </div>
                <button
                    onClick={handleSend}
                    disabled={!message.trim() || isSent}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-lg shadow-blue-900/40 disabled:opacity-50 transition-all"
                >
                    <span>Voice it</span>
                    <Send className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default VentingSpace;
