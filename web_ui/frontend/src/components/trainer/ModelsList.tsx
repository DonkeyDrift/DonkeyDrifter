import React, { useEffect, useState, useCallback } from 'react';
import { listModels } from '../../services/api';
import { useStore } from '../../store/useStore';
import { FileText, Trash2, Copy } from 'lucide-react';

interface ModelItem {
  name: string;
  size: number;
  modified: string;
  path: string;
}

function formatSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIdx = 0;
  while (size >= 1024 && unitIdx < units.length - 1) {
    size /= 1024;
    unitIdx++;
  }
  return `${size.toFixed(1)} ${units[unitIdx]}`;
}

export const ModelsList: React.FC = () => {
  const { configPath, trainingJob } = useStore();
  const [models, setModels] = useState<ModelItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listModels(configPath);
      setModels(data.models || []);
    } catch {
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, [configPath]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh when a training job completes
  useEffect(() => {
    if (trainingJob?.status === 'completed') {
      refresh();
    }
  }, [trainingJob?.status, refresh]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Models</h3>
        <button
          onClick={refresh}
          disabled={loading}
          className="text-xs text-cyan-500 hover:text-cyan-400 disabled:text-zinc-600 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {models.length === 0 && (
        <div className="text-sm text-zinc-600">No models found in ./models</div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {models.map((m) => (
          <div
            key={m.name}
            className="flex items-center justify-between bg-zinc-950 rounded px-3 py-2 border border-zinc-800/50"
          >
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-zinc-300 truncate" title={m.name}>{m.name}</div>
                <div className="text-xs text-zinc-600">
                  {formatSize(m.size)} · {new Date(m.modified).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => navigator.clipboard.writeText(m.path)}
                title="Copy path"
                className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
