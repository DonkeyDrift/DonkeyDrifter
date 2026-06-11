import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useStore } from '../store/useStore';
import {
  discoverSimulator,
  saveSimulatorConfig,
  getApiErrorMessage,
  type SimulatorHost,
} from '../services/api';
import {
  Gamepad2,
  Search,
  Save,
  Wifi,
  WifiOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const SimulatorConfig: React.FC = () => {
  const { config, configPath, setError, setLoading, isLoading } = useStore();

  const [simHost, setSimHost] = useState('');
  const [donkeyGym, setDonkeyGym] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [foundHosts, setFoundHosts] = useState<SimulatorHost[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with loaded config
  useEffect(() => {
    if (config) {
      const host = config.SIM_HOST;
      if (typeof host === 'string') {
        setSimHost(host);
      }
      const gym = config.DONKEY_GYM;
      if (typeof gym === 'boolean') {
        setDonkeyGym(gym);
      }
    }
  }, [config]);

  const handleDiscover = useCallback(async () => {
    setIsDiscovering(true);
    setFoundHosts([]);
    setSaveSuccess(false);
    try {
      const data = await discoverSimulator(configPath || undefined);
      if (data.found && data.found.length > 0) {
        setFoundHosts(data.found);
      } else {
        setError('未在局域网中发现 DonkeySim 实例，请确认模拟器已启动');
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, '发现模拟器失败'));
    } finally {
      setIsDiscovering(false);
    }
  }, [configPath, setError]);

  const handleSelectHost = (host: SimulatorHost) => {
    setSimHost(host.ip);
    setSaveSuccess(false);
  };

  const handleSave = useCallback(async () => {
    if (!configPath) {
      setError('请先加载车辆配置目录');
      return;
    }
    setLoading(true);
    setSaveSuccess(false);
    try {
      await saveSimulatorConfig({
        path: configPath,
        config: {
          SIM_HOST: simHost,
          DONKEY_GYM: donkeyGym,
        },
      });
      setSaveSuccess(true);
      // Update local config state so other components see the change
      if (config) {
        useStore.setState({
          config: { ...config, SIM_HOST: simHost, DONKEY_GYM: donkeyGym },
        });
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, '保存模拟器配置失败'));
    } finally {
      setLoading(false);
    }
  }, [configPath, simHost, donkeyGym, config, setError, setLoading]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="w-5 h-5" />
          模拟器配置
        </CardTitle>
        <p className="text-sm text-zinc-400">配置 DonkeySim 模拟器连接</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* SIM_HOST input */}
          <div className="space-y-1">
            <label className="text-sm text-zinc-300 font-medium">模拟器主机 IP</label>
            <Input
              placeholder="例如 192.168.1.100"
              value={simHost}
              onChange={(e) => {
                setSimHost(e.target.value);
                setSaveSuccess(false);
              }}
              aria-label="Simulator host IP"
            />
          </div>

          {/* DONKEY_GYM toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-zinc-300 font-medium">启用模拟器模式</label>
            <button
              onClick={() => {
                setDonkeyGym((v) => !v);
                setSaveSuccess(false);
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                donkeyGym ? 'bg-cyan-600' : 'bg-zinc-700'
              }`}
              aria-label="Toggle simulator mode"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  donkeyGym ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Discovery button */}
          <Button
            variant="secondary"
            onClick={handleDiscover}
            disabled={isDiscovering}
            className="w-full"
            aria-label="Discover simulator"
          >
            {isDiscovering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {isDiscovering ? '正在扫描局域网…' : '自动发现模拟器'}
          </Button>

          {/* Found hosts list */}
          {foundHosts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400">发现以下可用模拟器（按延迟排序）：</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {foundHosts.map((host) => (
                  <button
                    key={`${host.ip}:${host.port}`}
                    onClick={() => handleSelectHost(host)}
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                      simHost === host.ip
                        ? 'border-cyan-500/50 bg-cyan-950/30'
                        : 'border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-zinc-100 font-mono">
                        {host.ip}:{host.port}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-400">
                      {host.latency_ms}ms
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No hosts hint */}
          {!isDiscovering && foundHosts.length === 0 && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <WifiOff className="w-3.5 h-3.5" />
              <span>点击上方按钮扫描局域网中的模拟器</span>
            </div>
          )}

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isLoading || !configPath}
            className="w-full"
            aria-label="Save simulator config"
          >
            {saveSuccess ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? '已保存' : '保存配置'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};