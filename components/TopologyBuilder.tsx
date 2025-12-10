
import React, { useState, useMemo, useEffect } from 'react';
import type { SwitchSpec } from '../types';
import { 
  X, Network, Server, HardDrive, AlertTriangle, Activity, Zap, Cpu, 
  Database, Split, Share2, Wand2, Sliders, Calculator, CheckCircle2, 
  Info, FileText, Copy, Check, Smartphone, ArrowDown, Cable, Settings2,
  Box, ArrowUpRight, GripVertical, ChevronRight, ChevronDown, Plus, Trash2,
  Link2, Rocket, Gauge, Scale, BadgeDollarSign, PieChart
} from 'lucide-react';

// --- Types ---
export type MediaType = 'dac' | 'aoc' | 'mmf' | 'smf';

export interface HostProfile {
    id: string;
    name: string;
    count: number;
    speed: number;
    redundancy: 'single' | 'dual';
    media: MediaType;
}

export interface FabricConfig {
    spineId: string;
    spineQty: number;
    spineMlag: boolean;
    spinePeerLinks: number;
    spinePeerSpeed: number;
    spinePeerMedia: MediaType;
}

export interface ClusterConfig {
    leafId: string;
    leafQty: number;
    uplinks: number;
    uplinkSpeed: number;
    fabricMedia: MediaType;
    profiles: HostProfile[];
}

interface AutoDesignResult {
    id: string;
    leafModel: SwitchSpec;
    leafQty: number;
    uplinksPerLeaf: number;
    spineModel: SwitchSpec;
    spineQty: number;
    oversubscription: number;
    breakoutMode: number;
    totalHostsSupported: number;
    type: 'Performance' | 'Density' | 'Balanced' | 'Cost Effective' | 'Breakout Optimized';
}

interface TopologyBuilderProps {
  switches: SwitchSpec[];
  onClose: () => void;
}

// --- Constants ---
const MEDIA_TYPES = [
    { id: 'smf', label: 'Single-Mode (DR/FR) - Up to 2km', desc: 'Standard for high-speed inter-rack' },
    { id: 'mmf', label: 'Multi-Mode (SR) - Up to 100m', desc: 'Short range intra-row' },
    { id: 'aoc', label: 'Active Optical (AOC) - Up to 30m', desc: 'Easy handling, medium range' },
    { id: 'dac', label: 'Copper (DAC) - Up to 3m', desc: 'Rack-local only' },
];

// --- Helpers ---
const getAristaPart = (speed: number, type: MediaType, breakout: number) => {
    if (type === 'dac') {
        if (breakout === 1) return `CAB-${speed}G-DAC`; 
        if (breakout === 4) return `CAB-${speed}G-4S-DAC`; 
        return `CAB-${speed}G-DAC-VAR`;
    }
    if (type === 'aoc') {
        if (breakout === 1) return `AOC-${speed}G`;
        return `AOC-${speed}G-4S`;
    }
    if (type === 'mmf') {
        if (speed === 10) return 'SFP-10G-SR';
        if (speed === 25) return 'SFP-25G-SR';
        if (speed === 40) return 'QSFP-40G-SR4';
        if (speed === 100) return 'QSFP-100G-SR4';
        if (speed === 400) return 'OSFP-400G-SR8';
        return `${speed}G-SR`;
    }
    if (type === 'smf') {
        if (speed === 10) return 'SFP-10G-LR';
        if (speed === 25) return 'SFP-25G-LR';
        if (speed === 100) return 'QSFP-100G-DR';
        if (speed === 400) return 'OSFP-400G-DR4';
        if (speed === 800) return 'OSFP-800G-2xDR4';
        return `${speed}G-DR/FR`;
    }
    return 'GENERIC';
};

const getCablePart = (type: MediaType) => {
    if (type === 'smf') return 'CABLE-SMF-OS2-LC';
    if (type === 'mmf') return 'CABLE-MMF-OM4-MPO';
    return null; 
};

const getValidHostSpeeds = (sw: SwitchSpec | undefined) => {
    if (!sw) return [10, 25];
    const speeds = [10, 25]; 
    if (sw.max100G > 0 || sw.ports.includes('QSFP')) speeds.push(40, 50, 100);
    if (sw.max400G > 0) {
        if (!speeds.includes(50)) speeds.push(50);
        if (!speeds.includes(100)) speeds.push(100);
        speeds.push(200, 400);
    }
    if (sw.max800G > 0) {
        if (!speeds.includes(100)) speeds.push(100);
        if (!speeds.includes(400)) speeds.push(400);
        speeds.push(800);
    }
    return speeds.sort((a,b) => a - b);
};

const getBreakoutFactor = (switchNativeSpeed: number, targetHostSpeed: number) => {
    if (targetHostSpeed >= switchNativeSpeed) return 1;
    if (switchNativeSpeed === 800) {
        if (targetHostSpeed === 400) return 2;
        if (targetHostSpeed === 200) return 4;
        if (targetHostSpeed === 100) return 8;
    }
    if (switchNativeSpeed === 400) {
        if (targetHostSpeed === 200) return 2;
        if (targetHostSpeed === 100) return 4;
        if (targetHostSpeed === 50) return 8;
    }
    if (switchNativeSpeed === 100) {
        if (targetHostSpeed === 50) return 2;
        if (targetHostSpeed === 25) return 4;
    }
    if (switchNativeSpeed === 40 && targetHostSpeed === 10) return 4;
    return 1;
};

// --- Sub-Components ---

const OversubIndicator = ({ ratio, uplinkBW, downlinkBW }: { ratio: number, uplinkBW: number, downlinkBW: number }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    let color = 'text-red-500';
    let assessment = 'High Congestion';

    if (ratio <= 1.1) { color = 'text-emerald-500'; assessment = 'Non-blocking'; }
    else if (ratio <= 2.0) { color = 'text-emerald-400'; assessment = 'Excellent'; }
    else if (ratio <= 3.0) { color = 'text-orange-500'; assessment = 'Balanced'; }
    else if (ratio <= 5.0) { color = 'text-orange-600'; assessment = 'Converged'; }

    const formatBW = (bps: number) => bps >= 1000 ? `${(bps/1000).toFixed(1)} Tbps` : `${bps.toFixed(0)} Gbps`;

    return (
        <div className="text-right relative cursor-help" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            <div className={`text-xl font-bold ${color}`}>{ratio === 0 ? 'N/A' : `${ratio.toFixed(1)}:1`}</div>
            <div className="text-[10px] uppercase font-bold text-neutral-400 border-b border-dotted border-neutral-400 inline-block">Oversub</div>
            {showTooltip && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-700 z-50 text-left animate-fade-in pointer-events-none">
                    <h4 className={`font-bold text-sm mb-1 ${color}`}>{assessment}</h4>
                    <div className="space-y-1 text-xs mt-2">
                        <div className="flex justify-between"><span className="text-neutral-500">Downlink:</span><span className="font-mono text-neutral-200">{formatBW(downlinkBW)}</span></div>
                        <div className="flex justify-between"><span className="text-neutral-500">Uplink:</span><span className="font-mono text-neutral-200">{formatBW(uplinkBW)}</span></div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatBadge = ({ label, value, icon: Icon, color = "blue" }: any) => (
    <div className="bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 shadow-sm flex items-center gap-3">
        <div className={`p-1.5 rounded-md ${color === 'red' ? 'bg-red-50 text-red-500' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500'}`}><Icon size={14} /></div>
        <div><div className="text-[10px] uppercase font-bold text-neutral-400 leading-none mb-0.5">{label}</div><div className={`text-sm font-bold leading-none ${color === 'red' ? 'text-red-500' : 'text-neutral-900 dark:text-neutral-100'}`}>{value}</div></div>
    </div>
);

const ControlGroup = ({ label, children }: any) => (
    <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{label}</label>{children}</div>
);

const SelectPill = ({ label, value, options, onChange, suffix = '' }: any) => (
    <ControlGroup label={label}>
        <div className="flex bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
            {options.map((opt: number) => (
                <button key={opt} onClick={() => onChange(opt)} className={`flex-1 py-1 text-xs font-bold rounded-md transition-all ${value === opt ? 'bg-white dark:bg-neutral-600 text-neutral-900 dark:text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}>{opt}{suffix}</button>
            ))}
        </div>
    </ControlGroup>
);

const BOMRow = ({ sku, desc, qty }: any) => (!sku || qty === 0 ? null : (
    <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
        <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">{sku}</td>
        <td className="p-4 text-neutral-600 dark:text-neutral-300">{desc}</td>
        <td className="p-4 text-right font-bold">{Math.ceil(qty)}</td>
    </tr>
));

// --- Main Views ---

const AutoArchitectView = ({ 
    switches, 
    leafOptions, 
    spineOptions, 
    onApply, 
    onCancel 
}: { 
    switches: SwitchSpec[], 
    leafOptions: SwitchSpec[], 
    spineOptions: SwitchSpec[], 
    onApply: (d: AutoDesignResult, legacy: number, growth: number, speed: number, exist: any) => void, 
    onCancel: () => void 
}) => {
    // State
    const [existStorage, setExistStorage] = useState({ ports: 34, speed: 200 });
    const [existDual, setExistDual] = useState({ ports: 18, speed: 200 });
    const [existSingle, setExistSingle] = useState({ ports: 28, speed: 200 });
    const [reqLegacy, setReqLegacy] = useState(60); 
    const [reqGrowth, setReqGrowth] = useState(140);
    const [autoFutureHostSpeed, setAutoFutureHostSpeed] = useState(100); 
    const [autoPlatformTech, setAutoPlatformTech] = useState(100); // Default to 100G as requested by prompt
    const [autoMaxOversub, setAutoMaxOversub] = useState(3.0);
    const [designs, setDesigns] = useState<AutoDesignResult[]>([]);

    const autoTargetPorts = useMemo(() => existStorage.ports + existDual.ports + existSingle.ports + reqLegacy + reqGrowth, 
        [existStorage, existDual, existSingle, reqLegacy, reqGrowth]);

    // Generator Logic
    useEffect(() => {
        const candidates: AutoDesignResult[] = [];
        
        // Helper to generate designs based on a set of leaf candidates
        const runGeneration = (leaves: SwitchSpec[], tag: string | null = null) => {
             const results: AutoDesignResult[] = [];
             const workloads = [
                { name: 'ExistStorage', count: existStorage.ports, speed: existStorage.speed },
                { name: 'ExistDual', count: existDual.ports, speed: existDual.speed },
                { name: 'ExistSingle', count: existSingle.ports, speed: existSingle.speed },
                { name: 'Legacy', count: reqLegacy, speed: autoFutureHostSpeed },
                { name: 'Growth', count: reqGrowth, speed: autoFutureHostSpeed },
            ];

             leaves.forEach(leaf => {
                const nativeSpeed = leaf.max800G > 0 ? 800 : leaf.max400G > 0 ? 400 : 100;
                const totalNativePorts = leaf.max800G || leaf.max400G || leaf.max100G || 32;
                let totalPhysicalDownlinkNeeded = 0;
                let totalDownlinkBW = 0;

                workloads.forEach(wl => {
                    if (wl.count > 0) {
                      const speedForBreakout = wl.name === 'Legacy' || wl.name === 'Growth' ? autoFutureHostSpeed : wl.speed;
                      const breakout = getBreakoutFactor(nativeSpeed, speedForBreakout);
                      totalPhysicalDownlinkNeeded += wl.count / breakout;
                      totalDownlinkBW += wl.count * speedForBreakout;
                    }
                });

                [2, 4, 8].forEach(uplinks => {
                     const availableDownlinkPortsPerSwitch = totalNativePorts - uplinks;
                     if (availableDownlinkPortsPerSwitch <= 0) return;
                     const switchesNeeded = Math.ceil(totalPhysicalDownlinkNeeded / availableDownlinkPortsPerSwitch);
                     if (switchesNeeded <= 0) return;
                     const uplinkBW = switchesNeeded * uplinks * nativeSpeed;
                     const ratio = totalDownlinkBW / uplinkBW;

                     if (ratio <= autoMaxOversub) {
                         const totalFabricUplinks = switchesNeeded * uplinks;
                         const spine = spineOptions.find(s => {
                             if (nativeSpeed === 800) return s.max800G >= 24;
                             if (nativeSpeed === 400) return s.max400G >= 24;
                             return s.max100G >= 32;
                         });

                         if (spine) {
                             results.push({
                                 id: `${leaf.id}-${uplinks}-${tag||'normal'}`,
                                 leafModel: leaf,
                                 leafQty: switchesNeeded,
                                 uplinksPerLeaf: uplinks,
                                 spineModel: spine,
                                 spineQty: Math.max(2, Math.ceil(totalFabricUplinks / (spine.max800G||spine.max400G||spine.max100G))),
                                 oversubscription: ratio,
                                 breakoutMode: getBreakoutFactor(nativeSpeed, autoFutureHostSpeed),
                                 totalHostsSupported: autoTargetPorts,
                                 type: 'Balanced' 
                             });
                         }
                     }
                });
            });
            return results;
        };

        // 1. Generate based on User Preference
        const prefCandidates = leafOptions.filter(s => {
            if (autoPlatformTech === 800) return s.max800G > 0;
            if (autoPlatformTech === 400) return s.max400G > 0;
            return s.max100G > 0;
        });
        candidates.push(...runGeneration(prefCandidates));

        // 2. Explicitly Generate a "Breakout Optimized" option using 400G switches (if user didn't select 400G)
        // This ensures we always show a density/breakout option even if user asks for 100G native.
        if (autoPlatformTech !== 400) {
             const breakoutCandidates = leafOptions.filter(s => s.max400G > 0);
             const breakoutResults = runGeneration(breakoutCandidates, 'breakout');
             // Find best breakout option
             const bestBreakout = breakoutResults.sort((a,b) => a.leafQty - b.leafQty)[0];
             if (bestBreakout) {
                 candidates.push({ ...bestBreakout, type: 'Breakout Optimized' });
             }
        }

        // Rank and Filter
        const results: AutoDesignResult[] = [];
        
        // Performance Option
        const perf = [...candidates].sort((a,b) => a.oversubscription - b.oversubscription)[0];
        if(perf) results.push({ ...perf, type: 'Performance' });

        // Cost Option
        const cost = [...candidates].sort((a,b) => (a.leafQty + a.spineQty) - (b.leafQty + b.spineQty))[0];
        if(cost && !results.find(r => r.id === cost.id)) results.push({ ...cost, type: 'Cost Effective' });

        // Breakout/Density Option
        // Prefer explicit 'Breakout Optimized' type if available, otherwise find best density
        const bo = candidates.find(c => c.type === 'Breakout Optimized');
        if (bo && !results.find(r => r.id === bo.id)) {
             results.push(bo);
        } else {
             const density = [...candidates].sort((a,b) => (b.totalHostsSupported / b.leafQty) - (a.totalHostsSupported / a.leafQty))[0]; 
             if(density && !results.find(r => r.id === density.id)) results.push({ ...density, type: 'Density' });
        }
        
        setDesigns(results);
    }, [autoTargetPorts, autoFutureHostSpeed, autoPlatformTech, autoMaxOversub, existStorage, existDual, existSingle, reqLegacy, reqGrowth]);

    return (
        <div className="flex-1 flex flex-col md:flex-row h-full">
            {/* Inputs Panel */}
            <div className="w-full md:w-96 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-8 flex flex-col z-20 shadow-xl overflow-y-auto">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Wand2 size={24} /> AI Architect
                    </h2>
                    <p className="text-sm text-neutral-500 mt-2 leading-relaxed">Input requirements to generate optimal topologies.</p>
                </div>
                
                <div className="space-y-6">
                    {/* Capacity Planning */}
                    <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
                         <div className="flex items-center gap-2 mb-4">
                            <PieChart size={16} className="text-blue-500" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Capacity Planning</h3>
                         </div>
                         <div className="space-y-4">
                             <div className="space-y-2">
                                 <div className="text-[10px] font-bold text-neutral-400 uppercase">Existing Node Connections</div>
                                 <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 space-y-2">
                                     {/* Inputs for Existing Infra */}
                                     {['Storage', 'Dual-Conn', 'Single-Conn'].map((label, i) => {
                                         const [val, setVal] = i === 0 ? [existStorage, setExistStorage] : i === 1 ? [existDual, setExistDual] : [existSingle, setExistSingle];
                                         return (
                                            <div key={label} className="grid grid-cols-4 gap-2 items-center">
                                                <span className="col-span-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 pl-1">{label}</span>
                                                <input type="number" value={val.ports} onChange={e=>setVal({...val, ports: Number(e.target.value)})} className="w-full text-center bg-neutral-50 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-xs py-1" />
                                                <input type="number" value={val.speed} onChange={e=>setVal({...val, speed: Number(e.target.value)})} className="w-full text-center bg-neutral-50 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700 text-xs py-1" />
                                            </div>
                                         );
                                     })}
                                 </div>
                             </div>
                             <ControlGroup label="Legacy Migration (Ports)">
                                 <input type="number" value={reqLegacy} onChange={e => setReqLegacy(Number(e.target.value))} className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-bold"/>
                             </ControlGroup>
                             <ControlGroup label="Growth Buffer (Ports)">
                                 <input type="number" value={reqGrowth} onChange={e => setReqGrowth(Number(e.target.value))} className="w-full p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md text-sm font-bold text-emerald-600"/>
                             </ControlGroup>
                             <div className="pt-2 border-t border-dashed border-neutral-300 dark:border-neutral-700 flex justify-between items-center">
                                 <span className="text-xs font-bold text-neutral-500">TOTAL TARGET</span>
                                 <span className="text-lg font-black text-blue-600 dark:text-blue-400">{autoTargetPorts} Ports</span>
                             </div>
                         </div>
                    </div>

                    <ControlGroup label="Future Potential Host Speed">
                         <div className="grid grid-cols-3 gap-2">
                            {[10, 25, 50, 100, 200, 400].map(s => (
                                <button key={s} onClick={() => setAutoFutureHostSpeed(s)} className={`py-2 rounded-lg text-sm font-bold border transition-all ${autoFutureHostSpeed === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-blue-400'}`}>{s}G</button>
                            ))}
                         </div>
                    </ControlGroup>
                    <ControlGroup label="Preferred Switch Tech">
                         <div className="grid grid-cols-2 gap-2">
                            {[100, 400, 800].map(s => (
                                <button key={s} onClick={() => setAutoPlatformTech(s)} className={`py-2 rounded-lg text-sm font-bold border transition-all ${autoPlatformTech === s ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700 hover:border-purple-400'}`}>{s}G Native</button>
                            ))}
                         </div>
                    </ControlGroup>
                    <ControlGroup label="Max Oversubscription">
                        <div className="flex items-center gap-4">
                            <input type="range" min="1.0" max="10.0" step="0.5" value={autoMaxOversub} onChange={e => setAutoMaxOversub(Number(e.target.value))} className="flex-1 accent-orange-500" />
                            <span className="font-mono font-bold text-orange-600">{autoMaxOversub}:1</span>
                        </div>
                    </ControlGroup>
                </div>
                <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-800">
                    <button onClick={onCancel} className="w-full py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2">
                        <Sliders size={16} /> Switch to Manual Mode
                    </button>
                </div>
            </div>

            {/* Results Panel */}
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 p-8 overflow-y-auto relative">
                 <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none"></div>
                 <div className="max-w-4xl mx-auto space-y-6 relative z-10">
                     <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Recommended Designs</h3>
                     {designs.map((design, idx) => (
                         <div key={idx} className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg border-2 overflow-hidden hover:scale-[1.01] transition-all group ${design.type === 'Breakout Optimized' ? 'border-purple-500 dark:border-purple-600' : 'border-neutral-200 dark:border-neutral-800 hover:border-blue-500'}`}>
                             <div className="p-6 flex flex-col md:flex-row gap-6">
                                 <div className="w-full md:w-48 flex flex-col justify-center items-center p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-100 dark:border-neutral-800 relative overflow-hidden">
                                     {design.type === 'Breakout Optimized' && <div className="absolute top-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">HIGH DENSITY</div>}
                                     <div className={`p-3 rounded-full mb-3 ${
                                         design.type === 'Performance' ? 'bg-emerald-100 text-emerald-600' : 
                                         design.type === 'Cost Effective' ? 'bg-amber-100 text-amber-600' : 
                                         design.type === 'Breakout Optimized' ? 'bg-purple-100 text-purple-600' :
                                         'bg-blue-100 text-blue-600'
                                     }`}>
                                         {design.type === 'Performance' ? <Rocket size={24} /> : 
                                          design.type === 'Cost Effective' ? <BadgeDollarSign size={24} /> : 
                                          design.type === 'Breakout Optimized' ? <Split size={24} /> :
                                          <Scale size={24} />}
                                     </div>
                                     <div className="font-bold text-center text-neutral-900 dark:text-neutral-100 leading-tight">{design.type}</div>
                                     <div className="text-xs text-neutral-500 mt-1">{design.oversubscription.toFixed(2)}:1 Oversub</div>
                                 </div>
                                 <div className="flex-1 grid grid-cols-2 gap-6">
                                     <div>
                                         <div className="text-xs font-bold uppercase text-neutral-400 mb-2">Leaf Layer</div>
                                         <div className="flex items-center gap-3 mb-1">
                                             <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{design.leafQty}x</div>
                                             <div className="text-sm text-neutral-600 dark:text-neutral-300">{design.leafModel.model}</div>
                                         </div>
                                         <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 italic">{design.leafModel.description}</div>
                                         {design.breakoutMode > 1 && (
                                             <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase rounded border border-orange-200 dark:border-orange-800">
                                                 <Split size={10} /> Using {design.breakoutMode}x Breakout Cables
                                             </div>
                                         )}
                                         <ul className="text-xs text-neutral-500 space-y-1">
                                             <li className="flex items-center gap-1"><Check size={10} /> {design.uplinksPerLeaf}x Uplinks</li>
                                             <li className="flex items-center gap-1">
                                                 <Check size={10} /> 
                                                 Support for {autoFutureHostSpeed}G Hosts 
                                                 {design.breakoutMode > 1 && <span className="text-neutral-400 ml-1">(via {design.breakoutMode}x Breakout)</span>}
                                             </li>
                                         </ul>
                                     </div>
                                     <div>
                                         <div className="text-xs font-bold uppercase text-neutral-400 mb-2">Spine Layer</div>
                                         <div className="flex items-center gap-3 mb-1">
                                             <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{design.spineQty}x</div>
                                             <div className="text-sm text-neutral-600 dark:text-neutral-300">{design.spineModel.model}</div>
                                         </div>
                                         <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 italic">{design.spineModel.description}</div>
                                     </div>
                                 </div>
                                 <div className="flex flex-col justify-center">
                                     <button onClick={() => onApply(design, reqLegacy, reqGrowth, autoFutureHostSpeed, {existStorage, existDual, existSingle})} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md transition-all whitespace-nowrap">
                                         Visualize
                                     </button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

const BOMOverlay = ({ fabric, compute, storage, onClose, switches }: { fabric: FabricConfig, compute: ClusterConfig, storage: ClusterConfig, onClose: () => void, switches: SwitchSpec[] }) => {
    const getModel = (id: string) => switches.find(s => s.id === id);
    const selSpine = getModel(fabric.spineId);
    const selCompute = getModel(compute.leafId);
    const selStorage = getModel(storage.leafId);

    const getBreakout = (sw: SwitchSpec | undefined, target: number) => {
        if (!sw) return 1;
        const native = sw.max800G > 0 ? 800 : sw.max400G > 0 ? 400 : 100;
        return getBreakoutFactor(native, target);
    };

    return (
        <div className="absolute inset-0 z-50 bg-white dark:bg-neutral-900 p-8 flex flex-col animate-fade-in">
              <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold">Bill of Materials</h2>
                      <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><X/></button>
                  </div>
                  <div className="flex-1 overflow-auto border border-neutral-200 dark:border-neutral-800 rounded-lg">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-neutral-50 dark:bg-neutral-800 text-[10px] uppercase font-bold text-neutral-500">
                              <tr>
                                  <th className="p-4">SKU</th>
                                  <th className="p-4">Description</th>
                                  <th className="p-4 text-right">Qty</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                              {/* Hardware */}
                              <BOMRow sku={selSpine?.model} desc={selSpine?.description} qty={fabric.spineQty} />
                              <BOMRow sku={selCompute?.model} desc={selCompute?.description} qty={compute.leafQty} />
                              <BOMRow sku={selStorage?.model} desc={selStorage?.description} qty={storage.leafQty} />
                              
                              {/* Spine MLAG */}
                              {fabric.spineMlag && fabric.spineQty >= 2 && (
                                <>
                                    {getCablePart(fabric.spinePeerMedia) && (
                                        <BOMRow sku={getCablePart(fabric.spinePeerMedia)} desc={`Spine Peer Fiber Cable (${fabric.spinePeerMedia})`} qty={Math.floor(fabric.spineQty / 2) * fabric.spinePeerLinks} />
                                    )}
                                    <BOMRow 
                                        sku={getAristaPart(fabric.spinePeerSpeed, fabric.spinePeerMedia, 1)}
                                        desc={`Spine Peer ${['dac','aoc'].includes(fabric.spinePeerMedia) ? 'Cable' : 'Transceiver'}`}
                                        qty={(Math.floor(fabric.spineQty / 2) * fabric.spinePeerLinks) * (['dac','aoc'].includes(fabric.spinePeerMedia) ? 1 : 2)}
                                    />
                                </>
                              )}

                              {/* Fabric Links */}
                              {[compute, storage].map((cluster, i) => (
                                <React.Fragment key={i}>
                                   {getCablePart(cluster.fabricMedia) && (
                                     <BOMRow sku={getCablePart(cluster.fabricMedia)} desc={`${i===0?'Compute':'Storage'} Fabric Cable`} qty={cluster.leafQty * cluster.uplinks} />
                                   )}
                                   <BOMRow 
                                    sku={getAristaPart(cluster.uplinkSpeed, cluster.fabricMedia, 1)} 
                                    desc={`${i===0?'Compute':'Storage'} Fabric Optic/Cable`} 
                                    qty={(cluster.leafQty * cluster.uplinks) * (['dac','aoc'].includes(cluster.fabricMedia) ? 1 : 2)} 
                                  />
                                </React.Fragment>
                              ))}

                              {/* Host Links */}
                              {[...compute.profiles, ...storage.profiles].map((p, i) => {
                                  const parent = compute.profiles.includes(p) ? selCompute : selStorage;
                                  const breakout = getBreakout(parent, p.speed);
                                  const totalLinks = p.count * (p.redundancy === 'dual' ? 2 : 1);
                                  const cableQty = Math.ceil(totalLinks / breakout);
                                  
                                  return (
                                    <React.Fragment key={i}>
                                        {getCablePart(p.media) && <BOMRow sku={getCablePart(p.media)} desc={`Host Fiber (${p.name})`} qty={cableQty} />}
                                        <BOMRow 
                                            sku={getAristaPart(p.speed, p.media, breakout)} 
                                            desc={`Host Optic/Cable (${p.name})`} 
                                            qty={cableQty * (['dac','aoc'].includes(p.media) ? 1 : 2)} 
                                        />
                                    </React.Fragment>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
    );
};

// --- Main Container ---
const TopologyBuilder: React.FC<TopologyBuilderProps> = ({ switches, onClose }) => {
  const [viewMode, setViewMode] = useState<'manual' | 'auto'>('manual');
  const [activeLayer, setActiveLayer] = useState<'fabric' | 'compute' | 'storage'>('fabric');
  const [showBOM, setShowBOM] = useState(false);

  // Initial Data Lookups
  const spineOptions = useMemo(() => switches.filter(s => s.type === 'Spine Switch' || s.max400G >= 24).sort((a,b) => a.model.localeCompare(b.model)), [switches]);
  const leafOptions = useMemo(() => switches.filter(s => s.series.includes('7050') || s.series.includes('7280')).sort((a,b) => a.model.localeCompare(b.model)), [switches]);
  const getDefault = (opts: SwitchSpec[], pref: string) => opts.find(s => s.model.includes(pref))?.id || opts[0]?.id;

  // State Config Objects
  const [fabric, setFabric] = useState<FabricConfig>({
      spineId: getDefault(spineOptions, '7060'),
      spineQty: 2,
      spineMlag: false,
      spinePeerLinks: 2,
      spinePeerSpeed: 400,
      spinePeerMedia: 'dac'
  });

  const [compute, setCompute] = useState<ClusterConfig>({
      leafId: getDefault(leafOptions, '7280DR3A-36'),
      leafQty: 8,
      uplinks: 4,
      uplinkSpeed: 100,
      fabricMedia: 'smf',
      profiles: [{ id: 'c1', name: 'General Compute', count: 32, speed: 100, redundancy: 'dual', media: 'dac' }]
  });

  const [storage, setStorage] = useState<ClusterConfig>({
      leafId: getDefault(leafOptions, '7280DR3A-36'),
      leafQty: 4,
      uplinks: 4,
      uplinkSpeed: 100,
      fabricMedia: 'smf',
      profiles: [{ id: 's1', name: 'Storage Nodes', count: 32, speed: 100, redundancy: 'dual', media: 'dac' }]
  });

  // Derived Calculations for Visualizer
  const selSpine = switches.find(s => s.id === fabric.spineId);
  const selCompute = switches.find(s => s.id === compute.leafId);
  const selStorage = switches.find(s => s.id === storage.leafId);

  const calcClusterStats = (config: ClusterConfig, model: SwitchSpec | undefined) => {
      let usedPorts = 0, totalBW = 0, totalHosts = 0;
      config.profiles.forEach(p => {
          const native = model?.max800G ? 800 : model?.max400G ? 400 : 100;
          const breakout = getBreakoutFactor(native, p.speed);
          const lanes = p.count * (p.redundancy === 'dual' ? 2 : 1);
          usedPorts += Math.ceil(lanes / breakout);
          totalBW += lanes * p.speed;
          totalHosts += p.count;
      });
      const uplinkBW = config.leafQty * config.uplinks * config.uplinkSpeed;
      const oversub = uplinkBW > 0 ? totalBW / uplinkBW : 0;
      const totalAvailable = config.leafQty * Math.max(0, (model?.max400G||model?.max100G||32) - config.uplinks);
      
      return { usedPorts, totalBW, totalHosts, uplinkBW, oversub, totalAvailable };
  };

  const compStats = calcClusterStats(compute, selCompute);
  const storStats = calcClusterStats(storage, selStorage);

  const totalSpineUsed = (compute.leafQty * compute.uplinks) + (storage.leafQty * storage.uplinks) + (fabric.spineMlag ? Math.floor(fabric.spineQty/2)*fabric.spinePeerLinks*2 : 0);
  const spineCap = fabric.spineQty * ((selSpine?.max800G||0) + (selSpine?.max400G||0) + (selSpine?.max100G||0) || 32);
  const spineUtil = (totalSpineUsed / spineCap) * 100;

  // Effects to sync defaults
  useEffect(() => {
     if(selCompute) setCompute(c => ({...c, uplinkSpeed: selCompute.max400G>0?400:100}));
     if(selStorage) setStorage(c => ({...c, uplinkSpeed: selStorage.max400G>0?400:100}));
  }, [compute.leafId, storage.leafId]);

  // Apply Auto Design
  const handleApplyAuto = (design: AutoDesignResult, legacy: number, growth: number, speed: number, exist: any) => {
      setFabric({ ...fabric, spineId: design.spineModel.id, spineQty: design.spineQty });
      setCompute({ 
          ...compute, 
          leafId: design.leafModel.id, 
          leafQty: design.leafQty, 
          uplinks: design.uplinksPerLeaf,
          uplinkSpeed: design.leafModel.max800G?800:design.leafModel.max400G?400:100,
          profiles: [
              ...(exist.existStorage.ports > 0 ? [{ id: crypto.randomUUID(), name: 'Exist Storage', count: exist.existStorage.ports, speed: exist.existStorage.speed, redundancy: 'single' as const, media: 'dac' as const }] : []),
              ...(exist.existDual.ports > 0 ? [{ id: crypto.randomUUID(), name: 'Exist Dual', count: exist.existDual.ports/2, speed: exist.existDual.speed, redundancy: 'dual' as const, media: 'dac' as const }] : []),
              ...(exist.existSingle.ports > 0 ? [{ id: crypto.randomUUID(), name: 'Exist Single', count: exist.existSingle.ports, speed: exist.existSingle.speed, redundancy: 'single' as const, media: 'dac' as const }] : []),
              ...(legacy > 0 ? [{ id: crypto.randomUUID(), name: 'Legacy', count: legacy, speed: speed, redundancy: 'single' as const, media: 'dac' as const }] : []),
              ...(growth > 0 ? [{ id: crypto.randomUUID(), name: 'Growth', count: growth, speed: speed, redundancy: 'single' as const, media: 'dac' as const }] : []),
          ]
      });
      setViewMode('manual');
      setActiveLayer('compute');
  };

  // Profile Helpers
  const updateProfile = (setter: React.Dispatch<React.SetStateAction<ClusterConfig>>, id: string, field: keyof HostProfile, val: any) => {
      setter(prev => ({ ...prev, profiles: prev.profiles.map(p => p.id === id ? { ...p, [field]: val } : p) }));
  };
  const addProfile = (setter: React.Dispatch<React.SetStateAction<ClusterConfig>>, model: SwitchSpec | undefined) => {
      let speed = 100;
      let count = 32;

      if (model) {
          const validSpeeds = getValidHostSpeeds(model);
          if (!validSpeeds.includes(100) && validSpeeds.length > 0) {
              speed = validSpeeds[validSpeeds.length - 1];
          }
          count = model.max800G || model.max400G || model.max100G || 32;
      }
      setter(prev => ({ ...prev, profiles: [...prev.profiles, { id: crypto.randomUUID(), name: 'New Group', count, speed, redundancy: 'dual', media: 'dac' }] }));
  };
  const removeProfile = (setter: React.Dispatch<React.SetStateAction<ClusterConfig>>, id: string) => {
      setter(prev => ({ ...prev, profiles: prev.profiles.filter(p => p.id !== id) }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[90vh] flex overflow-hidden border border-neutral-200 dark:border-neutral-800 relative">
        
        {viewMode === 'auto' ? (
            <AutoArchitectView 
                switches={switches} 
                leafOptions={leafOptions} 
                spineOptions={spineOptions} 
                onApply={handleApplyAuto} 
                onCancel={() => setViewMode('manual')} 
            />
        ) : (
            <>
                {/* Visualizer Panel (Left) */}
                <div className="flex-1 relative bg-neutral-100 dark:bg-neutral-950 flex flex-col overflow-hidden">
                    <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start pointer-events-none">
                        <div>
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-3"><Network className="text-blue-500"/> Topology Visualizer</h2>
                        </div>
                        <div className="flex gap-4 pointer-events-auto">
                            <button onClick={() => setViewMode('auto')} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"><Wand2 size={14}/> AI Architect</button>
                            <StatBadge label="Total Fabric" value={`${((compStats.uplinkBW + storStats.uplinkBW)/1000).toFixed(1)} Tbps`} icon={Activity} />
                            <StatBadge label="Spine Ports" value={`${spineUtil.toFixed(0)}%`} icon={Zap} color={spineUtil > 100 ? 'red' : 'emerald'} />
                            <button onClick={() => setShowBOM(true)} className="bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 px-4 py-2 rounded-lg font-bold text-xs border border-neutral-200 dark:border-neutral-700 shadow-sm hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2"><FileText size={14}/> BOM</button>
                            <button onClick={onClose} className="bg-white dark:bg-neutral-800 p-2 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 hover:text-red-500 transition-colors"><X size={20}/></button>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center gap-16 p-8 pt-24 overflow-y-auto">
                         {/* Spine Layer Render */}
                         <div onClick={() => setActiveLayer('fabric')} className={`relative group cursor-pointer transition-all duration-300 ${activeLayer === 'fabric' ? 'scale-105' : 'opacity-70 hover:opacity-100'}`}>
                            <div className="flex justify-center gap-4">
                                {Array.from({length: Math.min(fabric.spineQty, 8)}).map((_, i) => (
                                    <div key={i} className={`w-28 h-16 rounded-lg border-2 bg-white dark:bg-neutral-900 flex flex-col items-center justify-center shadow-sm relative ${activeLayer === 'fabric' ? 'border-purple-500 ring-4 ring-purple-500/10' : 'border-neutral-300 dark:border-neutral-700'}`}>
                                        <span className="text-[10px] uppercase font-bold text-purple-600 mb-0.5">Spine {i+1}</span>
                                        <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-300 truncate w-24 text-center">{selSpine?.model}</span>
                                        {fabric.spineMlag && i % 2 === 0 && i < fabric.spineQty - 1 && <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-1 bg-purple-300 dark:bg-purple-700 z-10" title="MLAG Peer Link"></div>}
                                    </div>
                                ))}
                            </div>
                            <div className="absolute top-full left-0 w-full h-16 pointer-events-none">
                                <svg className="absolute inset-0 w-full h-full overflow-visible">
                                    <path d="M 50% 0 L 25% 64" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" fill="none" className="dark:stroke-neutral-700" />
                                    <path d="M 50% 0 L 75% 64" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4" fill="none" className="dark:stroke-neutral-700" />
                                </svg>
                            </div>
                         </div>

                         {/* Leaf Layers */}
                         <div className="flex w-full max-w-5xl justify-around gap-12 mt-4">
                            {/* Compute Node */}
                            <div onClick={() => setActiveLayer('compute')} className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm ${activeLayer === 'compute' ? 'border-blue-500 shadow-xl ring-1 ring-blue-500/20' : 'border-transparent hover:border-blue-200 dark:hover:border-blue-900'}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3"><div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400"><Cpu size={20}/></div><div><h3 className="font-bold text-neutral-900 dark:text-neutral-100">Compute</h3><p className="text-xs text-neutral-500 font-mono">{selCompute?.model}</p></div></div>
                                    <OversubIndicator ratio={compStats.oversub} uplinkBW={compStats.uplinkBW} downlinkBW={compStats.totalBW} />
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    {Array.from({length: Math.min(compute.leafQty, 8)}).map((_, i) => <div key={i} className="w-14 h-20 bg-blue-50 dark:bg-blue-900/10 rounded border border-blue-200 dark:border-blue-800 flex flex-col items-center justify-between py-1.5 shadow-sm"><div className="w-8 h-0.5 bg-blue-300"></div><div className="text-[9px] font-mono text-neutral-500">{i+1}</div></div>)}
                                    {compute.leafQty > 8 && <div className="w-14 h-20 flex items-center justify-center text-xs font-bold text-blue-400">+{compute.leafQty-8}</div>}
                                </div>
                                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500"><span className="font-bold text-neutral-700 dark:text-neutral-300">{compStats.totalHosts}</span> Hosts</div>
                            </div>

                            {/* Storage Node */}
                            <div onClick={() => setActiveLayer('storage')} className={`flex-1 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer relative bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm ${activeLayer === 'storage' ? 'border-orange-500 shadow-xl ring-1 ring-orange-500/20' : 'border-transparent hover:border-orange-200 dark:hover:border-orange-900'}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3"><div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg text-orange-600 dark:text-orange-400"><Database size={20}/></div><div><h3 className="font-bold text-neutral-900 dark:text-neutral-100">Storage</h3><p className="text-xs text-neutral-500 font-mono">{selStorage?.model}</p></div></div>
                                    <OversubIndicator ratio={storStats.oversub} uplinkBW={storStats.uplinkBW} downlinkBW={storStats.totalBW} />
                                </div>
                                <div className="flex flex-wrap justify-center gap-2 mb-4">
                                    {Array.from({length: Math.min(storage.leafQty, 6)}).map((_, i) => <div key={i} className="w-16 h-12 bg-orange-50 dark:bg-orange-900/10 rounded border border-orange-200 dark:border-orange-800 flex flex-col items-center justify-center shadow-sm"><HardDrive size={14} className="text-orange-400 mb-1"/></div>)}
                                </div>
                                <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500"><span className="font-bold text-neutral-700 dark:text-neutral-300">{storStats.totalHosts}</span> Hosts</div>
                            </div>
                         </div>
                    </div>
                </div>

                {/* Controls Panel (Right) */}
                <div className="w-96 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 flex flex-col h-full z-20 shadow-xl overflow-y-auto">
                    <div className={`p-6 border-b border-neutral-100 dark:border-neutral-800 ${activeLayer === 'fabric' ? 'bg-purple-50 dark:bg-purple-900/10' : activeLayer === 'compute' ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-orange-50 dark:bg-orange-900/10'}`}>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Configuration</span>
                        <h2 className="text-xl font-bold capitalize">{activeLayer} Layer</h2>
                    </div>
                    
                    <div className="p-6 space-y-8">
                        {activeLayer === 'fabric' && (
                            <div className="space-y-6">
                                <ControlGroup label="Hardware Model">
                                    <select className="input-field" value={fabric.spineId} onChange={e => setFabric({...fabric, spineId: e.target.value})}>{spineOptions.map(s => <option key={s.id} value={s.id}>{s.model}</option>)}</select>
                                </ControlGroup>
                                <ControlGroup label="Spine Plane Count">
                                    <div className="flex items-center gap-4"><input type="range" min={1} max={8} value={fabric.spineQty} onChange={e => setFabric({...fabric, spineQty: Number(e.target.value)})} className="flex-1 accent-purple-600" /><span className="font-mono font-bold text-lg text-purple-600">{fabric.spineQty}</span></div>
                                </ControlGroup>
                                <ControlGroup label="MLAG Peering">
                                    <div className="flex items-center justify-between"><label className="text-xs">Enable</label><button onClick={() => setFabric({...fabric, spineMlag: !fabric.spineMlag})} className={`w-8 h-4 rounded-full transition-colors ${fabric.spineMlag ? 'bg-purple-600' : 'bg-neutral-300'}`}><div className={`w-3 h-3 rounded-full bg-white transform transition-transform ${fabric.spineMlag ? 'translate-x-4' : 'translate-x-0.5'} mt-0.5`}></div></button></div>
                                    {fabric.spineMlag && <div className="mt-2 space-y-2"><SelectPill label="Links" value={fabric.spinePeerLinks} options={[2,4]} onChange={(v:number)=>setFabric({...fabric, spinePeerLinks: v})} /><SelectPill label="Speed" value={fabric.spinePeerSpeed} options={[100,400]} onChange={(v:number)=>setFabric({...fabric, spinePeerSpeed: v})} suffix="G" /></div>}
                                </ControlGroup>
                            </div>
                        )}
                        {(activeLayer === 'compute' || activeLayer === 'storage') && (
                            <div className="space-y-6">
                                {(() => {
                                    const [cfg, setCfg] = activeLayer === 'compute' ? [compute, setCompute] : [storage, setStorage];
                                    const opts = leafOptions;
                                    const model = activeLayer === 'compute' ? selCompute : selStorage;
                                    const validSpeeds = getValidHostSpeeds(model);

                                    return (
                                        <>
                                            <ControlGroup label="Leaf Model">
                                                <select className="input-field" value={cfg.leafId} onChange={e => setCfg({...cfg, leafId: e.target.value})}>{opts.map(s => <option key={s.id} value={s.id}>{s.model}</option>)}</select>
                                            </ControlGroup>
                                            <ControlGroup label="Quantity">
                                                <div className="flex items-center gap-4"><button onClick={() => setCfg({...cfg, leafQty: Math.max(1, cfg.leafQty-1)})} className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 font-bold">-</button><span className="font-bold text-lg">{cfg.leafQty}</span><button onClick={() => setCfg({...cfg, leafQty: cfg.leafQty+1})} className="w-8 h-8 rounded bg-neutral-100 dark:bg-neutral-800 font-bold">+</button></div>
                                            </ControlGroup>
                                            <div className="grid grid-cols-2 gap-3">
                                                <SelectPill label="Uplinks" value={cfg.uplinks} options={[2,4,8]} onChange={(v:number)=>setCfg({...cfg, uplinks:v})} />
                                                <SelectPill label="Speed" value={cfg.uplinkSpeed} options={[100,400]} onChange={(v:number)=>setCfg({...cfg, uplinkSpeed:v})} suffix="G" />
                                            </div>
                                            <ControlGroup label="Fabric Media">
                                                <select className="input-field" value={cfg.fabricMedia} onChange={e => setCfg({...cfg, fabricMedia: e.target.value as MediaType})}>{MEDIA_TYPES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
                                            </ControlGroup>
                                            <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800"></div>
                                            <div className="flex justify-between items-center"><h3 className="text-sm font-bold">Host Profiles</h3><button onClick={() => addProfile(setCfg, model)} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded flex items-center gap-1"><Plus size={12}/> Add</button></div>
                                            <div className="space-y-3">
                                                {cfg.profiles.map(p => (
                                                    <div key={p.id} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 relative group">
                                                        <button onClick={() => removeProfile(setCfg, p.id)} className="absolute top-2 right-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={12}/></button>
                                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                                            <ControlGroup label="Count"><input type="number" value={p.count} onChange={e => updateProfile(setCfg, p.id, 'count', Number(e.target.value))} className="input-field py-1" /></ControlGroup>
                                                            <ControlGroup label="Speed"><select value={p.speed} onChange={e => updateProfile(setCfg, p.id, 'speed', Number(e.target.value))} className="input-field py-1">{validSpeeds.map(s => <option key={s} value={s}>{s}G</option>)}</select></ControlGroup>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2">
                                                             <ControlGroup label="Redundancy"><div className="flex bg-neutral-200 dark:bg-neutral-700 rounded p-0.5"><button onClick={() => updateProfile(setCfg, p.id, 'redundancy', 'single')} className={`flex-1 text-[9px] rounded ${p.redundancy === 'single' ? 'bg-white shadow' : ''}`}>Single</button><button onClick={() => updateProfile(setCfg, p.id, 'redundancy', 'dual')} className={`flex-1 text-[9px] rounded ${p.redundancy === 'dual' ? 'bg-white shadow' : ''}`}>Dual</button></div></ControlGroup>
                                                             <ControlGroup label="Media"><select value={p.media} onChange={e => updateProfile(setCfg, p.id, 'media', e.target.value)} className="input-field py-1">{MEDIA_TYPES.map(m => <option key={m.id} value={m.id}>{m.id.toUpperCase()}</option>)}</select></ControlGroup>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </>
        )}

        {showBOM && <BOMOverlay fabric={fabric} compute={compute} storage={storage} switches={switches} onClose={() => setShowBOM(false)} />}
      </div>
    </div>
  );
};

export default TopologyBuilder;
