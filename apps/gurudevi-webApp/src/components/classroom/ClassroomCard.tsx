import React from 'react';
import { Users, ArrowRight, BookOpen } from 'lucide-react';

interface ClassroomCardProps {
    name: string;
    studentCount: number;
    subject?: string;
    status: 'active' | 'scheduled' | 'finished';
    onClick?: () => void;
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({
    name,
    studentCount,
    subject = "General Education",
    status,
    onClick
}) => {
    const statusColors = {
        active: 'text-green-400 bg-green-400/10',
        scheduled: 'text-blue-400 bg-blue-400/10',
        finished: 'text-gray-400 bg-gray-400/10'
    };

    return (
        <button
            onClick={onClick}
            className="w-full bg-[#16213e]/60 backdrop-blur-md border border-gray-700/50 rounded-3xl p-5 flex flex-col space-y-4 hover:border-orange-400/30 transition-all group active:scale-[0.98]"
        >
            <div className="flex justify-between items-start w-full">
                <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-400/10 rounded-2xl group-hover:bg-orange-400/20 transition-colors">
                        <BookOpen className="w-6 h-6 text-orange-400" />
                    </div>
                    <div className="text-left">
                        <h4 className="text-white font-bold text-lg leading-tight">{name}</h4>
                        <span className="text-gray-400 text-xs font-medium">{subject}</span>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[status]}`}>
                    {status}
                </div>
            </div>

            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400 text-sm font-bold">{studentCount} Students</span>
                    </div>
                </div>
                <div className="flex items-center space-x-1 text-orange-400 text-xs font-black uppercase tracking-tighter group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
};

export default ClassroomCard;
