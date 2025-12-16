
import React, { useState, useMemo } from 'react';
import { X, ArrowDown, ArrowUp, Calculator, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface OversubCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEED_OPTIONS = [1, 10, 25, 40, 50, 100, 200, 400, 800];

const OversubCalculator: React.FC<OversubCalculatorProps> = ({ isOpen, onClose }) => {
  const [downCount, setDownCount] = useState(48);
  const [downSpeed, setDownSpeed] = useState(25);
  const [upCount, setUpCount] = useState(8);
  const [upSpeed, setUpSpeed] = useState(100);

  const stats = useMemo(() => {
    const downBw = downCount * downSpeed;
    const upBw = upCount * upSpeed;
    
    // Avoid division by zero
    const ratio = upBw > 0 ? downBw / upBw : 0;
    
    let status = 'Non-blocking / Line Rate';
    let color = 'text-emerald-600 dark:text-emerald-400';
    let bg = 'bg-emerald-100 dark:bg-emerald-900/20';
    let border = 'border-emerald-200 dark:border-emerald-800';

    if (ratio > 1.0 && ratio <= 2.0) {
        status = 'Standard Oversubscription';
        color = 'text-blue-600 dark:text-blue-400';
        bg = 'bg-blue-100 dark:bg-blue-900/20';
        border = 'border-blue-200 dark:border-blue-800';
    } else if (ratio > 2.0 && ratio <= 4.0) {
        status = 'High Density / Cost Optimized';
        color = 'text-orange-600 dark:text-orange-400';
        bg = 'bg-orange-100 dark:bg-orange-900/20';
        border = 'border-orange-200 dark:border-orange-800';
    } else if (ratio > 4.0) {
        status = 'High Congestion Risk';
        color = 'text-red-600 dark:text-red-400';
        bg = 'bg-red-100 dark:bg-red-900/20';
        border = 'border-red-200 dark:border-red-800';
    } else if (ratio < 1.0) {
        status = 'Underutilized Uplinks';
        color = 'text-purple-600 dark:text-purple-400';
        bg = 'bg-purple-100 dark:bg-purple-900/20';
        border = 'border-purple-200 dark:border-purple-800';
    }

    return { downBw, upBw, ratio, status, color, bg, border };
  }, [downCount, downSpeed, upCount, upSpeed]);

  const formatBw = (gbps: number) => {
    if (gbps >= 1000) return `${(gbps / 1000).toFixed(2)} Tbps`;
    return `${gbps} Gbps`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-lg border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                <div className="flex items-center gap-3">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg text-neutral-600 dark:text-neutral-300">
                        <Calculator size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Oversubscription Calculator</h2>
                        <p className="text-xs text-neutral-500">Bandwidth ratio planner</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-6 space-y-8 bg-neutral-50/50 dark:bg-neutral-950/50">
                {/* Downlinks */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <ArrowDown className="text-blue-500" size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Downlinks (Southbound)</h3>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Port Count</label>
                                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{downCount}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="96" 
                                value={downCount} 
                                onChange={(e) => setDownCount(Number(e.target.value))}
                                className="w-full accent-blue-600"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Port Speed</label>
                            <div className="flex flex-wrap gap-2">
                                {SPEED_OPTIONS.map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => setDownSpeed(speed)}
                                        className={`px-2.5 py-1 text-xs font-bold rounded border transition-all ${
                                            downSpeed === speed 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                                        }`}
                                    >
                                        {speed}G
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Uplinks */}
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <ArrowUp className="text-purple-500" size={16} />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Uplinks (Northbound)</h3>
                    </div>
                    <div className="bg-white dark:bg-neutral-900 p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Port Count</label>
                                <span className="font-mono font-bold text-purple-600 dark:text-purple-400">{upCount}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="32" 
                                value={upCount} 
                                onChange={(e) => setUpCount(Number(e.target.value))}
                                className="w-full accent-purple-600"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">Port Speed</label>
                            <div className="flex flex-wrap gap-2">
                                {SPEED_OPTIONS.filter(s => s >= 10).map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => setUpSpeed(speed)}
                                        className={`px-2.5 py-1 text-xs font-bold rounded border transition-all ${
                                            upSpeed === speed 
                                            ? 'bg-purple-600 text-white border-purple-600' 
                                            : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-purple-300'
                                        }`}
                                    >
                                        {speed}G
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Results */}
            <div className={`p-6 border-t ${stats.bg} ${stats.border}`}>
                 <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className={`text-3xl font-black tracking-tight ${stats.color}`}>
                            {stats.ratio.toFixed(2)}:1
                        </h3>
                        <p className={`text-sm font-bold mt-1 flex items-center gap-2 ${stats.color}`}>
                           {stats.ratio <= 1.1 ? <CheckCircle2 size={16}/> : stats.ratio > 4 ? <AlertTriangle size={16}/> : <Info size={16}/>} 
                           {stats.status}
                        </p>
                    </div>
                    <div className="text-right text-xs space-y-1 opacity-80">
                         <div className="text-neutral-900 dark:text-neutral-100 font-mono">
                            <span className="text-neutral-500 mr-2">Down BW:</span>
                            {formatBw(stats.downBw)}
                         </div>
                         <div className="text-neutral-900 dark:text-neutral-100 font-mono">
                            <span className="text-neutral-500 mr-2">Up BW:</span>
                            {formatBw(stats.upBw)}
                         </div>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default OversubCalculator;
