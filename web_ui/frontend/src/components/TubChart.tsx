import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useStore } from '../store/useStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Chart as ChartInstance, Plugin } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { LineChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const TubChart: React.FC = () => {
  const { records, currentIndex, isDragging, setCurrentIndex } = useStore();
  const chartRef = useRef<ChartInstance<'line'> | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number; dataIndex: number } | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; steering: number; throttle: number; index: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || !containerRef.current || !records.length) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const chart = chartRef.current;
    const chartArea = chart.chartArea;

    if (x < chartArea.left || x > chartArea.right || y < chartArea.top || y > chartArea.bottom) {
      setHoverPosition(null);
      setTooltipData(null);
      return;
    }

    const relativeX = x - chartArea.left;
    const chartWidth = chartArea.right - chartArea.left;
    const progress = relativeX / chartWidth;

    const dataIndex = Math.round(progress * (records.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataIndex, records.length - 1));

    const record = records[clampedIndex];
    const steering = record['user/angle'] as number ?? 0;
    const throttle = record['user/throttle'] as number ?? 0;

    setHoverPosition({ x, y, dataIndex: clampedIndex });
    setTooltipData({
      x: event.clientX,
      y: event.clientY,
      steering,
      throttle,
      index: clampedIndex
    });
  }, [records]);

  const handleMouseLeave = useCallback(() => {
    setHoverPosition(null);
    setTooltipData(null);
  }, []);

  const handleInteraction = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!chartRef.current || !containerRef.current || !records.length) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const chart = chartRef.current;
    const chartArea = chart.chartArea;

    if (x < chartArea.left || x > chartArea.right) return;

    const relativeX = x - chartArea.left;
    const chartWidth = chartArea.right - chartArea.left;
    const progress = relativeX / chartWidth;

    const dataIndex = Math.round(progress * (records.length - 1));
    const clampedIndex = Math.max(0, Math.min(dataIndex, records.length - 1));

    setCurrentIndex(clampedIndex);
  }, [records, setCurrentIndex]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // 立即处理跳转
    handleInteraction(event);
  }, [handleInteraction]);

  const handleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    handleInteraction(event);
  }, [handleInteraction]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!records.length) return;

    const step = event.shiftKey ? 10 : 1;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - step));
        break;
      case 'ArrowRight':
        event.preventDefault();
        setCurrentIndex((prev) => Math.min(records.length - 1, prev + step));
        break;
      case 'Home':
        event.preventDefault();
        setCurrentIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setCurrentIndex(records.length - 1);
        break;
    }
  }, [records.length, setCurrentIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const { data, sampledIndices } = useMemo(() => {
    if (!records.length) return { data: { labels: [], datasets: [] }, sampledIndices: [] as number[] };

    // Use a subset of records for performance if needed, but charting 10k points might be heavy
    // Let's sample if too many
    const maxPoints = 1000;
    const step = Math.ceil(records.length / maxPoints);
    const sampledRecords = records.filter((_, i) => i % step === 0);

    const labels = sampledRecords.map(r => r._index);
    const angleData = sampledRecords.map(r => r['user/angle']);
    const throttleData = sampledRecords.map(r => r['user/throttle']);

    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Steering',
            data: angleData,
            borderColor: 'rgb(6, 182, 212)', // Cyan-500
            backgroundColor: 'rgba(6, 182, 212, 0.5)',
            borderWidth: 1,
            pointRadius: 0,
            tension: 0.1
          },
          {
            label: 'Throttle',
            data: throttleData,
            borderColor: 'rgb(234, 179, 8)', // Yellow-500
            backgroundColor: 'rgba(234, 179, 8, 0.5)',
            borderWidth: 1,
            pointRadius: 0,
             tension: 0.1
          },
        ],
      },
      sampledIndices: labels,
    };
  }, [records]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
            color: '#e4e4e7' // zinc-200
        }
      },
    },
    scales: {
        x: {
            ticks: { color: '#71717a' }, // zinc-500
            grid: { color: '#27272a' } // zinc-800
        },
        y: {
            ticks: { color: '#71717a' },
            grid: { color: '#27272a' }
        }
    },
    animation: {
        duration: 0 // Disable animation for performance
    }
  };

  const hoverPositionRef = useRef(hoverPosition);

  useEffect(() => {
    hoverPositionRef.current = hoverPosition;
  }, [hoverPosition]);

  const verticalLinePlugin = useMemo<Plugin<'line'>>(() => ({
    id: 'verticalLine',
    afterDraw: (chart: ChartInstance<'line'>) => {
      if (!sampledIndices.length || !records.length) {
        return;
      }
      
      try {
        const xAxis = chart.scales.x;
        const yAxis = chart.scales.y;
        if (!xAxis || !yAxis) {
          return;
        }
        
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        
        const latestIndex = currentIndexRef.current;
        const totalRecords = records.length;
        const progress = totalRecords > 1 ? latestIndex / (totalRecords - 1) : 0;
        const chartWidth = chartArea.right - chartArea.left;
        const currentX = chartArea.left + (progress * chartWidth);
        
        if (!isNaN(currentX) && currentX > 0 && currentX <= chartArea.right) {
          ctx.save();
          ctx.strokeStyle = 'rgb(239, 68, 68)';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.9;
          ctx.setLineDash([5, 3]);
          
          ctx.beginPath();
          ctx.moveTo(currentX, yAxis.top);
          ctx.lineTo(currentX, yAxis.bottom);
          ctx.stroke();
          
          ctx.setLineDash([]);
          ctx.fillStyle = 'rgb(239, 68, 68)';
          ctx.beginPath();
          ctx.arc(currentX, yAxis.top, 3, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(currentX, yAxis.bottom, 3, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.restore();
        }

        const hoverPos = hoverPositionRef.current;
        if (hoverPos && hoverPos.x >= chartArea.left && hoverPos.x <= chartArea.right) {
          ctx.save();
          ctx.strokeStyle = 'rgb(34, 197, 94)';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.8;
          ctx.setLineDash([]);
          
          ctx.beginPath();
          ctx.moveTo(hoverPos.x, yAxis.top);
          ctx.lineTo(hoverPos.x, yAxis.bottom);
          ctx.stroke();
          
          ctx.fillStyle = 'rgb(34, 197, 94)';
          ctx.beginPath();
          ctx.arc(hoverPos.x, yAxis.top, 2, 0, 2 * Math.PI);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(hoverPos.x, yAxis.bottom, 2, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.restore();
        }
      } catch (error) {
        console.error('Vertical line plugin error:', error);
      }
    }
  }), [sampledIndices, records]);

  useEffect(() => {
    if (!chartRef.current || !isChartReady) return;
    
    const updateChart = () => {
      if (chartRef.current) {
        chartRef.current.render();
      }
      animationFrameRef.current = null;
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(updateChart);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentIndex, isChartReady, hoverPosition]);

  if (!records.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Tub Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id="empty-chart"
            className="empty-chart-placeholder flex h-[300px] w-full items-center justify-center rounded-lg border border-dashed border-zinc-700 text-sm text-zinc-400"
            aria-label="empty-chart placeholder"
          >
            No data
          </div>
        </CardContent>
      </Card>
    );
  }

  // 计算同步状态信息
  const syncInfo = {
    currentIndex,
    totalRecords: records.length,
    progress: records.length > 1 ? (currentIndex / (records.length - 1) * 100).toFixed(1) : '0.0'
  };

  return (
      <Card>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <LineChart className="w-5 h-5" />
            Tub Chart
          {isDragging && (
            <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full animate-pulse">
              Live Update
            </span>
          )}
        </CardTitle>
        <div className="text-xs text-zinc-400 mt-1">
          Index: {syncInfo.currentIndex} / {syncInfo.totalRecords - 1} ({syncInfo.progress}%)
        </div>
        {tooltipData && (
          <div 
            className="absolute top-6 right-6 pointer-events-none bg-zinc-900/95 border border-zinc-700 rounded-lg p-3 shadow-xl text-xs z-50 backdrop-blur-sm"
          >
            <div className="font-semibold text-zinc-200 mb-2">Frame: {tooltipData.index}</div>
            <div className="space-y-1">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Steering:</span>
                <span className="text-cyan-400 font-mono">{tooltipData.steering.toFixed(3)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-400">Throttle:</span>
                <span className="text-yellow-400 font-mono">{tooltipData.throttle.toFixed(3)}</span>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="h-[300px] w-full relative cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onClick={handleClick}
        >
          <Line 
            ref={chartRef} 
            options={options} 
            data={data} 
            plugins={[verticalLinePlugin]}
            onLoad={() => {
              setIsChartReady(true);
            }}
            className="w-full h-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
