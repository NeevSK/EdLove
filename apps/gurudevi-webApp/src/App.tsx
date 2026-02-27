import React, { useState } from 'react';
import { Heart, GraduationCap, Library, Users } from 'lucide-react';
import PulseDashboard from './screens/self/PulseDashboard';
import TeacherSelfView from './screens/self/TeacherSelfView';

function App() {
  const [activeTab, setActiveTab] = useState('self');
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'detail'>('dashboard');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'self':
        return currentScreen === 'dashboard' ? (
          <PulseDashboard onEnterDetails={() => setCurrentScreen('detail')} />
        ) : (
          <div className="flex flex-col h-full w-full">
            <button
              onClick={() => setCurrentScreen('dashboard')}
              className="px-4 py-3 text-orange-400 text-sm font-bold flex items-center space-x-1 sticky top-0 bg-[#1a1a2e]/80 backdrop-blur-md z-20"
            >
              <span>← Back to Daily Pulse</span>
            </button>
            <TeacherSelfView />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 pt-12">
            <GraduationCap className="w-16 h-16 opacity-20 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2 capitalize">{activeTab} Coming Soon</h2>
            <p className="text-sm px-8 text-center">This feature is being tailored for your web sanctuary.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="p-4 border-b border-gray-800 bg-[#16213e]/40 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center font-black text-[#1a1a2e]">G</div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">Gurudevi</h1>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 overflow-hidden">
            <div className="w-full h-full bg-orange-400/20" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto min-h-full">
          {renderTabContent()}
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-[#16213e]/80 backdrop-blur-lg z-40">
        <div className="max-w-md mx-auto grid grid-cols-4 h-20">
          <button
            onClick={() => { setActiveTab('self'); setCurrentScreen('dashboard'); }}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'self' ? 'text-orange-400' : 'text-gray-500'}`}
          >
            <Heart className={`w-6 h-6 ${activeTab === 'self' ? 'fill-orange-400' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Self</span>
          </button>

          <button
            onClick={() => setActiveTab('classroom')}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'classroom' ? 'text-orange-400' : 'text-gray-500'}`}
          >
            <GraduationCap className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Classroom</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'library' ? 'text-orange-400' : 'text-gray-500'}`}
          >
            <Library className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Library</span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={`flex flex-col items-center justify-center space-y-1 ${activeTab === 'community' ? 'text-orange-400' : 'text-gray-500'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Community</span>
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;
