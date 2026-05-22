import React from 'react';
import { useStore } from '../../store/useStore';
import type { AdvancedTrainingOptions } from '../../services/api';

interface LocalConfigFormProps {
  tub: string;
  onTubChange: (v: string) => void;
  model: string;
  onModelChange: (v: string) => void;
  modelType: string;
  onModelTypeChange: (v: string) => void;
  transfer: string;
  onTransferChange: (v: string) => void;
  advanced: AdvancedTrainingOptions;
  onAdvancedChange: (v: AdvancedTrainingOptions) => void;
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
  advanced,
  onAdvancedChange,
}) => {
  const { configPath } = useStore();

  const updateAdvanced = (patch: Partial<AdvancedTrainingOptions>) => {
    onAdvancedChange({ ...advanced, ...patch });
  };

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

      {/* Advanced Options */}
      <div className="pt-2 border-t border-zinc-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={advanced.enabled}
            onChange={(e) => updateAdvanced({ enabled: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-cyan-600 focus:ring-cyan-600"
          />
          <span className="text-sm font-medium text-zinc-300">Advanced Options</span>
        </label>

        {advanced.enabled && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Batch Size</label>
              <input
                type="number"
                value={advanced.batch_size ?? 128}
                onChange={(e) => updateAdvanced({ batch_size: parseInt(e.target.value, 10) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Train/Test Split</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={advanced.train_test_split ?? 0.8}
                onChange={(e) => updateAdvanced({ train_test_split: parseFloat(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Max Epochs</label>
              <input
                type="number"
                value={advanced.max_epochs ?? 100}
                onChange={(e) => updateAdvanced({ max_epochs: parseInt(e.target.value, 10) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Learning Rate</label>
              <input
                type="number"
                step="0.0001"
                value={advanced.learning_rate ?? 0.001}
                onChange={(e) => updateAdvanced({ learning_rate: parseFloat(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Early Stop Patience</label>
              <input
                type="number"
                value={advanced.early_stop_patience ?? 5}
                onChange={(e) => updateAdvanced({ early_stop_patience: parseInt(e.target.value, 10) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Prune Val Loss Limit</label>
              <input
                type="number"
                step="0.1"
                value={advanced.prune_val_loss_degradation_limit ?? 0.2}
                onChange={(e) => updateAdvanced({ prune_val_loss_degradation_limit: parseFloat(e.target.value) })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.show_plot ?? true}
                onChange={(e) => updateAdvanced({ show_plot: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-cyan-600 focus:ring-cyan-600"
              />
              <span className="text-xs text-zinc-400">Show Plot</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.use_early_stop ?? true}
                onChange={(e) => updateAdvanced({ use_early_stop: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-cyan-600 focus:ring-cyan-600"
              />
              <span className="text-xs text-zinc-400">Use Early Stop</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={advanced.create_tf_lite ?? true}
                onChange={(e) => updateAdvanced({ create_tf_lite: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-cyan-600 focus:ring-cyan-600"
              />
              <span className="text-xs text-zinc-400">Create TF Lite</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
