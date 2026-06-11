'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PredictionResultPopup from './PredictionResultPopup';
import SplashScreen from './SplashScreen';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 stadium-bg">
      {/* Splash screen on initial load */}
      <SplashScreen />

      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />


      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar navigation */}
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable page container */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global result notification popup */}
      <PredictionResultPopup />
    </div>
  );
}
