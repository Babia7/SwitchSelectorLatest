
import React from 'react';
import type { SwitchSpec } from '../types';
import { Activity, Server, Zap, Layers, Plus, Check } from 'lucide-react';

interface SwitchCardProps {
  data: SwitchSpec;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetails: (data: SwitchSpec) => void;
}

const SwitchCard: React.FC<SwitchCardProps> = ({ data, isSelected, onToggleSelect, onViewDetails }) => {
  
  // Minimalist badge colors - Light & Dark Mode
  const getSeriesColor = (series: string) => {
    switch (series) {
        case '7060X6': return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
        case '7800R4': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
        case '7700R4': return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
        case '7280R3A': return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
        case '7280R3': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
        case '7050X4': return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20';
        case '7050X3': return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20';
        default: return 'bg-neutral-100 text-neutral-600 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700';
    }
  };

  return (
    <div className={`group relative flex flex-col justify-between bg-white dark:bg-neutral-900 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md dark:hover:border-neutral-700 ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-neutral-200 dark:border-neutral-800'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getSeriesColor(data.series)}`}>
              {data.series}
            </span>
            {data.type === 'Line Card' && (
               <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-neutral-100 text-neutral-500 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
                Line Card
               </span>
            )}
          </div>
          <button 
            onClick={() => onToggleSelect(data.id)}
            className={`p-1 rounded transition-all duration-200 ${
              isSelected 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
            }`}
            title={isSelected ? "Remove from compare" : "Add to compare"}
          >
            {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={18} />}
          </button>
        </div>
        
        <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 mb-1 tracking-tight">{data.model}</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 h-8 overflow-hidden text-ellipsis line-clamp-2 leading-relaxed">{data.description}</p>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
          <StatItem icon={Activity} value={`${data.throughputTbps} Tbps`} label="Throughput" color="text-blue-600 dark:text-blue-400" />
          <StatItem icon={Server} value={data.size} label="Form Factor" />
          <StatItem icon={Zap} value={data.powerDraw.split('/')[0]} label="Typ Power" />
          <StatItem icon={Layers} value={data.buffer} label="Buffer" />
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 rounded-b-lg flex items-center justify-between">
         <div className="flex items-center gap-2">
            {data.max800G > 0 && <PortBadge count={data.max800G} label="800G" />}
            {data.max400G > 0 && <PortBadge count={data.max400G} label="400G" />}
            {data.max100G > 0 && <PortBadge count={data.max100G} label="100G" />}
         </div>
         <button 
           onClick={() => onViewDetails(data)}
           className="text-xs font-semibold text-neutral-500 hover:text-blue-600 dark:text-neutral-400 dark:hover:text-blue-400 transition-colors"
         >
           View Specs &rarr;
         </button>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, value, label, color = "text-neutral-700 dark:text-neutral-200" }: any) => (
  <div className="flex items-start gap-2.5">
    <Icon size={14} className="text-neutral-400 dark:text-neutral-500 mt-0.5 shrink-0" />
    <div>
      <div className={`text-sm font-semibold ${color} leading-none mb-1`}>{value}</div>
      <div className="text-[10px] text-neutral-500 font-medium uppercase tracking-wide">{label}</div>
    </div>
  </div>
);

const PortBadge = ({ count, label }: { count: number, label: string }) => (
  <div className="flex items-baseline gap-0.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 shadow-sm">
    <span>{count}</span>
    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">x</span>
    <span className="text-[10px] text-neutral-400 dark:text-neutral-500">{label}</span>
  </div>
);

export default SwitchCard;
