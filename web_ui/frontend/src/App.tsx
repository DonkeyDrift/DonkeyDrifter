import React from 'react';
import { Layout } from './components/Layout';
import { ConfigLoader } from './components/ConfigLoader';
import { TubLoader } from './components/TubLoader';
import { TubNavigator } from './components/TubNavigator';
import { TubChart } from './components/TubChart';
import { useStore } from './store/useStore';

function App() {
  const { isLoading, error } = useStore();

  return (
    <Layout>
      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded-md mb-4">
          Error: {error}
        </div>
      )}
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConfigLoader />
        <TubLoader />
      </div>

      <div className="space-y-6">
        <TubNavigator />
        <TubChart />
      </div>
    </Layout>
  );
}

export default App;
