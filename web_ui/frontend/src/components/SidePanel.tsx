import React from 'react';
import { ConfigLoader } from './ConfigLoader';
import { TubLoader } from './TubLoader';
import { SimulatorConfig } from './SimulatorConfig';
import { PanelLeftClose, PanelLeftOpen, FolderOpen, Plug } from 'lucide-react';

import { useStore } from '../store/useStore';

export const SidePanel: React.FC = () => {
  const { activeDrawer, setActiveDrawer } = useStore();

  const isLoadersOpen = activeDrawer === 'loaders';
  const isConnectorsOpen = activeDrawer === 'connectors';

  const toggleLoaders = () => setActiveDrawer(isLoadersOpen ? null : 'loaders');
  const toggleConnectors = () => setActiveDrawer(isConnectorsOpen ? null : 'connectors');

  const anyOpen = isLoadersOpen || isConnectorsOpen;

  return (
    <>
      {/* Floating Trigger Buttons */}
      <div className="fixed left-0 top-16 z-50 flex flex-col gap-1">
        {/* Loaders Button */}
        <button
          onClick={toggleLoaders}
          className={`bg-zinc-900 border border-l-0 border-zinc-800 p-2 rounded-r-md transition-all duration-300 shadow-lg flex items-center gap-2 group ${
            isLoadersOpen ? 'text-cyan-400 border-cyan-800/60' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {isLoadersOpen ? <PanelLeftClose className="w-5 h-5 shrink-0" /> : <PanelLeftOpen className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-medium whitespace-nowrap">Loaders</span>
        </button>

        {/* Connectors Button */}
        <button
          onClick={toggleConnectors}
          className={`bg-zinc-900 border border-l-0 border-zinc-800 p-2 rounded-r-md transition-all duration-300 shadow-lg flex items-center gap-2 group ${
            isConnectorsOpen ? 'text-cyan-400 border-cyan-800/60' : 'text-zinc-400 hover:text-white'
          }`}
        >
          {isConnectorsOpen ? <PanelLeftClose className="w-5 h-5 shrink-0" /> : <PanelLeftOpen className="w-5 h-5 shrink-0" />}
          <span className="text-xs font-medium whitespace-nowrap">Connectors</span>
        </button>
      </div>

      {/* Loaders Drawer */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 ease-in-out ${
          isLoadersOpen ? 'w-96' : 'w-0'
        }`}
      >
        <div className="h-full bg-zinc-900 border-r border-zinc-800 shadow-2xl overflow-y-auto overflow-x-hidden">
          <div className={`p-6 space-y-6 transition-opacity duration-300 ${isLoadersOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 mb-2 text-zinc-100 font-bold text-lg border-b border-zinc-800 pb-4">
              <FolderOpen className="w-5 h-5 text-cyan-500" />
              Loaders
            </div>
            <div className="space-y-6">
              <ConfigLoader />
              <TubLoader />
            </div>
          </div>
        </div>
      </div>

      {/* Connectors Drawer */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 ease-in-out ${
          isConnectorsOpen ? 'w-96' : 'w-0'
        }`}
      >
        <div className="h-full bg-zinc-900 border-r border-zinc-800 shadow-2xl overflow-y-auto overflow-x-hidden">
          <div className={`p-6 space-y-6 transition-opacity duration-300 ${isConnectorsOpen ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center gap-2 mb-2 text-zinc-100 font-bold text-lg border-b border-zinc-800 pb-4">
              <Plug className="w-5 h-5 text-cyan-500" />
              Connectors
            </div>
            <div className="space-y-6">
              <SimulatorConfig />
            </div>
          </div>
        </div>
      </div>

      {/* Shared Backdrop */}
      {anyOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 backdrop-blur-[1px]"
          onClick={() => setActiveDrawer(null)}
        />
      )}
    </>
  );
};
