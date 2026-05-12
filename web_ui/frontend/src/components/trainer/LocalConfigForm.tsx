import React, { useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { FolderOpen } from 'lucide-react';

interface LocalConfigFormProps {
  onStart: (params: {
    tub: string;
    model: string;
    model_type: string;
    transfer?: string;
  }) => void;
  isRunning: boolean;
}

const MODEL_TYPES = [
  'linear',
  'categorical',
  'rnn',
  'imu',
  'behavior',
  'localizer',
  '3d',
];

export const LocalConfigForm: React.FC<LocalConfigFormProps> = ({ onStart, isRunning }) => {
  const { configPath } = useStore();
  const [tub, setTub] = useState('./data');
  const [model, setModel] = useState('');
  const [modelType, setModelType] = useState('linear');
  const [transfer, setTransfer] = useState('');

  const handleStart = useCallback(() => {
    const modelName = model.trim() || `pilot_${Date.now()}`;
    onStart({
      tub,
      model: `./models/${modelName}`,
      model_type: modelType,
      transfer: transfer.trim() || undefined,
    });
  }, [tub, model, modelType, transfer, onStart]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Local Training</h3>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Tub Path</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tub}
            onChange={(e) => setTub(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
          />
        </div>
        <div className="text-xs text-zinc-600">Working dir: {configPath}</div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Model Name</label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="e.g. my_model"
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Model Type</label>
        <select
          value={modelType}
          onChange={(e) => setModelType(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        >
          {MODEL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Transfer Model (optional)</label>
        <input
          type="text"
          value={transfer}
          onChange={(e) => setTransfer(e.target.value)}
          placeholder="path to base model"
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>

      <button
        onClick={handleStart}
        disabled={isRunning}
        className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-md font-medium transition-colors"
      >
        {isRunning ? 'Training...' : 'Start Local Training'}
      </button>
    </div>
  );
};
