import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const { records, currentIndex, isDragging } = useStore();
  const chartRef = useRef<ChartInstance<'line'> | null>(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

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
            label: 'Angle',
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

  // 增强的垂直线插件 - 优化同步性能
  // 注意：插件不再依赖currentIndex，而是通过ref获取最新值
  // 这样可以避免插件频繁重新创建，提高性能和稳定性
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
        
        // 从ref中获取最新的currentIndex值，而不是依赖闭包
        const latestIndex = currentIndexRef.current;
        
        // 基于比例位置计算，而不是依赖采样索引
        // 这样可以确保与Timeline的完美同步
        const totalRecords = records.length;
        const progress = totalRecords > 1 ? latestIndex / (totalRecords - 1) : 0;
        
        // 计算在图表中的相对位置
        const chartArea = chart.chartArea;
        const chartWidth = chartArea.right - chartArea.left;
        const x = chartArea.left + (progress * chartWidth);
        
        if (isNaN(x) || x <= 0 || x > chartArea.right) {
          return;
        }
        
        const ctx = chart.ctx;
        ctx.save();
        
        // 增强样式：更粗的线条，更高的对比度
        ctx.strokeStyle = 'rgb(239, 68, 68)';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.9;
        ctx.setLineDash([5, 3]);
        
        // 绘制垂直线
        ctx.beginPath();
        ctx.moveTo(x, yAxis.top);
        ctx.lineTo(x, yAxis.bottom);
        ctx.stroke();
        
        // 添加顶部和底部的标记点
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgb(239, 68, 68)';
        ctx.beginPath();
        ctx.arc(x, yAxis.top, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, yAxis.bottom, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
      } catch (error) {
        console.error('Vertical line plugin error:', error);
      }
    }
  }), [sampledIndices, records]);

  // 优化的同步更新机制 - 确保与Timeline完美同步
  useEffect(() => {
    if (!chartRef.current || !isChartReady) return;
    
    // 使用requestAnimationFrame确保与浏览器刷新同步
    const updateChart = () => {
      if (chartRef.current) {
        // 直接调用render()而不是update()，避免重新计算数据
        // 插件会在render时自动读取最新的currentIndexRef.current值
        chartRef.current.render();
      }
      animationFrameRef.current = null;
    };
    
    // 取消之前的动画帧请求
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // 请求新的动画帧，确保与Timeline同步
    animationFrameRef.current = requestAnimationFrame(updateChart);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentIndex, isChartReady]);

  if (!records.length) return null;

  // 计算同步状态信息
  const syncInfo = {
    currentIndex,
    totalRecords: records.length,
    progress: records.length > 1 ? (currentIndex / (records.length - 1) * 100).toFixed(1) : '0.0'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Data Graph
          {isDragging && (
            <span className="ml-2 px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded-full animate-pulse">
              Live Update
            </span>
          )}
        </CardTitle>
        <div className="text-xs text-zinc-400 mt-1">
          Index: {syncInfo.currentIndex} / {syncInfo.totalRecords - 1} ({syncInfo.progress}%)
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full relative">
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
