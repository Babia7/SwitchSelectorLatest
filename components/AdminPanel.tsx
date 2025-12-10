
import React, { useState, useMemo } from 'react';
import type { SwitchSpec, FeedbackItem } from '../types';
import { 
  ShieldCheck, X, ListTodo, MessageSquare, Tag, 
  Box, DollarSign, Terminal, Command, Filter, 
  Download, Trash2, User, Search, StickyNote 
} from 'lucide-react';

const improvementRoadmap = [
  {
    category: "Physical Infrastructure & Site Planning",
    icon: Box,
    items: [
      { title: "Interactive Rack Elevation Builder", desc: "Drag-and-drop visualization to stack selected switches into 42U/48U cabinets. Automatically calculates total weight, power draw per rack, and available RU space." },
      { title: "Thermal & Airflow Mapping", desc: "Visualize hot-aisle/cold-aisle requirements based on the selected 'Front-to-Rear' or 'Rear-to-Front' airflow configurations of specific SKUs." },
      { title: "Cable Management Calculator", desc: "Estimate the volume of cabling for vertical managers based on the BOM's cable counts and diameters (DAC vs Fiber)." }
    ]
  },
  {
    category: "Financial & Lifecycle Intelligence",
    icon: DollarSign,
    items: [
      { title: "TCO & Power Cost Analyzer", desc: "Calculate 5-year Total Cost of Ownership including CAPEX (Hardware) and OPEX (Power/Cooling) based on local kWh rates and typical BTU output." },
      { title: "Lifecycle Status Indicators", desc: "Integration with official support APIs to show 'Active', 'End of Sale', or 'End of Life' status badges on switch cards." },
      { title: "Competitor Cross-Reference", desc: "Search by Cisco Nexus, Juniper QFX, or Mellanox models to auto-suggest the equivalent Arista platform based on ASIC generation and buffer size." }
    ]
  },
  {
    category: "Automation & NetOps",
    icon: Terminal,
    items: [
      { title: "EOS Config Generator", desc: "Generate downloadable EOS CLI configuration snippets (MLAG, BGP Underlay, EVPN Overlay) tailored to the specific port mappings of the generated topology." },
      { title: "Zero Touch Provisioning (ZTP) Scripts", desc: "Auto-create ZTP boot scripts compatible with CloudVision to provision the selected BOM hardware." },
      { title: "Ansible Inventory Export", desc: "Export the designed topology as a structured Ansible Inventory (YAML) file for Infrastructure-as-Code pipelines." }
    ]
  },
  {
    category: "Immersive Experience & UX",
    icon: Command,
    items: [
      { title: "3D Product Viewer", desc: "Replace static product images with rotatable 3D models to allow inspection of port layouts, fan modules, and power supplies." },
      { title: "Guided 'Solution Wizard'", desc: "Non-technical questionnaire (e.g., 'I need to connect 500 IP Cameras') that recommends a full topology without requiring networking knowledge." }
    ]
  },
  {
    category: "Advanced Hardware Filtering",
    icon: Filter,
    items: [
      { title: "ASIC Generation Filter", desc: "Filter models by underlying silicon (e.g., Tomahawk 4/5, Jericho 2/3) for low-latency vs deep-buffer architectural decisions." },
      { title: "Routing Scale Classification", desc: "Distinguish between 'Internet Scale' (>2M routes) and 'Enterprise Scale' based on FIB capacity." }
    ]
  }
];

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackItem[];
  onClearFeedback: () => void;
  switches: SwitchSpec[];
  notes: Record<string, string>;
  onSaveNote: (id: string, note: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  feedback, 
  onClearFeedback, 
  switches, 
  notes, 
  onSaveNote 
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'feedback' | 'inventory'>('roadmap');
  const [adminSearch, setAdminSearch] = useState('');

  const adminInventoryList = useMemo(() => {
    const term = adminSearch.toLowerCase();
    return switches.filter(s => 
        s.model.toLowerCase().includes(term) || 
        (notes[s.id] && notes[s.id].toLowerCase().includes(term))
    );
  }, [adminSearch, notes, switches]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
            <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Admin Console</h2>
                <p className="text-xs text-neutral-500">System management & planning</p>
            </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
            <button 
                onClick={() => setActiveTab('roadmap')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'roadmap' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
            >
                <ListTodo size={16} /> Improvements Roadmap
            </button>
            <button 
                onClick={() => setActiveTab('feedback')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'feedback' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
            >
                <MessageSquare size={16} /> User Feedback
                {feedback.length > 0 && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full">{feedback.length}</span>}
            </button>
            <button 
                onClick={() => setActiveTab('inventory')}
                className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
            >
                <Tag size={16} /> Inventory & Notes
                {Object.keys(notes).length > 0 && <span className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full">{Object.keys(notes).length}</span>}
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 dark:bg-neutral-950/50">
            
            {/* ROADMAP TAB */}
            {activeTab === 'roadmap' && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {improvementRoadmap.map((section, idx) => (
                    <div key={idx} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-4 text-neutral-900 dark:text-neutral-100 font-semibold border-b border-neutral-100 dark:border-neutral-800 pb-2">
                        <section.icon size={18} className="text-blue-500" />
                        <h3>{section.category}</h3>
                        </div>
                        <ul className="space-y-4">
                        {section.items.map((item, i) => (
                            <li key={i} className="flex gap-3 items-start group">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-blue-500 transition-colors shrink-0"></div>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h4>
                                <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                            </li>
                        ))}
                        </ul>
                    </div>
                    ))}
                </div>
                
                <div className="mt-8 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-lg p-4 flex items-center gap-4">
                    <div className="bg-blue-600 text-white p-2 rounded-full shadow-sm shrink-0">
                    <Download size={16} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100">Export Roadmap</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300/70">Download this list as a CSV file for Jira import.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-white dark:bg-neutral-800 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded border border-blue-200 dark:border-blue-500/20 shadow-sm hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors">
                        Download
                    </button>
                </div>
                </>
            )}

            {/* FEEDBACK TAB */}
            {activeTab === 'feedback' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Submitted Feedback ({feedback.length})</h3>
                        {feedback.length > 0 && (
                        <button 
                            onClick={onClearFeedback}
                            className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-3 py-1.5 bg-red-50 dark:bg-red-900/10 rounded-md transition-colors"
                        >
                            <Trash2 size={12} /> Clear All
                        </button>
                        )}
                    </div>

                    {feedback.length === 0 ? (
                        <div className="text-center py-20 text-neutral-400">
                            <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">No feedback submitted yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {feedback.map((item) => (
                                <div key={item.id} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                                item.type === 'Bug' ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30' :
                                                item.type === 'Feature' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30' :
                                                'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30'
                                            }`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-neutral-400">
                                                {new Date(item.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        {item.id.startsWith('system-') ? (
                                            <div className="text-blue-500" title="Verified System Message"><ShieldCheck size={14} /></div>
                                        ) : (
                                            <User size={14} className="text-neutral-300" />
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                                        {item.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* INVENTORY & NOTES TAB */}
            {activeTab === 'inventory' && (
                <div className="space-y-4">
                    <div className="mb-4">
                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Switch Inventory & Notes</h3>
                        <p className="text-xs text-neutral-400 mb-4">Add internal notes or annotations to specific switch models. These notes will appear on the cards for all users.</p>
                        
                        <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={14} />
                        <input 
                            type="text" 
                            value={adminSearch}
                            onChange={(e) => setAdminSearch(e.target.value)}
                            placeholder="Search switches..."
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white"
                        />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                            {adminInventoryList.length === 0 ? (
                                <div className="p-8 text-center text-neutral-400 text-sm">No switches found matching your search.</div>
                            ) : (
                                adminInventoryList.map(sw => (
                                    <div key={sw.id} className="p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-neutral-900 dark:text-neutral-200 truncate">{sw.model}</span>
                                                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">{sw.series}</span>
                                                {notes[sw.id] && (
                                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-200 dark:border-yellow-800 font-bold flex items-center gap-1">
                                                        <StickyNote size={10} /> Note Added
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-400 truncate">{sw.description}</div>
                                        </div>
                                        <div className="w-full md:w-1/2">
                                            <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Add a note..."
                                                defaultValue={notes[sw.id] || ''}
                                                onBlur={(e) => onSaveNote(sw.id, e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        onSaveNote(sw.id, e.currentTarget.value);
                                                        e.currentTarget.blur();
                                                    }
                                                }}
                                                className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                            />
                                            {notes[sw.id] && (
                                                <button 
                                                    onClick={() => {
                                                        onSaveNote(sw.id, '');
                                                        // Force input update hack
                                                        const input = document.activeElement as HTMLInputElement;
                                                        if (input) input.value = '';
                                                    }}
                                                    className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                    title="Clear Note"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
        </div>
    </div>
  );
};

export default AdminPanel;
