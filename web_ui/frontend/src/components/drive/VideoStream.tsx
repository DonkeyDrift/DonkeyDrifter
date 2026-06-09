import React, { useEffect, useState, useRef } from 'react';
import { API_URL } from '../../services/api';
import { Wifi, WifiOff } from 'lucide-react';

interface VideoStreamProps {
  className?: string;
}

export const VideoStream: React.FC<VideoStreamProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [fps, setFps] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const streamUrl = `${API_URL}/drive/video`;

  const resetRetry = () => {
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  };

  const scheduleRetry = () => {
    resetRetry();
    retryTimerRef.current = setTimeout(() => {
      setRetryCount((c) => c + 1);
    }, 2000);
  };

  useEffect(() => {
    setStatus('loading');
    return () => resetRetry();
  }, [retryCount]);

  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const response = await fetch(`${API_URL}/drive/stats`);
        const data = await response.json();
        if (mounted) {
          setFps(Number(data.fps) || 0);
        }
      } catch {
        if (mounted) {
          setFps(0);
        }
      }
    };

    loadStats();
    const timer = setInterval(loadStats, 1000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const statusBadge = (() => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
            <Wifi className="w-3 h-3" />
            Live
          </span>
        );
      case 'loading':
        return (
          <span className="inline-flex items-center gap-1 text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
            <Wifi className="w-3 h-3 animate-pulse" />
            Connecting...
          </span>
        );
      case 'error':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded">
            <WifiOff className="w-3 h-3" />
            Disconnected
          </span>
        );
    }
  })();

  return (
    <div className={`relative bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden ${className}`}>
      <div className="absolute top-2 left-2 z-10">{statusBadge}</div>
      <div className="absolute right-2 top-2 z-10 rounded-md border border-white/10 bg-zinc-900/35 px-2 py-1 text-center shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
        <div className="text-[10px] text-zinc-400 uppercase leading-none">FPS</div>
        <div className="text-base font-mono leading-tight text-cyan-400">{fps}</div>
      </div>
      <img
        key={retryCount}
        ref={imgRef}
        src={streamUrl}
        alt="Camera feed"
        onLoad={() => setStatus('connected')}
        onError={() => {
          setStatus('error');
          scheduleRetry();
        }}
        className="w-full h-auto object-contain min-h-[360px]"
      />
      {status !== 'connected' && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 pointer-events-none">
          <div className="text-center text-zinc-500 text-sm">
            {status === 'loading' ? '正在连接摄像头...' : '摄像头未连接'}
          </div>
        </div>
      )}
    </div>
  );
};
