import React from 'react';
import { ConfigLoader } from './ConfigLoader';
import { TubLoader } from './TubLoader';
import { PanelLeftClose, PanelLeftOpen, Settings2 } from 'lucide-react';

import { useStore } from '../store/useStore';

export const SidePanel: React.FC = () => {
  const { isSidePanelOpen, setSidePanelOpen } = useStore();

  return (
    <div 
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 ease-in-out ${
        isSidePanelOpen ? 'w-96' : 'w-0'
      }`}
    >
      {/* Trigger Tab */}
      <button
        onClick={() => setSidePanelOpen(!isSidePanelOpen)}
        className="absolute left-full top-2 bg-zinc-900 border border-l-0 border-zinc-800 p-2 rounded-r-md text-zinc-400 hover:text-white transition-all duration-300 shadow-lg flex items-center group"
      >
        {isSidePanelOpen ? <PanelLeftClose className="w-5 h-5 shrink-0" /> : <PanelLeftOpen className="w-5 h-5 shrink-0" />}
        {!isSidePanelOpen && (
          <span className="text-xs font-medium flex items-center overflow-hidden transition-all duration-300 max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2 group-hover:gap-1 group-hover:pr-1">
            <Settings2 className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Loaders</span>
          </span>
        )}
      </button>

      {/* Panel Content */}
      <div className="h-full bg-zinc-900 border-r border-zinc-800 shadow-2xl overflow-y-auto overflow-x-hidden">
        <div className={`p-6 space-y-6 transition-opacity duration-300 ${isSidePanelOpen ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2 mb-2 text-zinc-100 font-bold text-lg border-b border-zinc-800 pb-4">
            <Settings2 className="w-5 h-5 text-cyan-500" />
            Data Management
          </div>
          <div className="space-y-6">
            <ConfigLoader />
            <TubLoader />
          </div>
        </div>
      </div>

      {/* Backdrop for mobile or focusing */}
      {isSidePanelOpen && (
        <div 
          className="fixed inset-0 bg-black/20 -z-10 backdrop-blur-[1px]"
          onClick={() => setSidePanelOpen(false)}
        />
      )}
    </div>
  );
};
