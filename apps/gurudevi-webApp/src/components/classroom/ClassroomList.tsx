import React from 'react';
import ClassroomCard from './ClassroomCard';

const MOCK_CLASSROOMS = [
    { id: '1', name: 'Grade 10 - A', studentCount: 32, subject: 'Science & Environment', status: 'active' },
    { id: '2', name: 'Grade 11 - B', studentCount: 28, subject: 'Mathematics', status: 'scheduled' },
    { id: '3', name: 'Grade 10 - C', studentCount: 30, subject: 'History', status: 'finished' },
];

interface ClassroomListProps {
    onSelectClassroom?: (id: string) => void;
}

const ClassroomList: React.FC<ClassroomListProps> = ({ onSelectClassroom }) => {
    return (
        <div className="flex flex-col space-y-4 w-full animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center px-2 mb-2">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Active Classrooms</h3>
                <span className="text-orange-400 text-[10px] font-black uppercase tracking-tighter bg-orange-400/10 px-2 py-0.5 rounded-full">
                    {MOCK_CLASSROOMS.length} Total
                </span>
            </div>

            <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-6 hide-scrollbar">
                {MOCK_CLASSROOMS.map((cls) => (
                    <ClassroomCard
                        key={cls.id}
                        name={cls.name}
                        studentCount={cls.studentCount}
                        subject={cls.subject}
                        status={cls.status as any}
                        onClick={() => onSelectClassroom?.(cls.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export default ClassroomList;
