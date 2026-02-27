import React, { useState } from 'react';
import { Battery, BatteryLow, BatteryMedium, BatteryFull, Zap } from 'lucide-react';

const EnergyForecast: React.FC = () => {
    const [energy, setEnergy] = useState<number>(70);

    const getBatteryIcon = () => {
        if (energy < 30) return <BatteryLow className="w-12 h-12 text-red-500" />;
        if (energy < 70) return <BatteryMedium className="w-12 h-12 text-yellow-500" />;
        return <BatteryFull className="w-12 h-12 text-green-500" />;
    };

    const getEnergyStatus = () => {
        if (energy < 30) return { label: 'Burnout Warning', color: 'text-red-500' };
        if (energy < 70) return { label: 'Steady Pace', color: 'text-yellow-500' };
        return { label: 'High Resonance', color: 'text-green-500' };
    };

    return (
        <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center justify-center space-x-2">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <span>Energy Forecast</span>
                </h3>
                <p className="text-gray-400 text-sm">Listen to your inner battery. Adjust your rhythm.</p>
            </div>

            <div className="relative flex flex-col items-center space-y-4">
                <div className="relative">
                    {getBatteryIcon()}
                    <div className="absolute -top-1 -right-1">
                        <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
                    </div>
                </div>

                <div className="text-center">
                    <span className={`text-2xl font-black ${getEnergyStatus().color}`}>{energy}%</span>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{getEnergyStatus().label}</p>
                </div>
            </div>

            <div className="w-full space-y-4">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 font-bold uppercase">
                    <span>Depleted</span>
                    <span>Balanced</span>
                    <span>Radiant</span>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
                <p className="text-gray-400 text-xs text-center leading-relaxed">
                    {energy < 30
                        ? "Your light is dim. It's time to retreat and recharge. Prioritize rest today."
                        : energy < 70
                            ? "You have steady energy. Maintain your rhythm but don't overextend."
                            : "You are radiant! Perfect time for creative work and deep engagement."}
                </p>
            </div>
        </div>
    );
};

export default EnergyForecast;
