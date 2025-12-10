
import React from 'react';
import type { SwitchSpec } from '../types';
import { getSwitchSpeedClass } from '../data';
import { Activity, Server, Zap, Layers, Plus, Check } from 'lucide-react';
import TextWithTooltip from './TextWithTooltip';

interface SwitchCardProps {
  data: SwitchSpec;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onViewDetails: (data: SwitchSpec) => void;
}

const SwitchCard: React.FC<SwitchCardProps> = ({ data, isSelected, onToggleSelect, onViewDetails }) => {
  
  // Use shared helper
  const speedClass = getSwitchSpeedClass(data);

  // Color mappings based on Speed Class
  const getSpeedColors = (speed: string) => {
    switch (speed) {
      case '800G':
        return {
          border: 'border-t-purple-500',
          badge: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
          portHighlight: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800'
        };
      case '400G':
        return {
          border: 'border-t-blue-500',
          badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
          portHighlight: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
        };
      case '50G':
        return {
          border: 'border-t-orange-500',
          badge: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
          portHighlight: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800'
        };
      case '25G':
        return {
          border: 'border-t-sky-500',
          badge: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30',
          portHighlight: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800'
        };
      case '10G':
        return {
          border: 'border-t-slate-500',
          badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30',
          portHighlight: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800'
        };
      default: // 100G
        return {
          border: 'border-t-emerald-500',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
          portHighlight: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800'
        };
    }
  };

  const speedColors = getSpeedColors(speedClass);
  const showSpeedBadge = !['50G', '25G', '10G'].includes(speedClass);

  return (
    <div className={`group relative flex flex-col justify-between bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-t-4 transition-all duration-200 hover:shadow-md dark:hover:border-neutral-700 ${speedColors.border} ${isSelected ? 'border-neutral-400 ring-1 ring-neutral-400 dark:border-neutral-500 dark:ring-neutral-500' : 'border-neutral-200 dark:border-neutral-800'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap gap-2">
            {/* Speed Class Badge - Only show for High Speed (>=100G) */}
            {showSpeedBadge && (
              <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${speedColors.badge}`}>
                {speedClass} Native
              </span>
            )}
            
            {/* Series Badge (Neutral now to let Speed pop) */}
            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-neutral-100 text-neutral-500 border border-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-700">
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
        <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 min-h-[2rem] leading-relaxed">
          <TextWithTooltip text={data.description} />
        </div>
        
        <div className="grid grid-cols-2 gap-y-4 gap-x-4">
          <StatItem icon={Activity} value={`${data.throughputTbps} Tbps`} label="Throughput" color="text-neutral-900 dark:text-neutral-100" />
          <StatItem icon={Server} value={data.size} label="Form Factor" />
          <StatItem icon={Zap} value={data.powerDraw.split('/')[0]} label="Typ Power" />
          <StatItem icon={Layers} value={data.buffer} label="Buffer" />
        </div>
      </div>
      
      <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 rounded-b-lg flex items-center justify-between">
         <div className="flex items-center gap-2">
            {data.max800G > 0 && <PortBadge count={data.max800G} label="800G" highlightClass={speedClass === '800G' ? speedColors.portHighlight : undefined} />}
            {data.max400G > 0 && <PortBadge count={data.max400G} label="400G" highlightClass={speedClass === '400G' ? speedColors.portHighlight : undefined} />}
            {data.max100G > 0 && <PortBadge count={data.max100G} label="100G" highlightClass={speedClass === '100G' ? speedColors.portHighlight : undefined} />}
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

const PortBadge = ({ count, label, highlightClass }: { count: number, label: string, highlightClass?: string }) => (
  <div className={`flex items-baseline gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded border shadow-sm ${highlightClass || 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700'}`}>
    <span>{count}</span>
    <span className={`text-[10px] ${highlightClass ? 'opacity-70' : 'text-neutral-400 dark:text-neutral-500'}`}>x</span>
    <span className={`text-[10px] ${highlightClass ? 'opacity-70' : 'text-neutral-400 dark:text-neutral-500'}`}>{label}</span>
  </div>
);

export default SwitchCard;
