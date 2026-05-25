import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useStore } from '../store/useStore';
import {
  ArenaModel,
  ArenaPilot,
  getArenaPreviewUrl,
  listArenaModels,
  listArenaModelTypes,
  loadArenaPilot,
  predictArenaPilot,
  unloadArenaPilot,
} from '../services/api';

type ViewerState = {
  localId: string;
  modelType: string;
  modelPath: string;
  pilot?: ArenaPilot;
  models: ArenaModel[];
  user?: { angle: number; throttle: number };
  prediction?: { angle: number; throttle: number };
  previewUrl?: string;
  loading: boolean;
  error?: string;
};

const defaultViewer = (): ViewerState => ({
  localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  modelType: 'tflite_linear',
  modelPath: '',
  models: [],
  loading: false,
});

const formatValue = (value: number | undefined) =>
  value === undefined || Number.isNaN(value) ? '--' : value.toFixed(3);

export const PilotArenaPage: React.FC = () => {
  const configPath = useStore((state) => state.configPath);
  const tubPath = useStore((state) => state.tubPath);
  const records = useStore((state) => state.records);
  const currentIndex = useStore((state) => state.currentIndex);
  const setCurrentIndex = useStore((state) => state.setCurrentIndex);

  const [modelTypes, setModelTypes] = useState<string[]>(['tflite_linear', 'linear']);
  const [columns, setColumns] = useState<1 | 2 | 3 | 4>(2);
  const [viewers, setViewers] = useState<ViewerState[]>([defaultViewer()]);
  const [pageError, setPageError] = useState<string | null>(null);

  const currentRecord = records[currentIndex];
  const hasRecords = records.length > 0;
  const gridClass = useMemo(() => {
    const classes = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 xl:grid-cols-2',
      3: 'grid-cols-1 xl:grid-cols-3',
      4: 'grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4',
    };
    return classes[columns];
  }, [columns]);

  useEffect(() => {
    listArenaModelTypes()
      .then((data) => {
        if (Array.isArray(data.model_types) && data.model_types.length > 0) {
          setModelTypes(data.model_types);
        }
      })
      .catch((error) => setPageError(error?.response?.data?.detail || error.message));
  }, []);

  const updateViewer = useCallback((localId: string, patch: Partial<ViewerState>) => {
    setViewers((items) => items.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
  }, []);

  const refreshModels = useCallback(async (viewer: ViewerState) => {
    updateViewer(viewer.localId, { loading: true, error: undefined });
    try {
      const data = await listArenaModels({ workingDir: configPath, modelType: viewer.modelType });
      updateViewer(viewer.localId, {
        models: data.models,
        modelPath: data.models[0]?.path || viewer.modelPath,
        loading: false,
      });
    } catch (error: any) {
      updateViewer(viewer.localId, { loading: false, error: error?.response?.data?.detail || error.message });
    }
  }, [configPath, updateViewer]);

  const refreshPrediction = useCallback(async (viewer: ViewerState, recordIndex: number) => {
    if (!viewer.pilot || !hasRecords) return;
    updateViewer(viewer.localId, { loading: true, error: undefined });
    try {
      const data = await predictArenaPilot(viewer.pilot.id, {
        record_index: recordIndex,
        config_path: configPath,
      });
      updateViewer(viewer.localId, {
        user: data.user,
        prediction: data.pilot,
        previewUrl: getArenaPreviewUrl(viewer.pilot.id, { recordIndex, configPath }),
        loading: false,
      });
    } catch (error: any) {
      updateViewer(viewer.localId, { loading: false, error: error?.response?.data?.detail || error.message });
    }
  }, [configPath, hasRecords, updateViewer]);

  const loadViewer = useCallback(async (viewer: ViewerState) => {
    if (!viewer.modelPath) {
      updateViewer(viewer.localId, { error: '请选择模型文件' });
      return;
    }

    updateViewer(viewer.localId, { loading: true, error: undefined });
    try {
      const data = await loadArenaPilot({
        model_path: viewer.modelPath,
        model_type: viewer.modelType,
        config_path: configPath,
      });
      const updated = { ...viewer, pilot: data.pilot, loading: false, error: undefined };
      updateViewer(viewer.localId, updated);
      await refreshPrediction(updated, currentIndex);
    } catch (error: any) {
      updateViewer(viewer.localId, { loading: false, error: error?.response?.data?.detail || error.message });
    }
  }, [configPath, currentIndex, refreshPrediction, updateViewer]);

  const unloadViewer = useCallback(async (viewer: ViewerState) => {
    if (viewer.pilot) {
      try {
        await unloadArenaPilot(viewer.pilot.id);
      } catch {
        // 后端可能已重启，前端仍应允许移除本地状态。
      }
    }
    setViewers((items) => items.filter((item) => item.localId !== viewer.localId));
  }, []);

  useEffect(() => {
    viewers.forEach((viewer) => {
      if (viewer.pilot) {
        refreshPrediction(viewer, currentIndex);
      }
    });
  }, [currentIndex]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Pilot Arena</h1>
          <p className="mt-1 text-sm text-zinc-400">
            并排加载多个 pilot，比较当前 Tub record 的用户控制与模型预测。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={columns}
            onChange={(event) => setColumns(Number(event.target.value) as 1 | 2 | 3 | 4)}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
          >
            {[1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>{value} 列</option>
            ))}
          </select>
          <Button onClick={() => setViewers((items) => [...items, defaultViewer()])}>添加 Pilot</Button>
        </div>
      </div>

      {pageError && (
        <div className="rounded-md border border-red-800 bg-red-950/60 px-4 py-3 text-sm text-red-200">
          {pageError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>当前数据</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div className="rounded-md bg-zinc-950 px-3 py-2 text-zinc-300">Config: {configPath || '未选择'}</div>
            <div className="rounded-md bg-zinc-950 px-3 py-2 text-zinc-300">Tub: {tubPath || '未选择'}</div>
            <div className="rounded-md bg-zinc-950 px-3 py-2 text-zinc-300">Records: {records.length}</div>
          </div>
          <input
            type="range"
            min="0"
            max={Math.max(0, records.length - 1)}
            value={Math.min(currentIndex, Math.max(0, records.length - 1))}
            disabled={!hasRecords}
            onChange={(event) => setCurrentIndex(Number(event.target.value))}
            className="w-full accent-cyan-500"
          />
          <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
            <span>当前序号: {currentIndex}</span>
            <span>Record index: {currentRecord?._index ?? '--'}</span>
            <span>user/angle: {formatValue(Number(currentRecord?.['user/angle']))}</span>
            <span>user/throttle: {formatValue(Number(currentRecord?.['user/throttle']))}</span>
          </div>
        </CardContent>
      </Card>

      {!hasRecords && (
        <div className="rounded-md border border-amber-700 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
          请先在 Tub Manager 加载 Tub 数据，再进入 Pilot Arena 做模型对比。
        </div>
      )}

      <div className={`grid gap-4 ${gridClass}`}>
        {viewers.map((viewer) => (
          <Card key={viewer.localId}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{viewer.pilot?.name || '未加载 Pilot'}</CardTitle>
                  <p className="mt-1 text-xs text-zinc-500">{viewer.pilot?.model_type || viewer.modelType}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => unloadViewer(viewer)}>移除</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-zinc-400">模型类型</span>
                  <select
                    value={viewer.modelType}
                    onChange={(event) => updateViewer(viewer.localId, { modelType: event.target.value, modelPath: '', models: [], pilot: undefined })}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                  >
                    {modelTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <Button variant="secondary" className="w-full" onClick={() => refreshModels(viewer)} disabled={viewer.loading}>
                    扫描模型
                  </Button>
                </div>
              </div>

              <label className="space-y-1 text-sm block">
                <span className="text-zinc-400">模型文件</span>
                <select
                  value={viewer.modelPath}
                  onChange={(event) => updateViewer(viewer.localId, { modelPath: event.target.value, pilot: undefined })}
                  className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100"
                >
                  <option value="">请选择模型</option>
                  {viewer.models.map((model) => (
                    <option key={model.path} value={model.path}>{model.name}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => loadViewer(viewer)} disabled={viewer.loading || !viewer.modelPath}>加载并预测</Button>
                <Button variant="secondary" onClick={() => refreshPrediction(viewer, currentIndex)} disabled={viewer.loading || !viewer.pilot || !hasRecords}>
                  刷新预测
                </Button>
              </div>

              {viewer.error && (
                <div className="rounded-md border border-red-800 bg-red-950/60 px-3 py-2 text-sm text-red-200">
                  {viewer.error}
                </div>
              )}

              <div className="aspect-video overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                {viewer.previewUrl ? (
                  <img src={viewer.previewUrl} alt="Pilot preview" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-sm text-zinc-500">加载模型后显示叠线预览</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-zinc-950 p-3">
                  <div className="text-xs uppercase text-zinc-500">User</div>
                  <div className="mt-2 font-mono text-green-400">Angle {formatValue(viewer.user?.angle)}</div>
                  <div className="font-mono text-green-400">Throttle {formatValue(viewer.user?.throttle)}</div>
                </div>
                <div className="rounded-md bg-zinc-950 p-3">
                  <div className="text-xs uppercase text-zinc-500">Pilot</div>
                  <div className="mt-2 font-mono text-blue-400">Angle {formatValue(viewer.prediction?.angle)}</div>
                  <div className="font-mono text-blue-400">Throttle {formatValue(viewer.prediction?.throttle)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
