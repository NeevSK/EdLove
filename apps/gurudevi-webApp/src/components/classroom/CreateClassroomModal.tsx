import React, { useState } from 'react';
import { X, GraduationCap, Users, BookOpen, Plus } from 'lucide-react';

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { name: string; subject: string; studentCount: number }) => void;
}

const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [studentCount, setStudentCount] = useState(30);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreate({ name, subject, studentCount });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#16213e] border border-gray-700/50 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500">
                <div className="p-6 border-b border-gray-700/30 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-orange-400/10 rounded-xl">
                            <Plus className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Create Classroom</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Class Name</label>
                            <div className="relative">
                                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Grade 10 - A"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Subject</label>
                            <div className="relative">
                                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    required
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g. Mathematics"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-1">Estimated Students</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                                <input
                                    type="number"
                                    value={studentCount}
                                    onChange={(e) => setStudentCount(parseInt(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-orange-400 to-orange-600 py-5 rounded-2xl font-black uppercase tracking-widest text-white shadow-xl shadow-orange-900/40 active:scale-[0.98] transition-all mt-4"
                    >
                        Initialize Classroom
                    </button>
                </form>
            </div>
        </div>
    );
};

// Helper internal component since Plus is not imported from lucide-react in this snippet scope but I know it's needed
const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
);

export default CreateClassroomModal;
