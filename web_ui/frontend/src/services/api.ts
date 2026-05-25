import axios from 'axios';

const DEFAULT_API_BASE = '/api';
const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_URL = RAW_API_BASE && RAW_API_BASE.length > 0 ? RAW_API_BASE.replace(/\/$/, '') : DEFAULT_API_BASE;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const loadConfig = async (path: string) => {
  const response = await api.post('/config/load', { path });
  return response.data;
};

export const loadMyconfig = async (path: string) => {
  const response = await api.post('/config/load_myconfig', { path });
  return response.data;
};

export const saveTrainingConfig = async (payload: {
  path: string;
  enabled: boolean;
  config: Record<string, string | number | boolean>;
}) => {
  const response = await api.post('/config/save_training', payload);
  return response.data;
};

export const selectDirectory = async () => {
  const response = await api.get('/config/select_directory');
  return response.data;
};

export const loadTub = async (path: string) => {
  const response = await api.post('/tub/load', { path });
  return response.data;
};

export const getRecords = async (offset = 0, limit = 100) => {
  const response = await api.get('/tub/records', { params: { offset, limit } });
  return response.data;
};

export const deleteRecords = async (indexes: number[]) => {
  const response = await api.post('/tub/delete', { indexes });
  return response.data;
};

export const restoreRecords = async (indexes: number[]) => {
  const response = await api.post('/tub/restore', { indexes });
  return response.data;
};

export const getImageUrl = (path: string) => {
  return `${API_URL}/tub/image?path=${encodeURIComponent(path)}`;
};

// ------------------------------------------------------------------
// Trainer APIs
// ------------------------------------------------------------------
export interface TrainerConfig {
  host: string;
  user: string;
  password: string;
  remote_dir_base: string;
  model_name: string;
  python_path: string;
}

export const getTrainerConfig = async (configFile = 'train_online.conf') => {
  const response = await api.get('/trainer/config', { params: { config_file: configFile } });
  return response.data;
};

export const setTrainerConfig = async (cfg: TrainerConfig, configFile = 'train_online.conf') => {
  const response = await api.post('/trainer/config', cfg, { params: { config_file: configFile } });
  return response.data;
};

export const listModels = async (workingDir?: string) => {
  const response = await api.get('/trainer/models', { params: workingDir ? { working_dir: workingDir } : {} });
  return response.data;
};

export const downloadModelUrl = (path: string): string => {
  return `${API_URL}/trainer/models/download?path=${encodeURIComponent(path)}`;
};

export const deleteModel = async (path: string) => {
  const response = await api.delete('/trainer/models', { params: { path } });
  return response.data;
};

export const loadModelToCar = async (modelPath: string, workingDir?: string) => {
  const response = await api.post('/drive/load_model', { model_path: modelPath, working_dir: workingDir });
  return response.data;
};

export const sendCalibrate = async (params: Record<string, number | boolean>) => {
  const response = await api.post('/drive/calibrate', params);
  return response.data;
};

export const listBackups = async (workingDir?: string) => {
  const response = await api.get('/trainer/backups', { params: workingDir ? { working_dir: workingDir } : {} });
  return response.data;
};

export const startLocalTrain = async (params: {
  tub: string;
  model: string;
  model_type: string;
  transfer?: string;
  working_dir?: string;
}) => {
  const response = await api.post('/trainer/train/local', params);
  return response.data;
};

export const startOnlineTrain = async (params: {
  config_file?: string;
  working_dir?: string;
}) => {
  const response = await api.post('/trainer/train/online', params);
  return response.data;
};

export const stopTrain = async (jobId: string) => {
  const response = await api.post(`/trainer/train/${jobId}/stop`);
  return response.data;
};

export const getJobStatus = async (jobId: string) => {
  const response = await api.get(`/trainer/train/${jobId}/status`);
  return response.data;
};

export const createLogStream = (jobId: string) => {
  return new EventSource(`${API_URL}/trainer/train/${jobId}/logs`);
};

// ------------------------------------------------------------------
// Pilot Arena APIs
// ------------------------------------------------------------------
export interface ArenaModel {
  name: string;
  path: string;
  format: string;
  size: number;
  modified: string;
  compatible: boolean;
}

export interface ArenaPilot {
  id: string;
  name: string;
  model_path: string;
  model_type: string;
  loaded_at: string;
}

export interface ArenaPrediction {
  status: boolean;
  record_index: number;
  user: { angle: number; throttle: number };
  pilot: { angle: number; throttle: number };
}

export const listArenaModelTypes = async () => {
  const response = await api.get('/arena/model-types');
  return response.data;
};

export const listArenaModels = async (params: { workingDir?: string; modelType?: string } = {}) => {
  const response = await api.get('/arena/models', {
    params: {
      ...(params.workingDir ? { working_dir: params.workingDir } : {}),
      ...(params.modelType ? { model_type: params.modelType } : {}),
    },
  });
  return response.data as { models: ArenaModel[] };
};

export const loadArenaPilot = async (payload: {
  model_path: string;
  model_type: string;
  config_path?: string;
}) => {
  const response = await api.post('/arena/pilots/load', payload);
  return response.data as { status: boolean; pilot: ArenaPilot };
};

export const unloadArenaPilot = async (pilotId: string) => {
  const response = await api.delete(`/arena/pilots/${pilotId}`);
  return response.data;
};

export const predictArenaPilot = async (pilotId: string, payload: {
  record_index: number;
  config_path?: string;
  user_angle_field?: string;
  user_throttle_field?: string;
}) => {
  const response = await api.post(`/arena/pilots/${pilotId}/predict`, payload);
  return response.data as ArenaPrediction;
};

export const getArenaPreviewUrl = (pilotId: string, params: {
  recordIndex: number;
  configPath?: string;
  userAngleField?: string;
  userThrottleField?: string;
}) => {
  const search = new URLSearchParams({
    record_index: String(params.recordIndex),
    t: String(Date.now()),
  });
  if (params.configPath) search.set('config_path', params.configPath);
  if (params.userAngleField) search.set('user_angle_field', params.userAngleField);
  if (params.userThrottleField) search.set('user_throttle_field', params.userThrottleField);
  return `${API_URL}/arena/pilots/${pilotId}/preview?${search.toString()}`;
};
