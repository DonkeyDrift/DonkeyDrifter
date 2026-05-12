import React, { useRef, useEffect } from 'react';
import { TrainingJob } from '../../store/useStore';

interface LogPanelProps {
  job: TrainingJob | null;
}

const MAX_VISIBLE_LOGS = 500;

export const LogPanel: React.FC<LogPanelProps> = ({ job }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const logs = job?.logs ?? [];
  const visibleLogs = logs.length > MAX_VISIBLE_LOGS
    ? logs.slice(logs.length - MAX_VISIBLE_LOGS)
    : logs;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLogs.length]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-96">
      <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-300">Training Log</span>
        <span className="text-xs text-zinc-600">{logs.length} lines</span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-0.5"
      >
        {visibleLogs.length === 0 && (
          <div className="text-zinc-600 italic">Logs will appear here when training starts...</div>
        )}
        {visibleLogs.map((line, idx) => (
          <div key={idx} className="text-zinc-300 break-all">
            {line}
          </div>
        ))}
        {logs.length > MAX_VISIBLE_LOGS && (
          <div className="text-zinc-600 italic">
            ... {logs.length - MAX_VISIBLE_LOGS} older lines hidden
          </div>
        )}
      </div>
    </div>
  );
};
