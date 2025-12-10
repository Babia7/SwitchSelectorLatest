
import React, { useState } from 'react';
import type { SwitchSpec } from '../types';
import { Search, X, ArrowRightLeft, Check, AlertCircle } from 'lucide-react';

interface QuickCompareProps {
  isOpen: boolean;
  onClose: () => void;
  switches: SwitchSpec[];
  onCompare: (id1: string, id2: string) => void;
}

const QuickCompare: React.FC<QuickCompareProps> = ({ isOpen, onClose, switches, onCompare }) => {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [selected1, setSelected1] = useState<string | null>(null);
  const [selected2, setSelected2] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFiltered = (query: string) => {
    if (!query) return [];
    const lower = query.toLowerCase();
    return switches.filter(s => 
      s.model.toLowerCase().includes(lower) || 
      s.description.toLowerCase().includes(lower)
    ).slice(0, 5);
  };

  const results1 = getFiltered(query1);
  const results2 = getFiltered(query2);

  const handleSelect = (slot: 1 | 2, id: string, name: string) => {
    if (slot === 1) {
        setSelected1(id);
        setQuery1(name);
    } else {
        setSelected2(id);
        setQuery2(name);
    }
  };

  const handleCompare = () => {
    if (selected1 && selected2) {
        onCompare(selected1, selected2);
        onClose();
        // Reset for next time
        setSelected1(null);
        setSelected2(null);
        setQuery1('');
        setQuery2('');
    }
  };
  
  const getSelectedModel = (id: string | null) => switches.find(s => s.id === id);
  const s1 = getSelectedModel(selected1);
  const s2 = getSelectedModel(selected2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden transform transition-all">
            <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                    <ArrowRightLeft size={18} className="text-blue-600 dark:text-blue-500" />
                    Compare Models
                </h3>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-neutral-50/50 dark:bg-neutral-950/50">
                {/* Slot 1 */}
                <div className="flex flex-col gap-3">
                     <div className="flex justify-between items-baseline">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Model A</label>
                        {selected1 && <button onClick={() => {setSelected1(null); setQuery1('')}} className="text-[10px] text-red-500 hover:underline">Clear</button>}
                     </div>
                     <div className="relative group">
                        <input 
                            value={query1}
                            onChange={(e) => { setQuery1(e.target.value); setSelected1(null); }}
                            placeholder="Type to search..."
                            className={`w-full pl-9 pr-3 py-3 bg-white dark:bg-neutral-900 border ${selected1 ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-neutral-200 dark:border-neutral-800'} rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm font-medium dark:text-neutral-200 transition-all shadow-sm`}
                            autoFocus
                        />
                        <Search className="absolute left-3 top-3.5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                        {selected1 && <Check className="absolute right-3 top-3.5 text-blue-500" size={14} />}
                        
                        {/* Dropdown 1 */}
                        {query1 && !selected1 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                                {results1.length > 0 ? results1.map(s => (
                                    <button key={s.id} onClick={() => handleSelect(1, s.id, s.model)} className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{s.model}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">{s.series}</span>
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{s.description}</div>
                                    </button>
                                )) : (
                                    <div className="px-4 py-3 text-xs text-neutral-400 flex items-center gap-2">
                                        <AlertCircle size={12}/> No models found
                                    </div>
                                )}
                            </div>
                        )}
                     </div>
                     {s1 && (
                         <div className="mt-2 p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm animate-fade-in">
                             <div className="text-xs text-neutral-500 mb-1">Specification Preview</div>
                             <div className="flex justify-between text-xs font-medium mb-1">
                                 <span className="text-neutral-600 dark:text-neutral-400">Throughput:</span>
                                 <span className="text-neutral-900 dark:text-neutral-200">{s1.throughputTbps} Tbps</span>
                             </div>
                             <div className="flex justify-between text-xs font-medium">
                                 <span className="text-neutral-600 dark:text-neutral-400">Ports:</span>
                                 <span className="text-neutral-900 dark:text-neutral-200">{s1.max800G > 0 ? '800G' : s1.max400G > 0 ? '400G' : '100G'} Native</span>
                             </div>
                         </div>
                     )}
                </div>

                {/* Slot 2 */}
                <div className="flex flex-col gap-3">
                     <div className="flex justify-between items-baseline">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Model B</label>
                        {selected2 && <button onClick={() => {setSelected2(null); setQuery2('')}} className="text-[10px] text-red-500 hover:underline">Clear</button>}
                     </div>
                     <div className="relative group">
                        <input 
                            value={query2}
                            onChange={(e) => { setQuery2(e.target.value); setSelected2(null); }}
                            placeholder="Type to search..."
                            className={`w-full pl-9 pr-3 py-3 bg-white dark:bg-neutral-900 border ${selected2 ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-neutral-200 dark:border-neutral-800'} rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 text-sm font-medium dark:text-neutral-200 transition-all shadow-sm`}
                        />
                        <Search className="absolute left-3 top-3.5 text-neutral-400 group-focus-within:text-blue-500 transition-colors" size={14} />
                        {selected2 && <Check className="absolute right-3 top-3.5 text-blue-500" size={14} />}

                        {/* Dropdown 2 */}
                        {query2 && !selected2 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                                {results2.length > 0 ? results2.map(s => (
                                    <button key={s.id} onClick={() => handleSelect(2, s.id, s.model)} className="w-full text-left px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="font-bold text-sm text-neutral-900 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">{s.model}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded text-neutral-500 group-hover:bg-white dark:group-hover:bg-neutral-700 transition-colors">{s.series}</span>
                                        </div>
                                        <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{s.description}</div>
                                    </button>
                                )) : (
                                    <div className="px-4 py-3 text-xs text-neutral-400 flex items-center gap-2">
                                        <AlertCircle size={12}/> No models found
                                    </div>
                                )}
                            </div>
                        )}
                     </div>
                     {s2 && (
                         <div className="mt-2 p-3 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-sm animate-fade-in">
                             <div className="text-xs text-neutral-500 mb-1">Specification Preview</div>
                             <div className="flex justify-between text-xs font-medium mb-1">
                                 <span className="text-neutral-600 dark:text-neutral-400">Throughput:</span>
                                 <span className="text-neutral-900 dark:text-neutral-200">{s2.throughputTbps} Tbps</span>
                             </div>
                             <div className="flex justify-between text-xs font-medium">
                                 <span className="text-neutral-600 dark:text-neutral-400">Ports:</span>
                                 <span className="text-neutral-900 dark:text-neutral-200">{s2.max800G > 0 ? '800G' : s2.max400G > 0 ? '400G' : '100G'} Native</span>
                             </div>
                         </div>
                     )}
                </div>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                <div className="text-xs text-neutral-500">
                    Select two models to view side-by-side comparison
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-neutral-600 dark:text-neutral-400 font-medium text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCompare}
                        disabled={!selected1 || !selected2}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
                    >
                        <ArrowRightLeft size={16} /> Compare
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default QuickCompare;
