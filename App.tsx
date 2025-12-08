

import React, { useState, useMemo, useEffect } from 'react';
import { aristaSwitches } from './data';
import type { SwitchSpec, FilterState } from './types';
import SwitchCard from './components/SwitchCard';
import FilterSidebar from './components/FilterSidebar';
import ComparisonDrawer from './components/ComparisonDrawer';
import Analytics from './components/Analytics';
import { Menu, X, Cloud, ChevronDown, FileText, ExternalLink, Moon, Sun, Info, Lock, ShieldCheck, ListTodo, Download, Zap, Cpu, Filter, Tag, Cable } from 'lucide-react';

const seriesDescriptions: Record<string, string> = {
  '7060X6': "High-capacity, low-latency Ethernet switching optimized for AI leaf roles. Featuring fixed form factors ideal for high-scale AI clusters and high radix topologies. Support for LPO and PCIe integration.",
  '7800R4': "High-performance modular AI Spine switches designed for accelerated computing and massive scale. Features high-density 800G OSFP ports, deep buffers, and VOQ architecture for non-blocking performance in AI/ML clusters.",
  '7700R4': "Distributed Etherlink Switches designed to optimize spine/leaf architectures. Reduces cabling complexity and optical power consumption while providing massive throughput for distributed AI workloads.",
  '7280R3A': "Enhanced Universal Leaf/Spine routers featuring deep buffers, large routing tables, and high-performance silicon. Optimized for IP storage, content delivery, and complex service provider routing policies.",
  '7280R3': "Universal Leaf/Spine fixed-configuration routers. Delivers wire-speed performance with deep buffers and internet-scale routing, suitable for cloud networking, WAN peering, and interconnect roles.",
  '7050X4': "High-performance 400G data center switches. Optimized for hyperscale, enterprise and cloud networks with OSFP and QSFP-DD 400G options and comprehensive L2/L3 features.",
  '7050X3': "Flexible 10G/25G/100G switches with low latency and high power efficiency. Ideal for leaf and spine architectures in enterprise and cloud environments."
};

const improvementRoadmap = [
  {
    category: "Advanced Filtering & Grouping",
    icon: Filter,
    items: [
      { title: "ASIC Generation Filter", desc: "Filter models by underlying silicon (e.g., Tomahawk 4/5, Jericho 2/3) to align with specific buffer and latency architectural requirements." },
      { title: "Physical Constraints", desc: "Add filters for Airflow Direction (Front-to-Rear vs Rear-to-Front), Rack Units (1U/2U/Modular), and Power Supply redundancy (N+1 vs N+N)." },
      { title: "Deployment Role Grouping", desc: "Group switches by specific network roles beyond just 'Leaf/Spine', such as 'AI Back-end Fabric', 'DCI Edge', 'Management Leaf', or 'Campus Core'." }
    ]
  },
  {
    category: "Content & Context",
    icon: Tag,
    items: [
      { title: "Transceiver Compatibility Matrix", desc: "Integrated lookup tool showing supported optical modules (DAC, AOC, Transceivers) and breakout cable options for specific ports." },
      { title: "EOS License Mapping", desc: "Visual guide indicating which Feature Licenses (e.g., LIC-FIX-2, LIC-FLX-Lite) are required for EVPN/VXLAN or MACsec on specific platforms." },
      { title: "Lifecycle Status Indicators", desc: "Add visual badges for 'End of Sale' (EOS) or 'End of Life' (EOL) status to prevent selection of legacy hardware for new designs." }
    ]
  },
  {
    category: "Feature Enhancements",
    icon: ListTodo,
    items: [
      { title: "Advanced Comparison Export", desc: "Allow users to download the comparison table as a PDF or CSV file for offline reporting and BOM creation." },
      { title: "Direct Datasheet Parsing", desc: "Implement an admin tool to ingest PDF URLs and automatically extract specs using OCR/LLM integration." }
    ]
  },
  {
    category: "Analytics & Calculation",
    icon: Zap,
    items: [
      { title: "TCO & Power Calculator", desc: "Interactive module to estimate total cost of ownership based on power draw, cooling requirements, and regional energy costs." },
      { title: "Buffer Utilization Visualizer", desc: "More granular charts showing buffer-per-port ratios to help network architects identify potential microburst congestion points." }
    ]
  },
  {
    category: "UX & Visualization",
    icon: Cpu,
    items: [
      { title: "Rack Layout Builder", desc: "Drag-and-drop interface to visualize how selected switches fit into standard 42U racks, calculating total RU, weight, and power." },
      { title: "360° Product Viewer", desc: "Add 3D or rotatable imagery for supported models to visualize port density and airflow direction." }
    ]
  }
];

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    series: [],
    minThroughput: 0,
    min800G: 0,
    min400G: 0,
    min100G: 0,
    searchTerm: ''
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalData, setModalData] = useState<SwitchSpec | null>(null);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Admin State
  const [adminView, setAdminView] = useState<'none' | 'login' | 'panel'>('none');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const docLinks = [
      { name: "7060X6 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7060X6-Datasheet.pdf" },
      { name: "7800R4 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7800R4-Series-AI-Spine-Datasheet.pdf" },
      { name: "7700R4 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7700R4-Distributed-Etherlink-Switch-Datasheet.pdf" },
      { name: "7280R3A Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7280R3A-Datasheet.pdf" },
      { name: "7280R3 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7280R3-Data-Sheet.pdf" },
      { name: "7050X4 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7050X4-Datasheet.pdf" },
      { name: "7050X3 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7050X3-Datasheet.pdf" },
  ];

  const filteredSwitches = useMemo(() => {
    return aristaSwitches.filter(sw => {
      // Series Filter (Exact Match)
      if (filters.series.length > 0 && !filters.series.includes(sw.series)) {
        return false;
      }
      // Throughput Filter
      if (sw.throughputTbps < filters.minThroughput) {
        return false;
      }
      // Port Filters
      if (sw.max800G < filters.min800G) return false;
      if (sw.max400G < filters.min400G) return false;
      if (sw.max100G < filters.min100G) return false;
      
      // Search Term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          sw.model.toLowerCase().includes(term) || 
          sw.description.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }, [filters]);

  const selectedSwitches = useMemo(() => 
    aristaSwitches.filter(s => selectedIds.includes(s.id)), 
  [selectedIds]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert("You can compare a maximum of 4 products.");
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const removeSelection = (id: string) => {
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const activeSeriesDescription = useMemo(() => {
    if (filters.series.length === 1) {
      return {
        name: filters.series[0],
        text: seriesDescriptions[filters.series[0]]
      };
    }
    return null;
  }, [filters.series]);

  // Admin Logic
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '19901991') {
      setAdminView('panel');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  const closeAdmin = () => {
    setAdminView('none');
    setPinInput('');
    setPinError(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 bg-dot-pattern transition-colors duration-300 relative">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-xl lg:shadow-none`}>
        <FilterSidebar 
          filters={filters} 
          setFilters={setFilters} 
          totalCount={filteredSwitches.length}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md transition-colors duration-300">
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 -ml-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 lg:hidden transition-colors"
                >
                   <Menu size={20} />
                </button>
                <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-100 rounded-lg flex items-center justify-center text-white dark:text-neutral-950 shadow-sm transition-colors duration-300">
                    <Cloud size={18} />
                </div>
                <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight hidden sm:block">
                  Switch <span className="text-blue-600 dark:text-blue-500">Selector</span>
                </h1>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* Theme Toggle */}
                 <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                 >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                 </button>

                 {/* Docs Dropdown */}
                 <div className="relative">
                    <button 
                        onClick={() => setIsDocOpen(!isDocOpen)}
                        className="flex items-center gap-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm px-3 py-1.5 rounded-md transition-all active:scale-95"
                    >
                        <span>Documentation</span>
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isDocOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDocOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsDocOpen(false)}></div>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-neutral-900 rounded-lg shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 animate-fade-in origin-top-right z-20 ring-1 ring-black/5 dark:ring-black/20">
                                <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Datasheets</span>
                                </div>
                                {docLinks.map((link, idx) => (
                                    <a 
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                                        onClick={() => setIsDocOpen(false)}
                                    >
                                        <FileText size={14} className="text-neutral-400 dark:text-neutral-600 group-hover:text-blue-500" />
                                        <span className="flex-1 truncate font-medium">{link.name}</span>
                                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-neutral-400 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-32 scroll-smooth">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Series Description */}
                {activeSeriesDescription && (
                    <div className="bg-white dark:bg-neutral-900 border-l-4 border-blue-600 dark:border-blue-500 p-5 rounded-r-lg shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800 animate-fade-in">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg shrink-0">
                                <Info size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider mb-1">
                                {activeSeriesDescription.name} Series
                                </h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-3xl">
                                {activeSeriesDescription.text}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Section */}
                {filteredSwitches.length > 0 && (
                  <Analytics data={filteredSwitches} isDarkMode={isDarkMode} />
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredSwitches.map(sw => (
                        <SwitchCard 
                            key={sw.id}
                            data={sw}
                            isSelected={selectedIds.includes(sw.id)}
                            onToggleSelect={toggleSelection}
                            onViewDetails={setModalData}
                        />
                    ))}
                    {filteredSwitches.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                            <div className="bg-white dark:bg-neutral-900 p-4 rounded-full mb-4 ring-1 ring-neutral-200 dark:ring-neutral-800 shadow-sm">
                                <Cloud size={32} className="text-neutral-400 dark:text-neutral-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200 mb-1">No switches found</h3>
                            <p className="text-neutral-500 max-w-sm mb-6">We couldn't find any models matching your current filters. Try adjusting your criteria.</p>
                            <button 
                                onClick={() => setFilters({
                                    series: [],
                                    minThroughput: 0,
                                    min800G: 0,
                                    min400G: 0,
                                    min100G: 0,
                                    searchTerm: ''
                                })}
                                className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Disclaimer & Admin Trigger */}
                <div className="border-t border-neutral-200 dark:border-neutral-800 pt-8 pb-4 flex flex-col items-center gap-4">
                    <p className="text-[10px] text-neutral-500 max-w-2xl text-center leading-relaxed">
                        <span className="font-semibold text-neutral-600 dark:text-neutral-400">Disclaimer:</span> This application is a community-developed tool and is not officially affiliated with, endorsed by, or connected to Arista Networks. All product names, logos, and brands are property of their respective owners. Technical specifications are extracted from public datasheets and are for reference only; please verify with official Arista documentation.
                    </p>
                    <button 
                      onClick={() => setAdminView('login')}
                      className="text-neutral-300 dark:text-neutral-700 hover:text-neutral-500 dark:hover:text-neutral-500 transition-colors"
                    >
                      <Lock size={12} />
                    </button>
                </div>
            </div>
        </main>

        {/* Comparison Drawer */}
        <ComparisonDrawer 
            selectedSwitches={selectedSwitches} 
            onRemove={removeSelection}
            onClear={() => setSelectedIds([])}
        />

        {/* Admin Login Modal */}
        {adminView === 'login' && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Admin Access</h3>
                  <button onClick={closeAdmin} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"><X size={16} /></button>
                </div>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <input 
                      type="password" 
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Enter PIN"
                      autoFocus
                      className={`w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border rounded-md outline-none focus:ring-2 transition-all ${pinError ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-500/20 focus:border-blue-500'} dark:text-white`}
                    />
                    {pinError && <p className="text-red-500 text-xs mt-1">Incorrect PIN</p>}
                  </div>
                  <button type="submit" className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium py-2 rounded-md hover:opacity-90 transition-opacity">
                    Verify
                  </button>
                </form>
             </div>
           </div>
        )}

        {/* Admin Panel (Improvements) Modal */}
        {adminView === 'panel' && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-neutral-200 dark:border-neutral-800 flex flex-col">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Improvements Roadmap</h2>
                      <p className="text-xs text-neutral-500">Internal planning and feature requests</p>
                    </div>
                  </div>
                  <button onClick={closeAdmin} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors"><X size={20} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 dark:bg-neutral-950/50">
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
                </div>
             </div>
           </div>
        )}

      </div>

      {/* Details Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-neutral-200 dark:ring-neutral-700/50">
                <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-start bg-white dark:bg-neutral-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{modalData.model}</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{modalData.description}</p>
                    </div>
                    <button 
                        onClick={() => setModalData(null)}
                        className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto bg-white dark:bg-neutral-900">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                        <DetailItem label="Series" value={`${modalData.series} Series`} />
                        <DetailItem label="Type" value={modalData.type} />
                        <DetailItem label="Total Throughput" value={`${modalData.throughputTbps} Tbps`} highlight />
                        <DetailItem label="Packets Per Second" value={modalData.pps} />
                        <DetailItem label="Form Factor" value={modalData.size} />
                        <DetailItem label="Power Draw" value={modalData.powerDraw} />
                        <DetailItem label="Packet Buffer" value={modalData.buffer} />
                        <DetailItem label="Latency" value={modalData.latency} />
                        
                        <div className="col-span-1 sm:col-span-2 mt-2 pt-6 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                             <h4 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-4 text-sm flex items-center gap-2">
                                Port Configuration <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800"></span>
                             </h4>
                             <div className="grid grid-cols-3 gap-4">
                                <PortBox label="800G" count={modalData.max800G} />
                                <PortBox label="400G" count={modalData.max400G} />
                                <PortBox label="100G" count={modalData.max100G} />
                             </div>
                             <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                <p className="text-xs text-neutral-500 font-medium">Physical Ports</p>
                                <p className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">{modalData.ports}</p>
                             </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex justify-end">
                    <button 
                        onClick={() => setModalData(null)}
                        className="px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white transition-all shadow-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
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

export default App;
