import React from 'react';
import { Users, CheckCircle, TrendingUp } from 'lucide-react';

const ClassroomStats: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4 w-full animate-in fade-in duration-1000">
            <div className="bg-[#16213e]/40 backdrop-blur-md border border-gray-700/30 rounded-3xl p-5 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <div className="p-2 bg-orange-400/10 rounded-xl">
                        <Users className="w-5 h-5 text-orange-400" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                    <span className="text-2xl font-black text-white">124</span>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Students</p>
                </div>
            </div>

            <div className="bg-[#16213e]/40 backdrop-blur-md border border-gray-700/30 rounded-3xl p-5 flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <div className="p-2 bg-green-400/10 rounded-xl">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <span className="text-[10px] font-black text-green-400">+5%</span>
                </div>
                <div>
                    <span className="text-2xl font-black text-white">92%</span>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Avg Attendance</p>
                </div>
            </div>
        </div>
    );
};

export default ClassroomStats;
