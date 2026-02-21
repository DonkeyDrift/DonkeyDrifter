import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <div className="font-bold text-xl mr-8">Donkey Car</div>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="#" className="transition-colors hover:text-cyan-400 text-cyan-500">Tub Manager</a>
            <a href="#" className="transition-colors hover:text-cyan-400 text-zinc-400">Trainer</a>
            <a href="#" className="transition-colors hover:text-cyan-400 text-zinc-400">Pilot Arena</a>
            <a href="#" className="transition-colors hover:text-cyan-400 text-zinc-400">Car Connector</a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 space-y-6">
        {children}
      </main>
      <footer className="border-t border-zinc-800 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-zinc-500">
          Donkey Car Web UI
        </div>
      </footer>
    </div>
  );
};
