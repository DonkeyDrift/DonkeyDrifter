import React, { useEffect, useRef, useState } from 'react';
import { VideoStream } from '../components/drive/VideoStream';
import { VirtualJoystick } from '../components/drive/VirtualJoystick';
import { ControlBars } from '../components/drive/ControlBars';
import { DriveModeSelector, DriveMode } from '../components/drive/DriveModeSelector';
import { useDriveWebsocket } from '../hooks/useDriveWebsocket';
import { useKeyboardDrive } from '../hooks/useKeyboardDrive';
import { Circle, CirclePlay } from 'lucide-react';

export const DrivePage: React.FC = () => {
  const { connected, carState, send } = useDriveWebsocket();

  // 输入合并：摇杆 + 键盘，后发生效
  const joystickRef = useRef({ angle: 0, throttle: 0 });
  const keyboardRef = useRef({ angle: 0, throttle: 0 });
  const lastInputType = useRef<'joystick' | 'keyboard'>('joystick');

  const [angle, setAngle] = useState(0);
  const [throttle, setThrottle] = useState(0);
  const [mode, setMode] = useState<DriveMode>('user');
  const [recording, setRecording] = useState(false);

  useKeyboardDrive({
    enabled: true,
    onChange: (a, t) => {
      keyboardRef.current = { angle: a, throttle: t };
      lastInputType.current = 'keyboard';
    },
  });

  // 控制节流：50Hz 发送
  const sendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    sendTimerRef.current = setInterval(() => {
      const { angle: a, throttle: t } = lastInputType.current === 'joystick'
        ? joystickRef.current
        : keyboardRef.current;
      setAngle(a);
      setThrottle(t);

      if (connected && (Math.abs(a) > 0.01 || Math.abs(t) > 0.01)) {
        send({ angle: a, throttle: t });
      }
    }, 20);
    return () => {
      if (sendTimerRef.current) clearInterval(sendTimerRef.current);
    };
  }, [connected, send]);

  // 同步车端模式
  useEffect(() => {
    setMode(carState.driveMode as DriveMode);
    setRecording(carState.recording);
  }, [carState.driveMode, carState.recording]);

  const handleModeChange = (newMode: DriveMode) => {
    setMode(newMode);
    send({ drive_mode: newMode });
  };

  const toggleRecording = () => {
    const next = !recording;
    setRecording(next);
    send({ recording: next });
  };

  return (
    <div className="space-y-4">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-200">驾驶控制台</h2>
        <div className="flex items-center gap-3">
          <DriveModeSelector value={mode} onChange={handleModeChange} disabled={!carState.online} />
          <button
            onClick={toggleRecording}
            disabled={!carState.online}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
              ${recording
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
              }
              ${!carState.online ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {recording ? <CirclePlay className="w-3.5 h-3.5 fill-current" /> : <Circle className="w-3.5 h-3.5" />}
            {recording ? '录制中' : '开始录制'}
          </button>
          <span className="text-xs text-zinc-500">
            {connected ? 'WebSocket 已连接' : 'WebSocket 连接中...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 摄像头回传区 */}
        <div className="lg:col-span-2">
          <VideoStream className="min-h-[360px]" />
        </div>

        {/* 控制区 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col">
          <div className="text-sm text-zinc-400 mb-4 flex items-center justify-between">
            <span>虚拟摇杆</span>
            <span className="text-[10px] text-zinc-500">支持鼠标 / 触屏</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-4">
            <VirtualJoystick
              onChange={(a, t) => {
                joystickRef.current = { angle: a, throttle: t };
                lastInputType.current = 'joystick';
              }}
              size={220}
            />
            <ControlBars angle={angle} throttle={throttle} className="w-full max-w-[240px]" />
            <div className="text-[10px] text-zinc-500 text-center">
              键盘快捷键: I 前进 · K 倒车 · J 左转 · L 右转
            </div>
          </div>
        </div>
      </div>

      {/* 状态卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-1">车端连接</div>
          <div className={`text-sm font-medium ${carState.online ? 'text-emerald-400' : 'text-red-400'}`}>
            {carState.online ? '在线' : '离线'}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-1">驾驶模式</div>
          <div className="text-sm text-zinc-300 font-medium capitalize">
            {mode}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-1">录制状态</div>
          <div className={`text-sm font-medium ${recording ? 'text-red-400' : 'text-zinc-400'}`}>
            {recording ? '录制中' : '关闭'}
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="text-xs text-zinc-500 mb-1">已录制条数</div>
          <div className="text-sm text-zinc-300 font-medium">
            {carState.numRecords}
          </div>
        </div>
      </div>
    </div>
  );
};
