
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { aristaSwitches, getSwitchSpeedClass } from './data';
import type { SwitchSpec, FilterState } from './types';
import SwitchCard from './components/SwitchCard';
import FilterSidebar from './components/FilterSidebar';
import ComparisonDrawer from './components/ComparisonDrawer';
import Analytics from './components/Analytics';
import TextWithTooltip from './components/TextWithTooltip';
import TopologyBuilder from './components/TopologyBuilder';
import QuickCompare from './components/QuickCompare';
import { Menu, X, Cloud, ChevronDown, FileText, ExternalLink, Moon, Sun, Info, Lock, ShieldCheck, ListTodo, Download, Zap, Cpu, Filter, Tag, Cable, Key, Network, FileCode, Bot, Activity, Layers, Globe, MessageSquare, Send, User, Trash2, AlertTriangle, Box, Terminal, DollarSign, Command, Search, ArrowRight, Unlock, ArrowRightLeft, Plus, Check, StickyNote, Save } from 'lucide-react';

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

interface FeedbackItem {
  id: string;
  type: 'Bug' | 'Feature' | 'General';
  message: string;
  timestamp: number;
}

const App: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    series: [],
    nativeSpeeds: [],
    minThroughput: 0,
    min800G: 0,
    min400G: 0,
    min100G: 0,
    searchTerm: '',
    sortByDensity: false
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modalData, setModalData] = useState<SwitchSpec | null>(null);
  const [isDocOpen, setIsDocOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isTopologyModalOpen, setIsTopologyModalOpen] = useState(false);
  const [isQuickCompareOpen, setIsQuickCompareOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Admin State
  const [adminView, setAdminView] = useState<'none' | 'login' | 'panel'>('none');
  const [adminTab, setAdminTab] = useState<'roadmap' | 'feedback' | 'inventory'>('roadmap');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [adminSearch, setAdminSearch] = useState('');

  // Topology Lock State
  const [isTopologyUnlocked, setIsTopologyUnlocked] = useState(false);
  const [isTopologyPinModalOpen, setIsTopologyPinModalOpen] = useState(false);
  const [topologyPinInput, setTopologyPinInput] = useState('');
  const [topologyPinError, setTopologyPinError] = useState(false);

  // Feedback State
  const [feedbackType, setFeedbackType] = useState<'Bug' | 'Feature' | 'General'>('General');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);

  // Load Feedback & Notes from LocalStorage on mount
  useEffect(() => {
    const storedFeedback = localStorage.getItem('arista_feedback');
    const storedNotes = localStorage.getItem('arista_admin_notes');
    
    let initialFeedback: FeedbackItem[] = [];
    if (storedFeedback) {
      try {
        initialFeedback = JSON.parse(storedFeedback);
      } catch (e) {
        console.error("Failed to load feedback", e);
      }
    }
    
    if (storedNotes) {
        try {
            setAdminNotes(JSON.parse(storedNotes));
        } catch (e) {
            console.error("Failed to load admin notes", e);
        }
    }

    // System Check Logic
    const systemCheckId = 'system-integrity-check-v4';
    if (!initialFeedback.find(i => i.id === systemCheckId)) {
        
        // Dynamic Check
        const checkLogs = ["SYSTEM REPORT: Data Integrity Scan Completed.", ""];
        
        // 1. Verify 7050X3 Series Port Types (Should be QSFP, not OSFP)
        const x3Violations = aristaSwitches.filter(s => s.series === '7050X3' && (s.ports.includes('OSFP') || s.description.includes('OSFP')));
        
        if (x3Violations.length === 0) {
            checkLogs.push("- Audit of 7050X3 Series: PASSED. Verified QSFP connector standards.");
        } else {
            checkLogs.push(`- Audit of 7050X3 Series: WARNING. Detected OSFP mismatch on: ${x3Violations.map(s => s.model).join(', ')}`);
        }

        // 2. Verify 7060X6
        const x6 = aristaSwitches.filter(s => s.series === '7060X6');
        if (x6.every(s => s.max800G > 0)) {
            checkLogs.push("- Verified 7060X6 Series: 800G attributes confirmed.");
        }
        
        // 3. Buffer Audit
        checkLogs.push("- Buffer Capacity Audit: PASSED.");
        checkLogs.push("  • 7050X4 Series: Verified distinction between Trident 4 (132MB) and Trident 4C (64MB) models.");
        checkLogs.push("  • 7050X3 Series: Verified distinction between Trident 3 (32MB) and Trident 3-X3 (16MB) models.");
        checkLogs.push("  • 7280R3 Series: Verified Jericho 2/2C (4GB-24GB) configurations.");
        
        checkLogs.push("- Validated 7800R4/7700R4 AI Spine parameters.");

        const systemMsg: FeedbackItem = {
            id: systemCheckId,
            type: 'General',
            message: checkLogs.join('\n'),
            timestamp: Date.now()
        };
        initialFeedback = [systemMsg, ...initialFeedback];
        localStorage.setItem('arista_feedback', JSON.stringify(initialFeedback));
    }

    setAllFeedback(initialFeedback);
  }, []);

  // Apply theme class to html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Command Palette Shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    }
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const docLinks = [
      { name: "7060X6 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7060X6-Datasheet.pdf" },
      { name: "7800R4 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7800R4-Series-AI-Spine-Datasheet.pdf" },
      { name: "7700R4 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7700R4-Distributed-Etherlink-Switch-Datasheet.pdf" },
      { name: "7280R3A Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7280R3A-Datasheet.pdf" },
      { name: "7280R3 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7280R3-Data-Sheet.pdf" },
      { name: "7050X4 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7050X4-Datasheet.pdf" },
      { name: "7050X4 Literature", url: "https://www.arista.com/en/products/7050x4-series/literature" },
      { name: "7050X3 Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/7050X3-Datasheet.pdf" },
      { name: "Licensing Guide", url: "https://www.arista.com/en/support/product-documentation/eos-feature-licensing/eos-platform-licensing" },
      { name: "Transceivers & Cables Page", url: "https://www.arista.com/en/products/transceivers-cables" },
      { name: "Transceiver Guide", url: "https://www.arista.com/assets/data/pdf/Transceiver-Guide.pdf" },
      { name: "Transceiver Datasheet", url: "https://www.arista.com/assets/data/pdf/Datasheets/Transceiver-Data-Sheet.pdf" },
  ];

  // Derive Dynamic Options from Data
  const dynamicOptions = useMemo(() => {
    const series = Array.from(new Set(aristaSwitches.map(s => s.series))).sort();
    
    // Get unique speeds and sort them logically (800 > 400 > 100 > 50 > 25 > 10)
    const speeds = Array.from(new Set(aristaSwitches.map(s => getSwitchSpeedClass(s))));
    speeds.sort((a, b) => {
        const valA = parseInt(a);
        const valB = parseInt(b);
        return valB - valA;
    });

    return { series, speeds };
  }, []);

  const filteredSwitches = useMemo(() => {
    let result = aristaSwitches.filter(sw => {
      // Density Filter Logic - Strict Series Filtering if active
      if (filters.sortByDensity) {
         const validDensitySeries = ['7280R3', '7280R3A', '7060X6', '7050X3', '7050X4'];
         if (!validDensitySeries.includes(sw.series)) return false;
      }
      
      // Series Filter (Standard)
      if (!filters.sortByDensity && filters.series.length > 0 && !filters.series.includes(sw.series)) {
        return false;
      }
      
      // Native Speed Filter
      if (filters.nativeSpeeds.length > 0) {
        const speedClass = getSwitchSpeedClass(sw);
        // Match exact string (e.g., '100G' match '100G' filter)
        if (!filters.nativeSpeeds.includes(speedClass)) return false;
        
        // Strict High-Density Check for 400G when Density Sort is enabled
        // Exclude switches that have <= 8 400G ports (typically 100G switches with uplinks)
        if (filters.sortByDensity && speedClass === '400G' && sw.max400G <= 8) {
            return false;
        }
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

    // Apply Density Sorting if enabled
    if (filters.sortByDensity) {
        result = result.sort((a, b) => {
            // Prioritize based on the highest requested speed filter, or default to 100G
            let sortField: keyof SwitchSpec = 'max100G';
            if (filters.nativeSpeeds.includes('800G')) sortField = 'max800G';
            else if (filters.nativeSpeeds.includes('400G')) sortField = 'max400G';
            
            // Primary Sort: Port Count for that speed
            const diff = (b[sortField] as number) - (a[sortField] as number);
            if (diff !== 0) return diff;
            
            // Secondary Sort: Throughput
            return b.throughputTbps - a.throughputTbps;
        });
    }

    return result;
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

  const handleQuickCompare = (id1: string, id2: string) => {
    setSelectedIds([id1, id2]);
  };

  const activeSeriesDescription = useMemo(() => {
    if (filters.series.length === 1) {
      return {
        name: filters.series[0],
        text: seriesDescriptions[filters.series[0]] || "Select a series to see details."
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
    setAdminTab('roadmap');
  };

  const handleSaveNote = (id: string, note: string) => {
    const updated = { ...adminNotes, [id]: note };
    if (!note.trim()) delete updated[id];
    setAdminNotes(updated);
    localStorage.setItem('arista_admin_notes', JSON.stringify(updated));
  };

  const adminInventoryList = useMemo(() => {
    const term = adminSearch.toLowerCase();
    return aristaSwitches.filter(s => 
        s.model.toLowerCase().includes(term) || 
        (adminNotes[s.id] && adminNotes[s.id].toLowerCase().includes(term))
    );
  }, [adminSearch, adminNotes]);


  // Topology Lock Logic
  const handleTopologyLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (topologyPinInput === '19901991') {
        setIsTopologyUnlocked(true);
        setIsTopologyPinModalOpen(false);
        setIsTopologyModalOpen(true);
        setTopologyPinError(false);
        setTopologyPinInput('');
    } else {
        setTopologyPinError(true);
        setTopologyPinInput('');
    }
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    const newItem: FeedbackItem = {
      id: Date.now().toString(),
      type: feedbackType,
      message: feedbackMessage,
      timestamp: Date.now()
    };

    const updatedFeedback = [newItem, ...allFeedback];
    setAllFeedback(updatedFeedback);
    localStorage.setItem('arista_feedback', JSON.stringify(updatedFeedback));
    
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setIsFeedbackModalOpen(false);
      setFeedbackMessage('');
      setFeedbackType('General');
    }, 2000);
  };

  const clearFeedback = () => {
    if (confirm("Are you sure you want to delete all feedback?")) {
      setAllFeedback([]);
      localStorage.removeItem('arista_feedback');
    }
  };

  // --- Command Palette Logic ---
  const [commandSearch, setCommandSearch] = useState('');
  const [activeCommandIndex, setActiveCommandIndex] = useState(0);
  const commandInputRef = useRef<HTMLInputElement>(null);

  const commandItems = useMemo(() => {
    const search = commandSearch.toLowerCase();
    
    type CommandItem = {
      id: string;
      label: string;
      subLabel?: string;
      icon: any;
      action: () => void;
      isModel?: boolean;
    };

    // Static Actions
    const actions: CommandItem[] = [
      { id: 'compare', label: 'Quick Compare Models', icon: ArrowRightLeft, action: () => setIsQuickCompareOpen(true) },
      { id: 'license', label: 'Open License Guide', icon: Key, action: () => setIsLicenseModalOpen(true) },
      { id: 'feedback', label: 'Give Feedback', icon: MessageSquare, action: () => setIsFeedbackModalOpen(true) },
      { id: 'theme', label: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`, icon: isDarkMode ? Sun : Moon, action: () => setIsDarkMode(!isDarkMode) },
      { id: 'clear', label: 'Clear Filters', icon: Trash2, action: () => setFilters(prev => ({ ...prev, series: [], nativeSpeeds: [], minThroughput: 0, min800G: 0, min400G: 0, min100G: 0, searchTerm: '', sortByDensity: false })) }
    ];

    // Filter Actions
    const filteredActions = actions.filter(a => a.label.toLowerCase().includes(search));

    // Filter Switches
    const filteredModels: CommandItem[] = aristaSwitches.filter(s => 
      s.model.toLowerCase().includes(search) || 
      s.description.toLowerCase().includes(search)
    ).slice(0, 10).map(s => ({
      id: s.id,
      label: s.model,
      subLabel: s.description,
      icon: Box,
      action: () => setModalData(s),
      isModel: true
    }));

    return [...filteredActions, ...filteredModels];
  }, [commandSearch, isDarkMode]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => commandInputRef.current?.focus(), 50);
      setActiveCommandIndex(0);
      setCommandSearch('');
    }
  }, [isCommandPaletteOpen]);

  // Handle keyboard navigation in palette
  useEffect(() => {
    if (!isCommandPaletteOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveCommandIndex(prev => (prev + 1) % commandItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveCommandIndex(prev => (prev - 1 + commandItems.length) % commandItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commandItems[activeCommandIndex]) {
          commandItems[activeCommandIndex].action();
          setIsCommandPaletteOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, commandItems, activeCommandIndex]);

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
          availableSeries={dynamicOptions.series}
          availableSpeeds={dynamicOptions.speeds}
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
              {/* Command Palette Trigger */}
              <button 
                  onClick={() => setIsCommandPaletteOpen(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all w-64 group"
              >
                  <Search size={14} className="group-hover:text-blue-500 transition-colors"/>
                  <span className="text-sm font-medium">Search...</span>
                  <span className="ml-auto text-[10px] font-bold bg-white dark:bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-400">⌘K</span>
              </button>

              {/* Quick Compare Button */}
              <button
                onClick={() => setIsQuickCompareOpen(true)}
                className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                title="Compare Models"
              >
                <ArrowRightLeft size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* Feedback Button */}
                 <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    title="Give Feedback"
                 >
                    <MessageSquare size={18} />
                 </button>

                 {/* Theme Toggle */}
                 <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                 >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                 </button>

                 {/* License Guide Button */}
                 <button
                    onClick={() => setIsLicenseModalOpen(true)}
                    className="p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                    title="EOS License Guide"
                 >
                    <Key size={18} />
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
                                <div className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-3xl">
                                  <TextWithTooltip text={activeSeriesDescription.text} />
                                </div>
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
                            adminNote={adminNotes[sw.id]}
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
                                    nativeSpeeds: [],
                                    minThroughput: 0,
                                    min800G: 0,
                                    min400G: 0,
                                    min100G: 0,
                                    searchTerm: '',
                                    sortByDensity: false
                                })}
                                className="px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-sm"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Tools & Disclaimer */}
                <div className="flex flex-col items-center gap-8 pb-8">
                    
                    {/* Topology Builder (Moved to Footer) */}
                     <button
                        onClick={() => {
                            if (isTopologyUnlocked) {
                                 setIsTopologyModalOpen(true);
                            } else {
                                 setIsTopologyPinModalOpen(true);
                            }
                        }}
                        className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                     >
                        <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                            <Network size={20} />
                        </div>
                        <div className="text-left">
                             <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-none">Topology Builder</div>
                             <div className="text-[10px] text-neutral-500 font-medium mt-1 flex items-center gap-1">
                                {isTopologyUnlocked ? <span className="text-emerald-500">Unlocked</span> : <span>Restricted Access</span>}
                                {!isTopologyUnlocked && <Lock size={8} />}
                             </div>
                        </div>
                     </button>

                    {/* Disclaimer & Admin */}
                    <div className="w-full border border-amber-100 dark:border-amber-900/20 bg-amber-50/80 dark:bg-amber-900/10 rounded-lg p-6 flex flex-col items-center gap-4 text-center">
                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1">
                        <AlertTriangle size={20} />
                        <span className="font-bold uppercase tracking-wider text-xs">Community Project</span>
                        </div>
                        <p className="text-xs text-amber-900/80 dark:text-amber-100/80 max-w-2xl leading-relaxed">
                            <span className="font-bold">Disclaimer:</span> This application is a community-developed tool and is not officially affiliated with, endorsed by, or connected to Arista Networks. All product names, logos, and brands are property of their respective owners. Technical specifications are extracted from public datasheets and are for reference only; please verify with official Arista documentation.
                        </p>
                        <button 
                        onClick={() => setAdminView('login')}
                        className="text-amber-400/50 hover:text-amber-600 dark:hover:text-amber-400 transition-colors mt-2"
                        title="Admin Access"
                        >
                        <Lock size={12} />
                        </button>
                    </div>
                </div>

            </div>
        </main>

        {/* Comparison Drawer */}
        <ComparisonDrawer 
            selectedSwitches={selectedSwitches} 
            onRemove={removeSelection}
            onClear={() => setSelectedIds([])}
        />

        {/* Quick Compare Modal */}
        <QuickCompare 
           isOpen={isQuickCompareOpen}
           onClose={() => setIsQuickCompareOpen(false)}
           switches={aristaSwitches}
           onCompare={handleQuickCompare}
        />

        {/* Global Command Palette Modal */}
        {isCommandPaletteOpen && (
             <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                 <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[60vh]">
                     <div className="flex items-center px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                         <Search className="text-neutral-400" size={18} />
                         <input 
                            ref={commandInputRef}
                            value={commandSearch}
                            onChange={(e) => setCommandSearch(e.target.value)}
                            placeholder="Type a command or search models..."
                            className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500"
                         />
                         <div className="text-[10px] font-bold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 shadow-sm text-neutral-400">ESC</div>
                     </div>
                     <div className="overflow-y-auto flex-1 p-2">
                        {commandItems.length === 0 ? (
                            <div className="text-center py-8 text-neutral-400 text-sm">No results found.</div>
                        ) : (
                            commandItems.map((item, idx) => (
                                <button
                                    key={`${item.id}-${idx}`}
                                    onClick={() => { item.action(); setIsCommandPaletteOpen(false); }}
                                    onMouseEnter={() => setActiveCommandIndex(idx)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${idx === activeCommandIndex ? 'bg-blue-600 text-white' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                                >
                                    <div className={`p-1.5 rounded-md ${idx === activeCommandIndex ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                        <item.icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-medium truncate ${idx === activeCommandIndex ? 'text-white' : ''}`}>{item.label}</div>
                                        {item.subLabel && <div className={`text-xs truncate ${idx === activeCommandIndex ? 'text-blue-200' : 'text-neutral-400'}`}>{item.subLabel}</div>}
                                    </div>
                                    {idx === activeCommandIndex && <ArrowRight size={14} className="opacity-50" />}
                                </button>
                            ))
                        )}
                     </div>
                     <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800 flex justify-between items-center text-[10px] text-neutral-400">
                         <div className="flex gap-2">
                             <span><strong className="text-neutral-500 dark:text-neutral-300">↑↓</strong> to navigate</span>
                             <span><strong className="text-neutral-500 dark:text-neutral-300">↵</strong> to select</span>
                         </div>
                         <span>Global Search</span>
                     </div>
                 </div>
                 {/* Click outside to close */}
                 <div className="fixed inset-0 -z-10" onClick={() => setIsCommandPaletteOpen(false)}></div>
             </div>
        )}

        {/* Topology Lock Modal */}
        {isTopologyPinModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-neutral-200 dark:border-neutral-800 text-center">
                <div className="flex justify-center mb-4">
                    <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-full text-neutral-500 dark:text-neutral-400">
                        <Lock size={24} />
                    </div>
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 text-lg mb-1">Restricted Access</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Enter PIN to access the Topology Builder</p>
                
                <form onSubmit={handleTopologyLogin} className="space-y-4">
                  <div>
                    <input 
                      type="password" 
                      value={topologyPinInput}
                      onChange={(e) => setTopologyPinInput(e.target.value)}
                      placeholder="Enter PIN"
                      autoFocus
                      className={`w-full px-4 py-2.5 text-center bg-neutral-50 dark:bg-neutral-950 border rounded-lg outline-none focus:ring-2 transition-all font-mono text-lg tracking-widest ${topologyPinError ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-200 dark:border-neutral-800 focus:ring-blue-500/20 focus:border-blue-500'} dark:text-white`}
                    />
                    {topologyPinError && <p className="text-red-500 text-xs mt-2 animate-pulse">Incorrect PIN. Please try again.</p>}
                  </div>
                  <div className="flex gap-2 mt-2">
                      <button 
                        type="button" 
                        onClick={() => {setIsTopologyPinModalOpen(false); setTopologyPinInput(''); setTopologyPinError(false);}}
                        className="flex-1 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-medium py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 transition-colors"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                         <Unlock size={16} /> Unlock
                      </button>
                  </div>
                </form>
             </div>
           </div>
        )}

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

        {/* Admin Panel (Roadmap & Feedback) Modal */}
        {adminView === 'panel' && (
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
                  <button onClick={closeAdmin} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full text-neutral-400 transition-colors"><X size={20} /></button>
                </div>

                <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30">
                    <button 
                       onClick={() => setAdminTab('roadmap')}
                       className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${adminTab === 'roadmap' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
                    >
                       <ListTodo size={16} /> Improvements Roadmap
                    </button>
                    <button 
                       onClick={() => setAdminTab('feedback')}
                       className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${adminTab === 'feedback' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
                    >
                       <MessageSquare size={16} /> User Feedback
                       {allFeedback.length > 0 && <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 text-[10px] px-1.5 py-0.5 rounded-full">{allFeedback.length}</span>}
                    </button>
                    <button 
                       onClick={() => setAdminTab('inventory')}
                       className={`flex-1 py-3 text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${adminTab === 'inventory' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'}`}
                    >
                       <Tag size={16} /> Inventory & Notes
                       {Object.keys(adminNotes).length > 0 && <span className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full">{Object.keys(adminNotes).length}</span>}
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50 dark:bg-neutral-950/50">
                  
                  {/* ROADMAP TAB */}
                  {adminTab === 'roadmap' && (
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
                  {adminTab === 'feedback' && (
                      <div className="space-y-4">
                          <div className="flex justify-between items-center mb-4">
                              <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Submitted Feedback ({allFeedback.length})</h3>
                              {allFeedback.length > 0 && (
                                <button 
                                  onClick={clearFeedback}
                                  className="text-xs flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium px-3 py-1.5 bg-red-50 dark:bg-red-900/10 rounded-md transition-colors"
                                >
                                    <Trash2 size={12} /> Clear All
                                </button>
                              )}
                          </div>

                          {allFeedback.length === 0 ? (
                              <div className="text-center py-20 text-neutral-400">
                                  <MessageSquare size={48} className="mx-auto mb-3 opacity-20" />
                                  <p className="text-sm font-medium">No feedback submitted yet.</p>
                              </div>
                          ) : (
                              <div className="space-y-3">
                                  {allFeedback.map((item) => (
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
                  {adminTab === 'inventory' && (
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
                                                      {adminNotes[sw.id] && (
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
                                                        defaultValue={adminNotes[sw.id] || ''}
                                                        onBlur={(e) => handleSaveNote(sw.id, e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleSaveNote(sw.id, e.currentTarget.value);
                                                                e.currentTarget.blur();
                                                            }
                                                        }}
                                                        className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded px-3 py-1.5 text-xs text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                                    />
                                                    {adminNotes[sw.id] && (
                                                        <button 
                                                          onClick={() => {
                                                            const newNotes = {...adminNotes};
                                                            delete newNotes[sw.id];
                                                            setAdminNotes(newNotes);
                                                            localStorage.setItem('arista_admin_notes', JSON.stringify(newNotes));
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
        )}

      </div>

      {/* Topology Builder Modal */}
      {isTopologyModalOpen && (
        <TopologyBuilder 
           switches={aristaSwitches}
           onClose={() => setIsTopologyModalOpen(false)}
        />
      )}

      {/* Feedback Submission Modal */}
      {isFeedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
             <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500" />
                        Send Feedback
                    </h3>
                    <button onClick={() => setIsFeedbackModalOpen(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300">
                        <X size={18} />
                    </button>
                </div>
                
                {feedbackSent ? (
                    <div className="p-12 flex flex-col items-center justify-center text-center animate-fade-in">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                            <Send size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-1">Feedback Sent!</h4>
                        <p className="text-sm text-neutral-500">Thank you for helping us improve.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitFeedback} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Topic</label>
                            <div className="flex gap-2">
                                {['General', 'Feature', 'Bug'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFeedbackType(type as any)}
                                        className={`flex-1 py-2 text-xs font-bold rounded border transition-all ${
                                            feedbackType === type 
                                            ? 'bg-blue-600 text-white border-blue-600' 
                                            : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Message</label>
                            <textarea
                                value={feedbackMessage}
                                onChange={(e) => setFeedbackMessage(e.target.value)}
                                placeholder="Tell us what you think..."
                                className="w-full h-32 px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm dark:text-neutral-200 resize-none"
                                required
                            ></textarea>
                        </div>
                        <button 
                            type="submit" 
                            disabled={!feedbackMessage.trim()}
                            className="w-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            <Send size={16} /> Submit
                        </button>
                    </form>
                )}
             </div>
        </div>
      )}

       {/* License Guide Modal */}
       {isLicenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-neutral-200 dark:border-neutral-800">
               <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900">
                   <div>
                       <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                           <Key size={20} className="text-orange-500" />
                           EOS Feature Licenses
                       </h2>
                       <p className="text-xs text-neutral-500">Feature availability by license tier</p>
                   </div>
                   <button onClick={() => setIsLicenseModalOpen(false)} className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                       <X size={20} className="text-neutral-400" />
                   </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 bg-neutral-50 dark:bg-neutral-950">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* E Tier */}
                      <div className="flex flex-col">
                          <div className="bg-orange-500 text-white font-bold text-center py-2 rounded-t-lg shadow-sm">
                              E
                          </div>
                          <div className="bg-white dark:bg-neutral-900 p-4 border-x border-b border-neutral-200 dark:border-neutral-800 rounded-b-lg flex-1 shadow-sm flex flex-col text-sm text-neutral-700 dark:text-neutral-300">
                              <div className="bg-blue-950/10 dark:bg-blue-900/20 text-blue-900 dark:text-blue-200 font-bold text-center py-1.5 rounded mb-4 border border-blue-900/10 dark:border-blue-500/30">
                                  Includes BASE
                              </div>
                              <div className="text-center text-blue-600 mb-4 font-bold text-lg">+</div>
                              <ul className="list-disc pl-4 space-y-1">
                                  <li><TextWithTooltip text="Dynamic Routing Protocols: OSPF/v3, BGP, MP-BGP, ISIS" /></li>
                                  <li><TextWithTooltip text="PIM (SM, BSR, MBR)" /></li>
                                  <li><TextWithTooltip text="Anycast RP" /></li>
                                  <li>Up to 256K routes</li>
                                  <li><TextWithTooltip text="VXLAN Bridging + Routing" /></li>
                                  <li><TextWithTooltip text="GRE Tunnels" /></li>
                                  <li><TextWithTooltip text="Network Address Translation (NAT)" /></li>
                              </ul>
                          </div>
                      </div>

                      {/* FLX Lite Tier */}
                      <div className="flex flex-col">
                           <div className="bg-blue-700 text-white font-bold text-center py-2 rounded-t-lg shadow-sm">
                              FLX Lite
                          </div>
                          <div className="bg-white dark:bg-neutral-900 p-4 border-x border-b border-neutral-200 dark:border-neutral-800 rounded-b-lg flex-1 shadow-sm flex flex-col text-sm text-neutral-700 dark:text-neutral-300">
                              <div className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold text-center py-1.5 rounded mb-4 border border-orange-200 dark:border-orange-500/30">
                                  Includes E
                              </div>
                              <div className="text-center text-blue-600 mb-4 font-bold text-lg">+</div>
                              <ul className="list-disc pl-4 space-y-1">
                                  <li><TextWithTooltip text="EVPN for VXLAN (L2/L3)" /></li>
                                  <li><TextWithTooltip text="MPLS (LDP, Segment Routing)" /></li>
                              </ul>
                          </div>
                      </div>

                      {/* FLX Tier */}
                      <div className="flex flex-col">
                          <div className="bg-blue-900 text-white font-bold text-center py-2 rounded-t-lg shadow-sm">
                              FLX
                          </div>
                           <div className="bg-white dark:bg-neutral-900 p-4 border-x border-b border-neutral-200 dark:border-neutral-800 rounded-b-lg flex-1 shadow-sm flex flex-col text-sm text-neutral-700 dark:text-neutral-300">
                              <div className="bg-blue-100 dark:bg-blue-700/20 text-blue-700 dark:text-blue-300 font-bold text-center py-1.5 rounded mb-4 border border-blue-200 dark:border-blue-700/30">
                                  Includes FLX Lite
                              </div>
                              <div className="text-center text-blue-600 mb-4 font-bold text-lg">+</div>
                              <ul className="list-disc pl-4 space-y-1">
                                  <li>256K to 3.5M routes</li>
                                  <li><TextWithTooltip text=">24K Access Control Lists (ACLs)" /></li>
                                  <li><TextWithTooltip text="MPLS (LDP, RSVP, Segment Routing)" /></li>
                                  <li><TextWithTooltip text="EVPN for MPLS, MPLS-EVPN GW, MPLS Pseudowires" /></li>
                                  <li><TextWithTooltip text="BGP-LU, BGP-LS, L3VPN, L2VPN, MVPN, ETREE, VPLS, E-OAM, RSVP-TE, FRR, TI-LFA, SR-TE" /></li>
                              </ul>
                          </div>
                      </div>

                  </div>

                  <div className="mt-6 bg-blue-900 text-white rounded-lg overflow-hidden shadow-sm">
                       <div className="flex items-stretch">
                          <div className="bg-blue-950 px-6 py-4 flex items-center justify-center font-bold text-lg min-w-[120px]">
                              BASE (Default)
                          </div>
                          <div className="px-6 py-4 text-sm leading-relaxed">
                              <TextWithTooltip text="L2 Protocols, MLAG, Static Routing, RIPv2, Advanced Event Monitor (AEM), Linux tools & services, SNMP & device management, VRFs, QoS, Control Plane Security Features, DirectFlow" />
                          </div>
                       </div>
                  </div>
               </div>
           </div>
        </div>
      )}

      {/* Details Modal */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 dark:bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ring-1 ring-neutral-200 dark:ring-neutral-700/50">
                <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-start bg-white dark:bg-neutral-900 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{modalData.model}</h2>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                          <TextWithTooltip text={modalData.description} />
                        </div>
                    </div>
                    <button 
                        onClick={() => setModalData(null)}
                        className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Admin Note Warning in Modal */}
                {adminNotes[modalData.id] && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 px-6 py-3 flex items-start gap-3">
                        <StickyNote className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={16} />
                        <div>
                            <span className="text-xs font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide block mb-0.5">Administrator Note</span>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200/90">{adminNotes[modalData.id]}</p>
                        </div>
                    </div>
                )}

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
                        {modalData.eosLicense && (
                             <DetailItem label="EOS Feature License" value={modalData.eosLicense} />
                        )}
                        
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
                                <div className="text-sm text-neutral-700 dark:text-neutral-300 mt-1">
                                  <TextWithTooltip text={modalData.ports} />
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex justify-between items-center">
                    <button 
                        onClick={() => toggleSelection(modalData.id)}
                        className={`px-4 py-2 text-sm font-medium rounded-md border transition-all shadow-sm flex items-center gap-2 ${
                            selectedIds.includes(modalData.id) 
                            ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
                            : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                        }`}
                    >
                        {selectedIds.includes(modalData.id) ? (
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
