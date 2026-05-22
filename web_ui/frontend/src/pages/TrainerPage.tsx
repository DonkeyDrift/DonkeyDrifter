import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { getTrainerConfig } from '../services/api';
import { ModeTabs } from '../components/trainer/ModeTabs';
import { LocalConfigForm } from '../components/trainer/LocalConfigForm';
import { RemoteConfigForm } from '../components/trainer/RemoteConfigForm';
import { ProgressPanel } from '../components/trainer/ProgressPanel';
import { LogPanel } from '../components/trainer/LogPanel';
import { ModelsList } from '../components/trainer/ModelsList';
import { useTrainingJob } from '../hooks/useTrainingJob';
import type { AdvancedTrainingOptions } from '../services/api';

type TrainerMode = 'local' | 'online';

export const TrainerPage: React.FC = () => {
  const [mode, setMode] = useState<TrainerMode>('local');
  const { job, startLocal, startOnline, stopJob, isRunning } = useTrainingJob();
  const { trainerOnlineConfig, setTrainerOnlineConfig } = useStore();

  // Local form state
  const [localTub, setLocalTub] = useState('./data');
  const [localModel, setLocalModel] = useState('');
  const [localModelType, setLocalModelType] = useState('linear');
  const [localTransfer, setLocalTransfer] = useState('');
  const [advanced, setAdvanced] = useState<AdvancedTrainingOptions>({
    enabled: false,
    batch_size: 128,
    train_test_split: 0.8,
    max_epochs: 100,
    show_plot: true,
    use_early_stop: true,
    early_stop_patience: 5,
    learning_rate: 0.001,
    create_tf_lite: true,
    prune_val_loss_degradation_limit: 0.2,
  });

  // Remote form state
  const [host, setHost] = useState(trainerOnlineConfig.host);
  const [user, setUser] = useState(trainerOnlineConfig.user);
  const [password, setPassword] = useState(trainerOnlineConfig.password);
  const [remoteDirBase, setRemoteDirBase] = useState(trainerOnlineConfig.remoteDirBase);
  const [modelName, setModelName] = useState(trainerOnlineConfig.modelName);
  const [pythonPath, setPythonPath] = useState(trainerOnlineConfig.pythonPath);

  // Load remote config on mount
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

  const handleLocalStart = useCallback(() => {
    const modelName = localModel.trim() || `pilot_${Date.now()}`;
    startLocal({
      tub: localTub,
      model: `./models/${modelName}`,
      model_type: localModelType,
      transfer: localTransfer.trim() || undefined,
      advanced: advanced.enabled ? advanced : undefined,
    });
  }, [localTub, localModel, localModelType, localTransfer, advanced, startLocal]);

  const handleOnlineStart = useCallback(() => {
    setTrainerOnlineConfig({
      host,
      user,
      password,
      remoteDirBase,
      modelName,
      pythonPath,
    });
    startOnline();
  }, [host, user, password, remoteDirBase, modelName, pythonPath, setTrainerOnlineConfig, startOnline]);

  const handleAction = useCallback(() => {
    if (isRunning) {
      stopJob();
    } else if (mode === 'local') {
      handleLocalStart();
    } else {
      handleOnlineStart();
    }
  }, [isRunning, mode, stopJob, handleLocalStart, handleOnlineStart]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-100">Trainer</h1>
        <ModeTabs mode={mode} onChange={setMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {mode === 'local' ? (
            <LocalConfigForm
              tub={localTub}
              onTubChange={setLocalTub}
              model={localModel}
              onModelChange={setLocalModel}
              modelType={localModelType}
              onModelTypeChange={setLocalModelType}
              transfer={localTransfer}
              onTransferChange={setLocalTransfer}
              advanced={advanced}
              onAdvancedChange={setAdvanced}
            />
          ) : (
            <RemoteConfigForm
              host={host}
              onHostChange={setHost}
              user={user}
              onUserChange={setUser}
              password={password}
              onPasswordChange={setPassword}
              remoteDirBase={remoteDirBase}
              onRemoteDirBaseChange={setRemoteDirBase}
              modelName={modelName}
              onModelNameChange={setModelName}
              pythonPath={pythonPath}
              onPythonPathChange={setPythonPath}
            />
          )}

          <LogPanel job={job} />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <ProgressPanel job={job} />

          <button
            onClick={handleAction}
            className={`w-full px-4 py-2 rounded-md font-medium transition-colors text-white ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-cyan-600 hover:bg-cyan-700'
            }`}
          >
            {isRunning
              ? 'Stop Training'
              : mode === 'local'
              ? 'Start Local Training'
              : 'Start Cloud Training'}
          </button>

          <ModelsList />
        </div>
      </div>
    </div>
  );
};
