import React, { useState } from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import { GraduationCap, Users, Plus } from 'lucide-react';
import ClassroomList from '../../components/classroom/ClassroomList';
import ClassroomStats from '../../components/classroom/ClassroomStats';
import ClassroomDetailView from '../../components/classroom/ClassroomDetailView';
import CreateClassroomModal from '../../components/classroom/CreateClassroomModal';

const ClassroomDashboard: React.FC = () => {
    // Mocking the check for classrooms
    const hasClassrooms = true;
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleSelectClassroom = (id: string) => {
        setSelectedClassId(id);
        setView('detail');
    };

    return (
        <div className="flex flex-col space-y-8 px-6 pt-6 pb-24 max-w-md mx-auto w-full animate-in fade-in duration-700">
            <SectionHeader
                title="Classroom"
                subtitle="Manage your learning spaces and students."
                icon={GraduationCap}
            />

            <ClassroomStats />

            <div className="flex justify-between items-center px-2">
                <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Workbench</h4>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="p-2 bg-orange-400/10 rounded-xl text-orange-400 active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {view === 'list' ? (
                hasClassrooms ? (
                    <ClassroomList onSelectClassroom={handleSelectClassroom} />
                ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                        <div className="w-24 h-24 bg-orange-400/10 rounded-full flex items-center justify-center">
                            <Users className="w-10 h-10 text-orange-400/40" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-white">No Classrooms Yet</h3>
                            <p className="text-gray-400 text-sm max-w-[240px]">Create your first classroom to start your journey.</p>
                        </div>

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-orange-600 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-orange-900/40 active:scale-95 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Class</span>
                        </button>
                    </div>
                )
            ) : (
                <ClassroomDetailView
                    classId={selectedClassId || ''}
                    onBack={() => setView('list')}
                />
            )}

            <CreateClassroomModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={(data) => {
                    console.log('Creating classroom:', data);
                    // Add creation logic here
                }}
            />
        </div>
    );
};

export default ClassroomDashboard;
