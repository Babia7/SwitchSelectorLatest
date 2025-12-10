
import React from 'react';
import type { SwitchSpec } from '../types';
import { X, StickyNote, Plus, Check } from 'lucide-react';
import TextWithTooltip from './TextWithTooltip';

interface SwitchDetailsModalProps {
  data: SwitchSpec | null;
  onClose: () => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  adminNote?: string;
}

const SwitchDetailsModal: React.FC<SwitchDetailsModalProps> = ({ 
  data, 
  onClose, 
  selectedIds, 
  onToggleSelect, 
  adminNote 
}) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-neutral-200 dark:ring-neutral-700/50">
            <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-start bg-white dark:bg-neutral-900 z-10">
                <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{data.model}</h2>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      <TextWithTooltip text={data.description} />
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                >
                    <X size={20} />
                </button>
            </div>
            
            {/* Admin Note Warning in Modal */}
            {adminNote && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 px-6 py-3 flex items-start gap-3">
                    <StickyNote className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide block mb-0.5">Administrator Note</span>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200/90">{adminNote}</p>
                    </div>
                </div>
            )}

            <div className="p-6 overflow-y-auto bg-white dark:bg-neutral-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                    <DetailItem label="Series" value={`${data.series} Series`} />
                    <DetailItem label="Type" value={data.type} />
                    <DetailItem label="Total Throughput" value={`${data.throughputTbps} Tbps`} highlight />
                    <DetailItem label="Packets Per Second" value={data.pps} />
                    <DetailItem label="Form Factor" value={data.size} />
                    <DetailItem label="Power Draw" value={data.powerDraw} />
                    <DetailItem label="Packet Buffer" value={data.buffer} />
                    <DetailItem label="Latency" value={data.latency} />
                    {data.eosLicense && (
                         <DetailItem label="EOS Feature License" value={data.eosLicense} />
                    )}
                    
                    <div className="col-span-1 sm:col-span-2 mt-2 pt-6 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                         <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-4 text-sm flex items-center gap-2">
                            Port Configuration <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></span>
                         </h4>
                         <div className="grid grid-cols-3 gap-4">
                            <PortBox label="800G" count={data.max800G} />
                            <PortBox label="400G" count={data.max400G} />
                            <PortBox label="100G" count={data.max100G} />
                         </div>
                         <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                            <p className="text-xs text-neutral-500 font-medium">Physical Ports</p>
                            <div className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                              <TextWithTooltip text={data.ports} />
                            </div>
                         </div>
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex justify-between items-center">
                <button 
                    onClick={() => onToggleSelect(data.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md border transition-all shadow-sm flex items-center gap-2 ${
                        selectedIds.includes(data.id) 
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                        : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }`}
                >
                    {selectedIds.includes(data.id) ? (
                        <>
                            <Check size={16} /> Compared
                        </>
                    ) : (
                        <>
                            <Plus size={16} /> Compare
                        </>
                    )}
                </button>
                <button 
                    onClick={onClose}
                    className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-all shadow-sm"
                >
                    Close
                </button>
            </div>
        </div>
    </div>
  );
};

const DetailItem = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <div className="flex flex-col gap-1">
        <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">{label}</dt>
        <dd className={`font-medium ${highlight ? 'text-blue-600 dark:text-blue-400 text-xl tracking-tight' : 'text-neutral-800 dark:text-neutral-200 text-sm'}`}>{value}</dd>
    </div>
);

const PortBox = ({ label, count }: { label: string, count: number }) => (
    <div className={`p-4 rounded-lg border transition-all ${count > 0 ? 'bg-white dark:bg-neutral-800/50 border-blue-500/20 ring-1 ring-blue-500/10 shadow-sm' : 'bg-neutral-50 dark:bg-neutral-950 border-transparent opacity-40'}`}>
        <div className={`text-2xl font-bold ${count > 0 ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400 dark:text-neutral-600'}`}>{count}</div>
        <div className="text-[10px] font-semibold text-neutral-500 uppercase mt-1">{label} Ports</div>
    </div>
);

export default SwitchDetailsModal;
