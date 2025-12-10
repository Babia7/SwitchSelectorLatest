
import React from 'react';
import type { SwitchSpec } from '../types';
import { X, ArrowDownUp, Download, FileSpreadsheet, Printer } from 'lucide-react';

interface ComparisonDrawerProps {
  selectedSwitches: SwitchSpec[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({ selectedSwitches, onRemove, onClear }) => {
  if (selectedSwitches.length < 2) return null;

  // Helper to check if a specific field is different across selected switches
  const hasDiff = (key: keyof SwitchSpec) => {
    if (selectedSwitches.length === 0) return false;
    const firstVal = selectedSwitches[0][key];
    return selectedSwitches.some(s => s[key] !== firstVal);
  };

  const handleExportCSV = () => {
    const headers = ['Feature', ...selectedSwitches.map(s => s.model)];
    
    // Helper to safely format CSV cells
    const safeCell = (val: string | number | undefined) => {
        const str = String(val || '-');
        // If contains comma, newline or double quote, wrap in quotes and escape double quotes
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = [
        ['Series', ...selectedSwitches.map(s => s.series)],
        ['Type', ...selectedSwitches.map(s => s.type)],
        ['Description', ...selectedSwitches.map(s => s.description)],
        ['Throughput', ...selectedSwitches.map(s => `${s.throughputTbps} Tbps`)],
        ['Packets/Sec', ...selectedSwitches.map(s => s.pps)],
        ['Latency', ...selectedSwitches.map(s => s.latency)],
        ['800G Ports', ...selectedSwitches.map(s => s.max800G || '0')],
        ['400G Ports', ...selectedSwitches.map(s => s.max400G || '0')],
        ['100G Ports', ...selectedSwitches.map(s => s.max100G || '0')],
        ['Port Details', ...selectedSwitches.map(s => s.ports)],
        ['Packet Buffer', ...selectedSwitches.map(s => s.buffer)],
        ['CPU', ...selectedSwitches.map(s => s.cpu)],
        ['Memory', ...selectedSwitches.map(s => s.memory)],
        ['Power Draw', ...selectedSwitches.map(s => s.powerDraw)],
        ['Form Factor', ...selectedSwitches.map(s => s.size)],
        ['Weight', ...selectedSwitches.map(s => s.weight)],
        ['EOS License', ...selectedSwitches.map(s => s.eosLicense || 'N/A')]
    ];

    const csvContent = [
        headers.map(safeCell).join(','),
        ...rows.map(row => row.map(safeCell).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `switch_comparison_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex flex-col animate-slide-up print:hidden">
      {/* Decorative top border glow */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
      
      <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)] border-t border-neutral-200 dark:border-neutral-800 max-h-[60vh] flex flex-col transition-colors duration-300">
        <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white/50 dark:bg-neutral-900/50 shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-1.5 rounded-md shadow-sm">
                    <ArrowDownUp size={16} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Product Comparison</h3>
                    <p className="text-xs text-neutral-500">{selectedSwitches.length} items selected</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleExportCSV}
                    className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Download CSV"
                >
                    <FileSpreadsheet size={14} /> Export CSV
                </button>
                <button 
                    onClick={handlePrint}
                    className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    title="Print or Save as PDF"
                >
                    <Printer size={14} /> Print
                </button>
                <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-1 hidden sm:block"></div>
                <button 
                    onClick={onClear} 
                    className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium px-3 py-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                >
                    Clear All
                </button>
            </div>
        </div>

        <div className="overflow-auto flex-1 p-0 scrollbar-thin">
            <table className="w-full min-w-max text-left border-collapse">
                <thead className="sticky top-0 z-20">
                    <tr>
                        <th className="sticky left-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_8px_-4px_rgba(0,0,0,0.2)] w-48 px-6 py-4 border-b border-r border-neutral-200 dark:border-neutral-800 font-semibold text-neutral-500 text-[10px] uppercase tracking-widest">
                            Feature
                        </th>
                        {selectedSwitches.map(s => (
                            <th key={s.id} className="min-w-[240px] px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 relative group">
                                <div className="flex justify-between items-start gap-3">
                                    <div className="font-bold text-neutral-900 dark:text-neutral-200 text-sm tracking-tight">{s.model}</div>
                                    <button 
                                        onClick={() => onRemove(s.id)}
                                        className="text-neutral-400 hover:text-red-500 dark:text-neutral-600 dark:hover:text-red-400 transition-colors shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="text-[11px] text-neutral-500 font-medium mt-1 inline-block px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">{s.series}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-sm text-neutral-600 dark:text-neutral-300 divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
                    <SectionRow label="Performance" />
                    <DataRow 
                        label="Throughput" 
                        hasDiff={hasDiff('throughputTbps')}
                        values={selectedSwitches.map(s => <span className={hasDiff('throughputTbps') ? "font-bold text-blue-600 dark:text-blue-400" : ""}>{s.throughputTbps} Tbps</span>)} 
                    />
                    <DataRow label="Packets/Sec" hasDiff={hasDiff('pps')} values={selectedSwitches.map(s => s.pps)} />
                    <DataRow label="Latency" hasDiff={hasDiff('latency')} values={selectedSwitches.map(s => s.latency)} />
                    
                    <SectionRow label="Port Configuration" />
                    <DataRow 
                        label="800G Ports" 
                        hasDiff={hasDiff('max800G')}
                        values={selectedSwitches.map(s => s.max800G || <span className="text-neutral-400 dark:text-neutral-700">-</span>)} 
                    />
                    <DataRow 
                        label="400G Ports" 
                        hasDiff={hasDiff('max400G')}
                        values={selectedSwitches.map(s => s.max400G || <span className="text-neutral-400 dark:text-neutral-700">-</span>)} 
                    />
                    <DataRow 
                        label="100G Ports" 
                        hasDiff={hasDiff('max100G')}
                        values={selectedSwitches.map(s => s.max100G || <span className="text-neutral-400 dark:text-neutral-700">-</span>)} 
                    />
                    <DataRow 
                        label="Details" 
                        hasDiff={hasDiff('ports')}
                        values={selectedSwitches.map(s => <span className="text-xs leading-relaxed block min-w-[200px] text-neutral-500">{s.ports}</span>)} 
                    />

                    <SectionRow label="Hardware Specs" />
                    <DataRow label="Packet Buffer" hasDiff={hasDiff('buffer')} values={selectedSwitches.map(s => s.buffer)} />
                    <DataRow label="CPU" hasDiff={hasDiff('cpu')} values={selectedSwitches.map(s => <span className="text-xs">{s.cpu}</span>)} />
                    <DataRow label="Memory" hasDiff={hasDiff('memory')} values={selectedSwitches.map(s => <span className="text-xs">{s.memory}</span>)} />

                    <SectionRow label="Physical" />
                    <DataRow label="Power" hasDiff={hasDiff('powerDraw')} values={selectedSwitches.map(s => <span className="font-mono text-xs">{s.powerDraw}</span>)} />
                    <DataRow label="Form Factor" hasDiff={hasDiff('size')} values={selectedSwitches.map(s => s.size)} />
                    <DataRow label="Weight" hasDiff={hasDiff('weight')} values={selectedSwitches.map(s => <span className="text-xs">{s.weight}</span>)} />
                    <DataRow label="EOS License" hasDiff={hasDiff('eosLicense')} values={selectedSwitches.map(s => <span className="text-xs font-mono bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-600 dark:text-neutral-400">{s.eosLicense || '-'}</span>)} />
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const SectionRow = ({ label }: { label: string }) => (
    <tr className="bg-neutral-50/50 dark:bg-neutral-800/30">
        <td colSpan={100} className="px-6 py-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest border-t border-b border-neutral-200 dark:border-neutral-800">
            {label}
        </td>
    </tr>
);

const DataRow = ({ label, values, hasDiff }: { label: string, values: React.ReactNode[], hasDiff: boolean }) => (
    <tr className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors group">
        <td className="sticky left-0 bg-white group-hover:bg-neutral-50/50 dark:bg-neutral-900 dark:group-hover:bg-neutral-800/40 transition-colors z-10 px-6 py-3 border-r border-neutral-200 dark:border-neutral-800 font-medium text-neutral-500 dark:text-neutral-400 text-xs">
            {label}
        </td>
        {values.map((val, idx) => (
            <td 
                key={idx} 
                className={`px-6 py-3 border-r border-neutral-200 dark:border-neutral-800 last:border-0 transition-opacity duration-300 ${!hasDiff ? 'opacity-40 saturate-0' : ''}`}
            >
                {val}
            </td>
        ))}
    </tr>
);

export default ComparisonDrawer;
