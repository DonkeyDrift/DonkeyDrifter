import React, { useState, useCallback, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerConfig } from '../../services/api';

interface RemoteConfigFormProps {
  onStart: () => void;
  onStop: () => void;
  isRunning: boolean;
}

export const RemoteConfigForm: React.FC<RemoteConfigFormProps> = ({ onStart, onStop, isRunning }) => {
  const { trainerOnlineConfig, setTrainerOnlineConfig, configPath } = useStore();

  const [host, setHost] = useState(trainerOnlineConfig.host);
  const [user, setUser] = useState(trainerOnlineConfig.user);
  const [password, setPassword] = useState(trainerOnlineConfig.password);
  const [remoteDirBase, setRemoteDirBase] = useState(trainerOnlineConfig.remoteDirBase);
  const [modelName, setModelName] = useState(trainerOnlineConfig.modelName);
  const [pythonPath, setPythonPath] = useState(trainerOnlineConfig.pythonPath);

  useEffect(() => {
    getTrainerConfig('train_online.conf')
      .then((cfg) => {
        setHost(cfg.host);
        setUser(cfg.user);
        setPassword(cfg.password);
        setRemoteDirBase(cfg.remote_dir_base);
        setModelName(cfg.model_name);
        setPythonPath(cfg.python_path);
        setTrainerOnlineConfig({
          host: cfg.host,
          user: cfg.user,
          password: cfg.password,
          remoteDirBase: cfg.remote_dir_base,
          modelName: cfg.model_name,
          pythonPath: cfg.python_path,
        });
      })
      .catch(() => {
        // use defaults if file doesn't exist yet
      });
  }, [setTrainerOnlineConfig]);

  const handleStart = useCallback(() => {
    setTrainerOnlineConfig({
      host,
      user,
      password,
      remoteDirBase,
      modelName,
      pythonPath,
    });
    onStart();
  }, [host, user, password, remoteDirBase, modelName, pythonPath, setTrainerOnlineConfig, onStart]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Cloud Training</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">Host</label>
          <input
            type="text"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-zinc-500">User</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Remote Dir Base</label>
        <input
          type="text"
          value={remoteDirBase}
          onChange={(e) => setRemoteDirBase(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Model Name</label>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs text-zinc-500">Python Path</label>
        <input
          type="text"
          value={pythonPath}
          onChange={(e) => setPythonPath(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-cyan-600"
        />
      </div>

      <div className="text-xs text-zinc-600">Working dir: {configPath}</div>

      <button
        onClick={isRunning ? onStop : handleStart}
        className={`w-full px-4 py-2 rounded-md font-medium transition-colors text-white ${
          isRunning
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-cyan-600 hover:bg-cyan-700'
        }`}
      >
        {isRunning ? 'Stop Training' : 'Start Cloud Training'}
      </button>
    </div>
  );
};
