import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, School, Layout } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white flex flex-col items-center justify-center p-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2 text-orange-400">Gurudevi webApp</h1>
        <p className="text-gray-400">Teacher & Student Sanctuary PWA</p>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <div className="bg-[#16213e] p-6 rounded-xl border border-gray-700 hover:border-orange-400 transition-colors cursor-pointer group">
          <Home className="w-12 h-12 mb-4 text-orange-400 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-semibold mb-2">My Sanctuary</h2>
          <p className="text-sm text-gray-400">Personal space for reflection and growth.</p>
        </div>

        <div className="bg-[#16213e] p-6 rounded-xl border border-gray-700 hover:border-orange-400 transition-colors cursor-pointer group">
          <School className="w-12 h-12 mb-4 text-orange-400 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-semibold mb-2">Classroom</h2>
          <p className="text-sm text-gray-400">Manage your students and lessons.</p>
        </div>

        <div className="bg-[#16213e] p-6 rounded-xl border border-gray-700 hover:border-orange-400 transition-colors cursor-pointer group">
          <Layout className="w-12 h-12 mb-4 text-orange-400 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-semibold mb-2">Library</h2>
          <p className="text-sm text-gray-400">Access and share educational resources.</p>
        </div>
      </main>

      <footer className="mt-12 text-sm text-gray-500">
        &copy; 2026 Gurudevi Ecosystem • Powered by Monorepo
      </footer>
    </div>
  );
}

export default App;
