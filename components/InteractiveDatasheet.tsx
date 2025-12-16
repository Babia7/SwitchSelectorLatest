
import React, { useState } from 'react';
import { X, Layers, Shield, Activity, Zap, Cpu, Search, ChevronDown, ChevronUp, BookOpen, ArrowRightLeft, Network, Share2, Box, FileText, ArrowRight, Lock, Lightbulb, TrendingUp, Scale, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InteractiveDatasheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = ['Overview', 'Innovations', 'Architecture', 'R3 vs R3A', 'Scalability', 'Features', 'Specifications'];

// --- 7280R3A Data ---
const DATA_R3A = {
  title: '7280R3A Series',
  subtitle: 'Universal Spine & Leaf for Cloud & Service Provider Networks',
  highlights: [
    { title: 'System Scale', icon: Activity, items: ['Up to 54 x 400G', 'Up to 72 x 100G', '21.6 Tbps Throughput', '8.1 Bpps Forwarding'] },
    { title: 'Cloud Grade Routing', icon:  Layers, items: ['Secure Internet Peering', 'Carrier Edge VPN', 'Next Gen EVPN Services', 'Segment Routing (SR-TE)'] },
    { title: 'Optimized Design', icon: Cpu, items: ['Ultra-deep 24GB Buffer', 'VOQ Architecture', 'No Head-of-Line Blocking', 'Hot-swap Power & Fans'] },
    { title: 'Security', icon: Shield, items: ['MACsec Encryption', 'IPsec & VXLANsec', 'Algorithmic ACLs', '256-bit AES-GCM'] }
  ],
  scalability: [
    { name: 'L3 Profile', mac: 224, ipv4: 1450, ipv6: 433, multicast: 112 },
    { name: 'Balanced', mac: 224, ipv4: 800, ipv6: 250, multicast: 112 },
    { name: 'L3-XL', mac: 256, ipv4: 2250, ipv6: 683, multicast: 128 },
    { name: 'L3-XXL', mac: 192, ipv4: 2850, ipv6: 833, multicast: 96 },
    { name: 'L3-XXXL', mac: 384, ipv4: 3950, ipv6: 1100, multicast: 192 },
  ],
  specs: [
    { model: '7280DR3A-54', ports: '54x 400G QSFP-DD', throughput: '21.6 Tbps', buffer: '24 GB', power: '933W', ru: '2U' },
    { model: '7280DR3A-36', ports: '36x 400G QSFP-DD', throughput: '14.4 Tbps', buffer: '16 GB', power: '643W', ru: '2U' },
    { model: '7280CR3A-72', ports: '72x 100G QSFP', throughput: '7.2 Tbps', buffer: '8 GB', power: '406W', ru: '2U' },
    { model: '7280CR3A-24D12', ports: '24x 100G, 12x 400G', throughput: '7.2 Tbps', buffer: '8 GB', power: '346W', ru: '1U' },
    { model: '7280SR3A-48YC8', ports: '48x 25G, 8x 100G', throughput: '3.6 Tbps', buffer: '4 GB', power: '290W', ru: '1U' },
    { model: '7280CR3A-32S', ports: '32x 100G, 2x 400G', throughput: '3.6 Tbps', buffer: '4 GB', power: '302W', ru: '1U' }
  ],
  note: "All 7280R3A series support deep buffering, VOQ, and internet scale routing. Models ending in 'M' support MACsec encryption. Models ending in 'K' support accelerated algorithmic ACLs and larger routing tables."
};

// --- 7280R3 Data ---
const DATA_R3 = {
  title: '7280R3 Series',
  subtitle: 'Data Center Switch Router for High Performance Environments',
  highlights: [
    { title: 'System Scale', icon: Activity, items: ['Up to 24 x 400G', 'Up to 96 x 100G', '9.6 Tbps Throughput', '4 Bpps Forwarding'] },
    { title: 'Cloud Grade Routing', icon:  Layers, items: ['Secure Internet Peering', 'Carrier Edge VPN', 'FlexRoute™ Technology', 'Open Programmable APIs'] },
    { title: 'Optimized Design', icon: Cpu, items: ['Deep packet buffer 16GB', 'VOQ Architecture', 'Front-to-Rear Cooling', 'NEBS Compliant Designs'] },
    { title: 'Security & Visibility', icon: Shield, items: ['MACsec (M Models)', 'Algorithmic ACLs', 'Inband Network Telemetry', 'LANZ Microburst Detection'] }
  ],
  scalability: [
    { name: 'L3 Profile', mac: 224, ipv4: 1450, ipv6: 433, multicast: 112 },
    { name: 'Balanced', mac: 224, ipv4: 800, ipv6: 250, multicast: 112 },
    { name: 'L3-XL', mac: 256, ipv4: 2250, ipv6: 683, multicast: 128 },
    { name: 'L3-XXL', mac: 192, ipv4: 2850, ipv6: 833, multicast: 96 },
    { name: 'L3-XXXL', mac: 384, ipv4: 3950, ipv6: 1100, multicast: 192 },
  ],
  specs: [
    { model: '7280PR3-24', ports: '24x 400G OSFP', throughput: '9.6 Tbps', buffer: '16 GB', power: '650W', ru: '1U' },
    { model: '7280DR3-24', ports: '24x 400G QSFP-DD', throughput: '9.6 Tbps', buffer: '16 GB', power: '650W', ru: '1U' },
    { model: '7280CR3-96', ports: '96x 100G QSFP', throughput: '9.6 Tbps', buffer: '16 GB', power: '1003W', ru: '2U' },
    { model: '7280CR3-32D4', ports: '32x 100G, 4x 400G', throughput: '4.8 Tbps', buffer: '8 GB', power: '535W', ru: '1U' },
    { model: '7280SR3-48YC8', ports: '48x 25G, 8x 100G', throughput: '2.0 Tbps', buffer: '4 GB', power: '154W', ru: '1U' },
    { model: '7280TR3-40C6', ports: '40x 10G-T, 6x 100G', throughput: '800 Gbps', buffer: '8 GB', power: '186W', ru: '1U' }
  ],
  note: "The 7280R3 Series features FlexRoute Engine for full internet routing. 'K' models expand scale to 5M+ routes. 'M' models support MACsec. Built-in SSD options available for advanced telemetry."
};

// --- 7280R3A Modular Data ---
const DATA_R3A_MODULAR = {
  title: '7280R3A Modular',
  subtitle: '4RU Modular Data Center Switch Router (14.4 Tbps)',
  highlights: [
    { title: 'Performance', icon: Activity, items: ['14.4 Tbps System Capacity', 'Up to 5.4 Bpps', '144x 100G or 36x 400G', '400G ZR and ZR+ Support'] },
    { title: 'Routing & Services', icon:  Layers, items: ['Secure Internet Peering', 'Carrier Core Transport', 'EVPN Services for 5G/MEC', 'High Scale Routing (5M+ IPv4)'] },
    { title: 'Modular Design', icon: Cpu, items: ['16 GB Deep Buffer (per SC)', '9 Interface Module Slots', 'Fully Redundant Supervisors', 'Field Replaceable Fabric'] },
    { title: 'Encryption', icon: Shield, items: ['MACsec Encryption', 'IPsec & VXLANsec', 'TunnelSec Technology', 'Wire-speed Encryption'] }
  ],
  scalability: [
    { name: 'L3 Profile', mac: 224, ipv4: 1450, ipv6: 433, multicast: 112 },
    { name: 'Balanced', mac: 224, ipv4: 800, ipv6: 250, multicast: 112 },
    { name: 'L3-XL (R3AK)', mac: 256, ipv4: 2250, ipv6: 683, multicast: 128 },
    { name: 'L3-XXL (R3AK)', mac: 192, ipv4: 2850, ipv6: 833, multicast: 96 },
    { name: 'L3-XXXL (R3AK)', mac: 384, ipv4: 3950, ipv6: 1100, multicast: 192 },
  ],
  specs: [
    { model: '7289R3A System', ports: 'Max 144x 100G / 36x 400G', throughput: '14.4 Tbps', buffer: '16 GB', power: '1244W', ru: '4U' },
    { model: 'DCS-7368-4P', ports: '4x 400G OSFP', throughput: 'Line Rate', buffer: '-', power: '72W', ru: 'Module' },
    { model: 'DCS-7368-4D', ports: '4x 400G QSFP-DD', throughput: 'Line Rate', buffer: '-', power: '72W', ru: 'Module' },
    { model: 'DCS-7358-16C', ports: '16x 100G QSFP', throughput: 'Line Rate', buffer: '-', power: '83W', ru: 'Module' },
    { model: 'DCS-7368-16S', ports: '16x 25G SFP28', throughput: 'Line Rate', buffer: '-', power: '36W', ru: 'Module' }
  ],
  note: "Modular chassis fully populated weighs ~105 lbs. Supports R3A (Standard), R3AM (Encryption), and R3AK (Large Scale) switch cards. Mix and match interface modules for flexible density."
};

const DATASHEETS: Record<string, typeof DATA_R3A> = {
  '7280R3A': DATA_R3A,
  '7280R3': DATA_R3,
  '7280R3A Modular': DATA_R3A_MODULAR
};

// --- Innovations Data ---
const INNOVATION_TIMELINE = [
  { year: '2010', title: 'Gen 1: Petra', subtitle: '7500 / 7048 Series', desc: 'Pioneered deep buffer fixed leaf/spine. 10G/40G density.' },
  { year: '2013', title: 'Gen 2: Arad', subtitle: '7500E / 7280SE', desc: 'VXLAN hardware VTEP, 100G uplinks, AlgoMatch introduction.' },
  { year: '2016', title: 'Gen 3: Jericho', subtitle: '7500R / 7280R', desc: 'Universal Spine, FlexRoute (Internet Scale), CloudWAN.' },
  { year: '2019', title: 'Gen 4: Jericho2', subtitle: 'R3 Series', desc: '400G Native, HBM2, TunnelSec, In-band Telemetry.' },
];

const TECHNOLOGY_PILLARS = [
  {
    title: 'HBM2 Memory Architecture',
    icon: Cpu,
    desc: 'Integrated High Bandwidth Memory (HBM2) replaces external GDDR. Provides 8GB deep buffer per chip with 43% lower power consumption. Eliminates package bottlenecks for wire-speed buffering.',
    stats: ['8GB Buffer/Chip', '43% Power Savings', 'Integrated Package']
  },
  {
    title: 'TunnelSec Encryption',
    icon: Lock,
    desc: 'Wire-speed strong encryption for WAN/DCI. Supports MACsec (L2), plus IPsec and VXLANsec (L3) for encrypted overlays across public networks without performance penalties.',
    stats: ['AES-256-GCM', 'Line Rate', 'L2/L3 Support']
  },
  {
    title: 'Unified Forwarding Plane',
    icon: Layers,
    desc: 'Common architecture across Fixed (7280R3) and Modular (7500R3/7800R3) systems. Consistent features, telemetry, and OS images simplify qualification and operations.',
    stats: ['Single OS', 'Consistent VOQ', 'Shared Pipeline']
  },
  {
    title: 'Advanced Telemetry',
    icon: Activity,
    desc: 'Programmable pipeline enables Accelerated sFlow and Inband Network Telemetry (INT). Real-time granular visibility into latency, queue depth, and path tracing per-flow.',
    stats: ['Hardware sFlow', 'INT Support', 'Real-time State']
  }
];

// --- R3 vs R3A Comparison Data ---
const R3_VS_R3A_DATA = [
  {
    feature: "Silicon Architecture",
    r3: { title: "Jericho2", desc: "16nm process, 4.8 Tbps per chip" },
    r3a: { title: "Jericho2C+", desc: "7nm process, 7.2 Tbps per chip" }
  },
  {
    feature: "System Throughput (2RU)",
    r3: { title: "9.6 Tbps", desc: "e.g. 7280CR3-96 (2x J2)" },
    r3a: { title: "21.6 Tbps", desc: "e.g. 7280DR3A-54 (3x J2C+)" }
  },
  {
    feature: "Encryption (TunnelSec)",
    r3: { title: "Add-on / Specific Models", desc: "Requires 'M' series or external PHYs for MACsec" },
    r3a: { title: "Silicon Native", desc: "Integrated MACsec, IPsec, VXLANsec on all ports (Line rate)" }
  },
  {
    feature: "Power Efficiency",
    r3: { title: "High Efficiency", desc: "Excellent W/Gbps for 100G" },
    r3a: { title: "Ultra Efficiency", desc: "~30-40% power reduction per Gbps vs R3" }
  },
  {
    feature: "Memory (HBM2)",
    r3: { title: "8GB per chip", desc: "Deep buffering for lossless transport" },
    r3a: { title: "8GB per chip", desc: "Maintains deep buffer architecture with higher bandwidth" }
  },
  {
    feature: "Routing Scale (FIB)",
    r3: { title: "1.4M - 2.5M Routes", desc: "FlexRoute™ Engine" },
    r3a: { title: "2.5M - 5M+ Routes", desc: "Enhanced FlexRoute™ with larger MDB profiles" }
  }
];

// --- Architecture Data ---
const ARCHITECTURE_STEPS = [
  {
    id: 'ingress-phy',
    title: '1. Network Interface (Ingress)',
    icon: Network,
    desc: 'Physical layer processing, lane mapping, and error correction.',
    details: [
      'PHY Layer: Bitstream reception, synchronization, and clock recovery.',
      'Gearboxes: Convert 50G PAM4 SerDes to legacy speeds (10G/25G NRZ) where needed.',
      'MAC Layer: Frame validation, CRC checks, and start-of-frame detection.',
      'Forward Error Correction (FEC) handling.'
    ]
  },
  {
    id: 'parser',
    title: '2. Packet Parsing & Lookups',
    icon: Search,
    desc: 'Headers are parsed and forwarding decisions are made using FlexRoute.',
    details: [
      'Flexible Parser: Extracts L2/L3/L4 headers and tunnel encap (VXLAN, MPLS).',
      'FlexRoute™ Engine: Internet-scale LPM lookups (>5M routes on R3K).',
      'Modular Database (MDB): Flexible allocation for Routing, MAC, and Host tables.',
      'Ingress ACLs: Security and QoS classification applied in parallel.'
    ]
  },
  {
    id: 'voq',
    title: '3. Ingress Traffic Manager (VOQ)',
    icon: Layers,
    desc: 'Packets are queued on ingress based on destination availability.',
    details: [
      'Virtual Output Queuing (VOQ): Eliminates Head-of-Line (HOL) blocking.',
      'Deep Buffers: Uses 16GB-24GB HBM2 memory for burst absorption.',
      'Dynamic Allocation: ~55% of buffer is shared dynamically across ports.',
      'Credit Request: Request sent to egress scheduler before forwarding.'
    ]
  },
  {
    id: 'fabric',
    title: '4. Fabric Interface',
    icon: Share2,
    desc: 'Packets are segmented into cells and sprayed across the fabric.',
    details: [
      'Segmentation: Packets sliced into variable-sized cells (max 256 bytes).',
      'Load Balancing: Cells sprayed across all available fabric links.',
      'No Hotspots: Traffic patterns do not affect fabric efficiency.',
      'Local Switching: Traffic destined for same chip bypasses fabric.'
    ]
  },
  {
    id: 'egress-reassembly',
    title: '5. Egress Assembly',
    icon: Box,
    desc: 'Cells are reassembled into packets at the destination.',
    details: [
      'Reassembly: Cells buffered and ordered to reconstruct original packet.',
      'Multicast: Replication occurs here for locally attached receivers.',
      'Egress ACLs: Final security checks applied based on output port.',
      'Health Tracer: Validates reachability across fabric paths.'
    ]
  },
  {
    id: 'egress-scheduler',
    title: '6. Egress Traffic Manager',
    icon: Activity,
    desc: 'Grants transmission credits to ingress VOQs.',
    details: [
      'Scheduling: Weighted Fair Queuing (WFQ) or Round Robin (RR).',
      'Credit Grants: Signals Ingress Traffic Manager to transmit data.',
      'Shaping: Enforces egress rate limits and traffic policing.',
      'Smart Buffering: Small on-chip egress buffer for multicast/shaping.'
    ]
  },
  {
    id: 'rewrite',
    title: '7. Packet Rewrite',
    icon: FileText,
    desc: 'Headers are modified for the next hop.',
    details: [
      'Encapsulation: VXLAN, MPLS, or IP header application.',
      'L3 Updates: DMAC rewrite, TTL decrement.',
      'VLAN Translation: Dot1q tag manipulation.',
      'Distributed resources enable high scale next-hop processing.'
    ]
  },
  {
    id: 'egress-phy',
    title: '8. Network Interface (Egress)',
    icon: ArrowRightLeft,
    desc: 'Final transmission onto the wire.',
    details: [
      'Serialization: Data converted back to bitstream.',
      'IEEE 802.3 Compliance: Standard Ethernet transmission.',
      'Flexible Interfaces: Multi-speed support (10G to 400G/800G).',
      'Optical/Copper: Support for OSFP, QSFP-DD, AOC, and DAC.'
    ]
  }
];

const FEATURE_CATEGORIES = {
  'Layer 2': ['802.1w Rapid Spanning Tree', '4096 VLANs', '802.3ad LACP', 'MLAG (512 ports)', 'Q-in-Q', 'IGMP v1/v2/v3 snooping', 'Storm Control'],
  'Layer 3': ['OSPF, OSPFv3, BGP, IS-IS', 'BGP FlowSpec, BMP', '512-way ECMP', 'VRF & Route Leaking', 'BFD & Micro BFD', 'VXLAN Routing', 'VRRPv3', 'Policy Based Routing'],
  'MPLS & VPN': ['LDP, RSVP-TE, SR-TE', 'L3VPN (IP-VPN)', 'VPWS (Pseudowires)', 'VPLS', 'EVPN-MPLS', 'EVPN-VXLAN', 'Segment Routing', 'TI-LFA'],
  'Security': ['Control Plane Protection (CPP)', 'Algorithmic ACLs', 'MACsec (IEEE 802.1AE)', 'IPsec & VXLANsec', 'RADIUS/TACACS+', 'Atomic ACL Hitless restart'],
  'QoS': ['8 queues per port', 'Strict priority queueing', 'WRED & ECN', 'Shaping / Policing', '802.1Qbb PFC', 'Virtual Output Queueing (VOQ)'],
  'Monitoring': ['LANZ (Microburst Detection)', 'Advanced Mirroring', 'sFlow (RFC 3176)', 'IPFIX', 'INT (Inband Network Telemetry)', 'TCPDump']
};

const InteractiveDatasheet: React.FC<InteractiveDatasheetProps> = ({ isOpen, onClose }) => {
  const [activeSeries, setActiveSeries] = useState('7280R3A');
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeStep, setActiveStep] = useState(0);
  const [featureSearch, setFeatureSearch] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Layer 3');

  if (!isOpen) return null;

  const currentData = DATASHEETS[activeSeries];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-start bg-neutral-50 dark:bg-neutral-950">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
               <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wider flex items-center gap-1">
                 <BookOpen size={10} /> Datasheet
               </span>
               {/* Series Selector */}
               <div className="flex bg-neutral-200 dark:bg-neutral-800 rounded-lg p-0.5">
                  {Object.keys(DATASHEETS).map(series => (
                    <button
                      key={series}
                      onClick={() => setActiveSeries(series)}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                        activeSeries === series 
                          ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm' 
                          : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                      }`}
                    >
                      {series}
                    </button>
                  ))}
               </div>
            </div>
            <h1 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">{currentData.title}</h1>
            <p className="text-neutral-500 mt-1">{currentData.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X size={24} className="text-neutral-500" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-8 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab 
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-neutral-50/50 dark:bg-neutral-950/50 scroll-smooth">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <div className="space-y-8 animate-slide-up">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
                  The <span className="font-bold text-blue-600 dark:text-blue-400">{currentData.title}</span> are designed for the highest performance environments. 
                  Combining deep buffers, VOQ architecture, and internet-scale routing tables, they deliver deterministic network performance 
                  critical for AI clusters, Service Provider peering, and Content Delivery Networks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentData.highlights.map((h, i) => (
                  <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                      <h.icon size={20} />
                    </div>
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-3">{h.title}</h3>
                    <ul className="space-y-2">
                      {h.items.map((item, idx) => (
                        <li key={idx} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-xl">
                 <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Powered by Arista EOS</h3>
                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                      Built on a programmable, modular state-sharing architecture. EOS enables advanced monitoring, 
                      automation, and self-healing resiliency for mission-critical networks.
                    </p>
                    <div className="flex gap-4 text-xs font-bold">
                       <span className="px-3 py-1 bg-white/10 rounded border border-white/20">NetDB State Sharing</span>
                       <span className="px-3 py-1 bg-white/10 rounded border border-white/20">Open Programmability</span>
                       <span className="px-3 py-1 bg-white/10 rounded border border-white/20">Live Patching</span>
                    </div>
                 </div>
                 <div className="hidden md:block w-px h-32 bg-white/10"></div>
                 <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Deep Buffer Architecture</h3>
                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                      With ultra-deep dynamic packet buffers, the {currentData.title} eliminates congestion-related packet loss 
                      in AI/ML and storage workloads, handling microbursts with ease.
                    </p>
                    <div className="flex gap-4 text-xs font-bold">
                       <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">Virtual Output Queues</span>
                       <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">Lossless Forwarding</span>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* INNOVATIONS TAB */}
          {activeTab === 'Innovations' && (
            <div className="animate-slide-up space-y-12">
              
              {/* Timeline Section */}
              <div className="relative">
                 <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">A Decade of Innovation</h2>
                        <p className="text-sm text-neutral-500">Evolution of the Arista R-Series Architecture</p>
                    </div>
                 </div>

                 {/* Timeline Visualization */}
                 <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-4 left-0 right-0 h-0.5 bg-neutral-200 dark:bg-neutral-800 -z-10"></div>
                    
                    {INNOVATION_TIMELINE.map((item, i) => (
                       <div key={i} className="relative pt-0 md:pt-8 group">
                          {/* Dot */}
                          <div className="hidden md:block absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-4 border-white dark:border-neutral-900 bg-neutral-300 dark:bg-neutral-700 group-hover:bg-blue-600 transition-colors z-10"></div>
                          
                          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-xl shadow-sm hover:shadow-md transition-all h-full">
                             <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">{item.year}</div>
                             <div className="font-bold text-neutral-900 dark:text-neutral-100 mb-0.5">{item.title}</div>
                             <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">{item.subtitle}</div>
                             <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Technology Pillars */}
              <div>
                 <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                        <Lightbulb size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">R3 Technology Pillars</h2>
                        <p className="text-sm text-neutral-500">Key architectural breakthroughs in the R3 Series</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TECHNOLOGY_PILLARS.map((tech, i) => (
                       <div key={i} className="flex gap-5 p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                          <div className="shrink-0">
                             <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-900 dark:text-neutral-100">
                                <tech.icon size={24} />
                             </div>
                          </div>
                          <div>
                             <h3 className="font-bold text-lg text-neutral-900 dark:text-neutral-100 mb-2">{tech.title}</h3>
                             <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-4">{tech.desc}</p>
                             <div className="flex flex-wrap gap-2">
                                {tech.stats.map((stat, idx) => (
                                   <span key={idx} className="text-[10px] font-bold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded border border-neutral-200 dark:border-neutral-700">
                                      {stat}
                                   </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

            </div>
          )}

          {/* ARCHITECTURE TAB */}
          {activeTab === 'Architecture' && (
            <div className="animate-slide-up h-full flex flex-col">
              <div className="mb-6 flex-shrink-0">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">A Day in the Life of a Packet</h2>
                  <p className="text-neutral-500 text-sm mt-1">Interactive walkthrough of the 7280R3 Unified Forwarding Pipeline.</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                  {/* Steps List */}
                  <div className="lg:col-span-1 space-y-3 overflow-y-auto pr-2 pb-4">
                      {ARCHITECTURE_STEPS.map((step, index) => (
                          <button
                              key={step.id}
                              onClick={() => setActiveStep(index)}
                              className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                                  activeStep === index
                                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-md scale-[1.02]'
                                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-blue-300 dark:hover:border-blue-700'
                              }`}
                          >
                              <div className="flex items-start gap-3 relative z-10">
                                  <div className={`p-2 rounded-lg shrink-0 transition-colors ${activeStep === index ? 'bg-blue-600 text-white' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-blue-500'}`}>
                                      <step.icon size={18} />
                                  </div>
                                  <div>
                                      <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${activeStep === index ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-400'}`}>Stage {index + 1}</div>
                                      <h3 className={`font-bold text-sm leading-tight ${activeStep === index ? 'text-blue-900 dark:text-blue-100' : 'text-neutral-700 dark:text-neutral-300'}`}>{step.title}</h3>
                                  </div>
                              </div>
                              {activeStep === index && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                          </button>
                      ))}
                  </div>

                  {/* Detail View */}
                  <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm flex flex-col relative overflow-hidden">
                     {/* Background Graphic */}
                     <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Cpu size={240} />
                     </div>

                     <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                           Stage {activeStep + 1} of {ARCHITECTURE_STEPS.length}
                        </div>
                        
                        <h2 className="text-3xl font-black text-neutral-900 dark:text-neutral-100 mb-2">
                           {ARCHITECTURE_STEPS[activeStep].title}
                        </h2>
                        <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed">
                           {ARCHITECTURE_STEPS[activeStep].desc}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {ARCHITECTURE_STEPS[activeStep].details.map((detail, i) => (
                              <div key={i} className="flex gap-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-100 dark:border-neutral-800">
                                 <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-sm shadow-blue-500/50"></div>
                                 <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">{detail}</p>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="mt-auto pt-8 flex justify-between items-center border-t border-neutral-100 dark:border-neutral-800 relative z-10">
                        <button 
                           onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                           disabled={activeStep === 0}
                           className="px-4 py-2 text-sm font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 disabled:opacity-30 disabled:hover:text-neutral-500 transition-colors"
                        >
                           &larr; Previous Stage
                        </button>
                        <div className="flex gap-1">
                           {ARCHITECTURE_STEPS.map((_, i) => (
                              <div key={i} className={`w-2 h-2 rounded-full transition-all ${activeStep === i ? 'bg-blue-600 scale-125' : 'bg-neutral-200 dark:bg-neutral-700'}`}></div>
                           ))}
                        </div>
                        <button 
                           onClick={() => setActiveStep(prev => Math.min(ARCHITECTURE_STEPS.length - 1, prev + 1))}
                           disabled={activeStep === ARCHITECTURE_STEPS.length - 1}
                           className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-30 disabled:hover:text-blue-600 transition-colors"
                        >
                           Next Stage &rarr;
                        </button>
                     </div>
                  </div>
              </div>
            </div>
          )}

          {/* R3 vs R3A Comparison Tab */}
          {activeTab === 'R3 vs R3A' && (
            <div className="animate-slide-up space-y-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Evolution of the R3 Series</h2>
                <p className="text-neutral-500 text-sm">
                  While both platforms share the same EOS architecture and feature set, the R3A introduces the next generation of silicon to deliver higher performance, density, and integrated security.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                 {/* R3 Column */}
                 <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col items-center text-center shadow-sm">
                    <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4 font-bold text-xl text-neutral-600 dark:text-neutral-400">R3</div>
                    <h3 className="font-bold text-lg mb-1">7280R3 Series</h3>
                    <p className="text-xs text-neutral-500 mb-6">Jericho2 Architecture</p>
                    <ul className="space-y-3 w-full text-left">
                        <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <Scale size={16} className="shrink-0 mt-0.5" />
                            <span>16nm Process Technology</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <Activity size={16} className="shrink-0 mt-0.5" />
                            <span>4.8 Tbps per chip capacity</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                            <Lock size={16} className="shrink-0 mt-0.5" />
                            <span>Optional MACsec on specific 'M' models</span>
                        </li>
                    </ul>
                 </div>

                 {/* R3A Column */}
                 <div className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-neutral-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-6 flex flex-col items-center text-center shadow-md relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">NEW GENERATION</div>
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mb-4 font-bold text-xl text-blue-600 dark:text-blue-400">R3A</div>
                    <h3 className="font-bold text-lg mb-1">7280R3A Series</h3>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/80 mb-6">Jericho2C+ Architecture</p>
                    <ul className="space-y-3 w-full text-left">
                        <li className="flex items-start gap-3 text-sm text-neutral-900 dark:text-neutral-200">
                            <Scale size={16} className="shrink-0 mt-0.5 text-blue-500" />
                            <span>7nm Process (Higher Efficiency)</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-neutral-900 dark:text-neutral-200">
                            <Activity size={16} className="shrink-0 mt-0.5 text-blue-500" />
                            <span>7.2 Tbps per chip (+50% capacity)</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-neutral-900 dark:text-neutral-200">
                            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-blue-500" />
                            <span>Native TunnelSec (MACsec/IPsec) on all ports</span>
                        </li>
                    </ul>
                 </div>
              </div>
              
              {/* Detailed Table View */}
              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 dark:bg-neutral-950 text-neutral-500 font-bold uppercase text-[10px]">
                       <tr>
                          <th className="px-6 py-4">Feature</th>
                          <th className="px-6 py-4">7280R3 (Standard)</th>
                          <th className="px-6 py-4 text-blue-600 dark:text-blue-400">7280R3A (Advanced)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                       {R3_VS_R3A_DATA.map((row, i) => (
                          <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                             <td className="px-6 py-4 font-medium text-neutral-900 dark:text-neutral-100">{row.feature}</td>
                             <td className="px-6 py-4">
                                <div className="font-bold text-neutral-700 dark:text-neutral-300">{row.r3.title}</div>
                                <div className="text-xs text-neutral-500">{row.r3.desc}</div>
                             </td>
                             <td className="px-6 py-4 bg-blue-50/30 dark:bg-blue-900/10">
                                <div className="font-bold text-blue-700 dark:text-blue-300">{row.r3a.title}</div>
                                <div className="text-xs text-blue-600/70 dark:text-blue-400/70">{row.r3a.desc}</div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* SCALABILITY TAB */}
          {activeTab === 'Scalability' && (
            <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">FlexRoute™ Scalability</h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    Compare hardware forwarding profiles. Values in Thousands (K).
                  </p>
                </div>
                <div className="flex gap-4 text-xs">
                   <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-sm"></span> IPv4 Routes</div>
                   <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-sm"></span> IPv6 Routes</div>
                   <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> MAC Addr</div>
                </div>
              </div>

              <div className="h-96 w-full bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={currentData.scalability} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.2} />
                    <XAxis dataKey="name" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} label={{ value: 'Entries (Thousands)', angle: -90, position: 'insideLeft', fill: '#888', fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#171717', border: 'none', borderRadius: '8px', color: '#fff' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                      cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    />
                    <Bar dataKey="ipv4" fill="#3b82f6" radius={[4, 4, 0, 0]} name="IPv4 Routes" barSize={30} />
                    <Bar dataKey="ipv6" fill="#a855f7" radius={[4, 4, 0, 0]} name="IPv6 Routes" barSize={30} />
                    <Bar dataKey="mac" fill="#10b981" radius={[4, 4, 0, 0]} name="MAC Addresses" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">~4M</div>
                    <div className="text-xs font-bold uppercase text-neutral-500">Max IPv4 Routes</div>
                    <div className="text-[10px] text-neutral-400 mt-1">With L3-XXXL Profile</div>
                 </div>
                 <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-lg border border-purple-100 dark:border-purple-900/30">
                    <div className="text-2xl font-black text-purple-600 dark:text-purple-400">384K</div>
                    <div className="text-xs font-bold uppercase text-neutral-500">Max MAC Addresses</div>
                    <div className="text-[10px] text-neutral-400 mt-1">Ideal for Large L2 Domains</div>
                 </div>
                 <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-lg border border-orange-100 dark:border-orange-900/30">
                    <div className="text-2xl font-black text-orange-600 dark:text-orange-400">24K</div>
                    <div className="text-xs font-bold uppercase text-neutral-500">ACL Entries</div>
                    <div className="text-[10px] text-neutral-400 mt-1">Algorithmic TCAM</div>
                 </div>
              </div>
            </div>
          )}

          {/* FEATURES TAB */}
          {activeTab === 'Features' && (
            <div className="space-y-6 animate-slide-up">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search features (e.g., 'VXLAN', 'BGP', 'MACsec')..." 
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(FEATURE_CATEGORIES).map(([category, features]) => {
                  // Filter features based on search
                  const filtered = features.filter(f => f.toLowerCase().includes(featureSearch.toLowerCase()));
                  
                  if (featureSearch && filtered.length === 0) return null;

                  return (
                    <div key={category} className="border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900 overflow-hidden">
                      <button 
                        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                      >
                        <h3 className="font-bold text-neutral-800 dark:text-neutral-200">{category}</h3>
                        {expandedCategory === category || featureSearch ? <ChevronUp size={16} className="text-neutral-400"/> : <ChevronDown size={16} className="text-neutral-400"/>}
                      </button>
                      
                      {(expandedCategory === category || featureSearch) && (
                        <div className="px-6 pb-6 bg-neutral-50/30 dark:bg-neutral-950/30">
                          <ul className="space-y-2 mt-2">
                            {(featureSearch ? filtered : features).map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SPECIFICATIONS TAB */}
          {activeTab === 'Specifications' && (
            <div className="animate-slide-up">
              <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Model</th>
                      <th className="px-6 py-4">Port Configuration</th>
                      <th className="px-6 py-4">Throughput</th>
                      <th className="px-6 py-4">Packet Buffer</th>
                      <th className="px-6 py-4">Typ Power</th>
                      <th className="px-6 py-4">Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
                    {currentData.specs.map((s, i) => (
                      <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-blue-600 dark:text-blue-400">{s.model}</td>
                        <td className="px-6 py-4 text-neutral-700 dark:text-neutral-300">{s.ports}</td>
                        <td className="px-6 py-4 font-mono text-neutral-600 dark:text-neutral-400">{s.throughput}</td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{s.buffer}</td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{s.power}</td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400">{s.ru}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 rounded-lg text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed">
                <strong>Note:</strong> {currentData.note}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default InteractiveDatasheet;
