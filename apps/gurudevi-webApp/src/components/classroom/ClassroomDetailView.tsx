import React from 'react';
import SectionHeader from '../common/SectionHeader';
import { Users, BookOpen, Calendar, ArrowLeft } from 'lucide-react';

interface ClassroomDetailViewProps {
    classId: string;
    onBack: () => void;
}

const ClassroomDetailView: React.FC<ClassroomDetailViewProps> = ({ classId, onBack }) => {
    // In a real app, we'd fetch data based on classId
    const className = "Grade 10 - A";

    return (
        <div className="flex flex-col space-y-6 animate-in slide-in-from-right duration-700">
            <button
                onClick={onBack}
                className="flex items-center space-x-2 text-orange-400 text-sm font-bold active:scale-95 transition-all mb-2"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to List</span>
            </button>

            <SectionHeader
                title={className}
                subtitle={`Classroom Overview & Insights • ID: ${classId}`}
                icon={BookOpen}
            />

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-[#16213e]/40 backdrop-blur-md border border-gray-700/30 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-400/10 rounded-2xl">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h5 className="text-white font-bold">Student Roster</h5>
                            <p className="text-gray-500 text-xs">32 active students</p>
                        </div>
                    </div>
                    <button className="text-orange-400 text-xs font-black uppercase tracking-tighter hover:underline">Manage</button>
                </div>

                <div className="bg-[#16213e]/40 backdrop-blur-md border border-gray-700/30 rounded-3xl p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-purple-400/10 rounded-2xl">
                            <Calendar className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h5 className="text-white font-bold">Lesson Schedule</h5>
                            <p className="text-gray-500 text-xs">Next: Physics at 10:00 AM</p>
                        </div>
                    </div>
                    <button className="text-orange-400 text-xs font-black uppercase tracking-tighter hover:underline">View</button>
                </div>
            </div>

            <div className="pt-4">
                <h4 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 px-2">Recent Activity</h4>
                <div className="bg-[#16213e]/20 border border-gray-700/20 rounded-3xl p-8 text-center italic text-gray-600 text-sm">
                    No recent activity to display for this classroom.
                </div>
            </div>
        </div>
    );
};

export default ClassroomDetailView;
