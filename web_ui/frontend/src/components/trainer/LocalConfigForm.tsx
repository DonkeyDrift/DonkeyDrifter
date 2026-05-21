import React from 'react';
import { useStore } from '../../store/useStore';

interface LocalConfigFormProps {
  tub: string;
  onTubChange: (v: string) => void;
  model: string;
  onModelChange: (v: string) => void;
  modelType: string;
  onModelTypeChange: (v: string) => void;
  transfer: string;
  onTransferChange: (v: string) => void;
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

export const LocalConfigForm: React.FC<LocalConfigFormProps> = ({
  tub,
  onTubChange,
  model,
  onModelChange,
  modelType,
  onModelTypeChange,
  transfer,
  onTransferChange,
}) => {
  const { configPath } = useStore();

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Training Config</h3>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Tub Path</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tub}
            onChange={(e) => onTubChange(e.target.value)}
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
          onChange={(e) => onModelChange(e.target.value)}
          placeholder="e.g. my_model"
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Model Type</label>
        <select
          value={modelType}
          onChange={(e) => onModelTypeChange(e.target.value)}
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
          onChange={(e) => onTransferChange(e.target.value)}
          placeholder="path to base model"
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>
    </div>
  );
};
