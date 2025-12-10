
import React, { useState, useMemo } from 'react';
import type { SwitchSpec } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalyticsProps {
  data: SwitchSpec[];
  isDarkMode: boolean;
}

type MetricType = 'throughput' | 'buffer';

const Analytics: React.FC<AnalyticsProps> = ({ data, isDarkMode }) => {
  const [metric, setMetric] = useState<MetricType>('throughput');

  // Helper to parse buffer strings to GB
  const parseBuffer = (bufferStr: string): number => {
    if (!bufferStr || bufferStr === 'N/A') return 0;
    const match = bufferStr.match(/([\d.]+)\s*([a-zA-Z]+)/);
    if (!match) return 0;
    let val = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'MB') val = val / 1024; // Convert MB to GB
    return parseFloat(val.toFixed(3));
  };

  const chartData = useMemo(() => {
    const processed = data.map(item => ({
      ...item,
      bufferVal: parseBuffer(item.buffer)
    }));

    // Sort descending based on selected metric
    return processed
      .filter(item => metric === 'throughput' ? item.throughputTbps > 0 : item.bufferVal > 0)
      .sort((a, b) => metric === 'throughput' 
        ? b.throughputTbps - a.throughputTbps 
        : b.bufferVal - a.bufferVal
      )
      .slice(0, 10);
  }, [data, metric]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const val = payload[0].value;
      const unit = metric === 'throughput' ? 'Tbps' : 'GB';
      return (
        <div className="bg-white dark:bg-neutral-800 px-3 py-2 border border-neutral-200 dark:border-neutral-700 shadow-xl rounded-md ring-1 ring-black/5 dark:ring-black/20">
          <p className="font-bold text-neutral-900 dark:text-neutral-200 text-sm mb-1">{label}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium font-mono">
            {val} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) return null;

  const axisColor = isDarkMode ? '#737373' : '#a3a3a3';
  const gridColor = isDarkMode ? '#262626' : '#e5e5e5';
  const barColorBase = isDarkMode ? '#1e3a8a' : '#dbeafe'; 
  const barColorActive = isDarkMode ? '#3b82f6' : '#2563eb';

  const dataKey = metric === 'throughput' ? 'throughputTbps' : 'bufferVal';
  const highValueThreshold = metric === 'throughput' ? 50 : 20; // Highlight bars above this value

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm mb-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">Top Performers</h3>
            <p className="text-xs text-neutral-500 mt-1">
              {metric === 'throughput' ? 'Throughput comparison (Tbps)' : 'Packet Buffer comparison (GB)'}
            </p>
        </div>
        
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          <button
            onClick={() => setMetric('throughput')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              metric === 'throughput' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Throughput
          </button>
          <button
            onClick={() => setMetric('buffer')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              metric === 'buffer' 
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Packet Buffer
          </button>
        </div>
      </div>
      
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
            barSize={32}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis 
                dataKey="model" 
                tick={{fontSize: 9, fill: axisColor}} 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                tick={{fontSize: 10, fill: axisColor}} 
                tickLine={false}
                axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{fill: gridColor, opacity: 0.5}} />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} animationDuration={500}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={(entry[dataKey] as number) > highValueThreshold ? barColorActive : barColorBase} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
