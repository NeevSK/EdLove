import React from 'react';
import { Heart, GraduationCap, Library, Users } from 'lucide-react';
import ThemedIcon from '../common/ThemedIcon';

interface BottomTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-[#16213e]/80 backdrop-blur-lg z-40">
            <div className="max-w-md mx-auto grid grid-cols-4 h-20">
                <button
                    onClick={() => onTabChange('self')}
                    className={`flex flex-col items-center justify-center space-y-1 transition-all ${activeTab === 'self' ? 'text-orange-400' : 'text-gray-500'}`}
                >
                    <ThemedIcon icon={Heart} active={activeTab === 'self'} size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Self</span>
                </button>

                <button
                    onClick={() => onTabChange('classroom')}
                    className={`flex flex-col items-center justify-center space-y-1 transition-all ${activeTab === 'classroom' ? 'text-orange-400' : 'text-gray-500'}`}
                >
                    <ThemedIcon icon={GraduationCap} active={activeTab === 'classroom'} size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Classroom</span>
                </button>

                <button
                    onClick={() => onTabChange('library')}
                    className={`flex flex-col items-center justify-center space-y-1 transition-all ${activeTab === 'library' ? 'text-orange-400' : 'text-gray-500'}`}
                >
                    <ThemedIcon icon={Library} active={activeTab === 'library'} size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Library</span>
                </button>

                <button
                    onClick={() => onTabChange('community')}
                    className={`flex flex-col items-center justify-center space-y-1 transition-all ${activeTab === 'community' ? 'text-orange-400' : 'text-gray-500'}`}
                >
                    <ThemedIcon icon={Users} active={activeTab === 'community'} size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Community</span>
                </button>
            </div>
        </footer>
    );
};

export default BottomTabs;
