import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import GlobalHeader from './components/layout/GlobalHeader';
import BottomTabs from './components/layout/BottomTabs';
import PulseDashboard from './screens/self/PulseDashboard';
import TeacherSelfView from './screens/self/TeacherSelfView';
import ClassroomDashboard from './screens/classroom/ClassroomDashboard';

function App() {
  const [activeTab, setActiveTab] = useState('self');
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'detail'>('dashboard');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'self') {
      setCurrentScreen('dashboard');
    }
  };

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
      case 'classroom':
        return <ClassroomDashboard />;
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
      <GlobalHeader />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-md mx-auto min-h-full">
          {renderTabContent()}
        </div>
      </main>

      <BottomTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default App;
