
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const glossary: Record<string, string> = {
  'OSFP': 'Octal Small Form-factor Pluggable. A high-speed pluggable transceiver form factor supporting 400G and 800G, designed for optimal thermal performance.',
  'QSFP-DD': 'Quad Small Form-factor Pluggable Double Density. A high-speed pluggable form factor that doubles the density of QSFP28, supporting 200G and 400G.',
  'QSFP56': 'Quad Small Form-factor Pluggable 56. Supports 200G Ethernet using 4x 50G PAM4 lanes.',
  'QSFP28': 'Quad Small Form-factor Pluggable 28. Standard for 100G Ethernet interface.',
  'QSFP100': '100 Gigabit Quad Small Form-factor Pluggable. Standard interface for 100GbE.',
  'QSFP': 'Quad Small Form-factor Pluggable. A compact, hot-pluggable network interface transceiver.',
  'SFP-DD': 'Small Form-factor Pluggable Double Density. Supports high-density 100G interfaces in a form factor backward compatible with SFP+.',
  'DSFP': 'Dual Small Form-factor Pluggable. Doubles the density of SFP by using two electrical lanes.',
  'SFP+': 'Enhanced Small Form-factor Pluggable. Standard for 10G Ethernet.',
  'SFP25': 'Small Form-factor Pluggable 25. Standard for 25G Ethernet.',
  'MACsec': 'Media Access Control Security. Provides point-to-point security on Ethernet links between nodes.',
  'Tbps': 'Terabits per second. A measure of data transfer speed (1,000 Gbps).',
  'Bpps': 'Billions of packets per second. A measure of packet forwarding rate.',
  'EVPN': 'Ethernet VPN. A standards-based technology that provides virtual connectivity between different Layer 2/3 domains over an IP or MPLS network.',
  'VXLAN': 'Virtual Extensible LAN. A network virtualization technology that attempts to address the scalability problems associated with large cloud computing deployments.',
  'LPO': 'Linear Drive Pluggable Optics. Technology removing the DSP from the pluggable module to reduce power and latency.',
  'PCIe': 'Peripheral Component Interconnect Express. A high-speed serial computer expansion bus standard.',
  'VOQ': 'Virtual Output Queuing. A buffering technique used to prevent head-of-line blocking in network switches.',
  'MPLS': 'Multiprotocol Label Switching. A routing technique in telecommunications networks that directs data from one node to the next based on short path labels.',
  'OSPF': 'Open Shortest Path First. A routing protocol for IP networks.',
  'MP-BGP': 'Multiprotocol BGP. Extensions to BGP to carry routing information for multiple network layer protocols (IPv6, VPNs, etc.).',
  'BGP-LS': 'BGP Link-State. Extensions to BGP for distributing topology information (link-state) to an SDN controller or PCE.',
  'BGP-LU': 'BGP Labeled Unicast. Allows BGP to carry MPLS label information, enabling seamless MPLS connectivity across domains.',
  'BGP': 'Border Gateway Protocol. A standardized exterior gateway protocol designed to exchange routing and reachability information.',
  'ISIS': 'Intermediate System to Intermediate System. A routing protocol designed to move information efficiently within a computer network.',
  'PIM': 'Protocol Independent Multicast. A family of multicast routing protocols.',
  'GRE': 'Generic Routing Encapsulation. A tunneling protocol developed by Cisco Systems.',
  'NAT': 'Network Address Translation. A method of mapping an IP address space into another by modifying network address information in the IP header of packets.',
  'ACLs': 'Access Control Lists. A list of rules that specifies which users or systems are granted or denied access to a particular object or system resource.',
  'VRFs': 'Virtual Routing and Forwarding. Allows multiple instances of a routing table to co-exist within the same router at the same time.',
  'MLAG': 'Multi-Chassis Link Aggregation. Enables the grouping of links across two distinct physical switches into a single logical link.',
  'RSVP-TE': 'Resource Reservation Protocol - Traffic Engineering. Used to reserve resources and establish LSPs in MPLS networks.',
  'SR-TE': 'Segment Routing Traffic Engineering. Uses source routing to steer packets through specific paths.',
  'TI-LFA': 'Topology Independent Loop-Free Alternate. A fast reroute mechanism for Segment Routing.',
  'E-OAM': 'Ethernet Operations, Administration, and Maintenance. Protocols for installing, monitoring, and troubleshooting Ethernet networks.',
  'MPLS Pseudowires': 'Emulation of a point-to-point connection over a packet-switching network.',
  'Anycast RP': 'Anycast Rendezvous Point. A mechanism in PIM-SM where multiple RPs share the same IP address for redundancy.',
  'L3VPN': 'Layer 3 VPN. A VPN architecture using MPLS to create private IP networks over a public infrastructure.',
  'L2VPN': 'Layer 2 VPN. Enables Layer 2 connectivity (Ethernet, etc.) over an MPLS or IP network.',
  'MVPN': 'Multicast VPN. A method for sending multicast traffic across an MPLS VPN backbone.',
  'VPLS': 'Virtual Private LAN Service. An Ethernet-based multipoint-to-multipoint Layer 2 VPN.',
  'FRR': 'Fast Reroute. A mechanism to rapidly switch traffic to a backup path in the event of a link or node failure.'
};

interface TextWithTooltipProps {
  text: string;
  className?: string;
}

const TooltipPortal = ({ text, rect }: { text: string, rect: DOMRect }) => {
  if (typeof document === 'undefined') return null;

  // Calculate position centered above the element
  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translate(-50%, -100%) translateY(-8px)',
    zIndex: 9999, // Ensure it sits on top of modals and drawers
    pointerEvents: 'none',
  };

  return createPortal(
    <div style={style} className="w-48 sm:w-64 p-3 bg-neutral-900 dark:bg-neutral-800 text-white text-xs rounded-lg shadow-xl border border-neutral-700 text-center leading-relaxed animate-fade-in">
      {text}
      {/* Arrow */}
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-800"></div>
    </div>,
    document.body
  );
};

interface TooltipWordProps {
  word: string;
  definition: string;
}

const TooltipWord: React.FC<TooltipWordProps> = ({ word, definition }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);

  const handleMouseEnter = () => {
    if (ref.current) {
      setRect(ref.current.getBoundingClientRect());
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Re-calculate rect on scroll to keep tooltip attached if user scrolls while hovering
  useEffect(() => {
    if (!isHovered) return;
    const handleScroll = () => {
       if (ref.current) setRect(ref.current.getBoundingClientRect());
    };
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isHovered]);

  return (
    <>
      <span 
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help border-b border-dotted border-neutral-400 hover:border-blue-500 dark:border-neutral-600 dark:hover:border-blue-400 text-blue-700 dark:text-blue-300 font-medium transition-colors"
      >
        {word}
      </span>
      {isHovered && rect && <TooltipPortal text={definition} rect={rect} />}
    </>
  );
};

const TextWithTooltip: React.FC<TextWithTooltipProps> = ({ text, className = '' }) => {
  const segments = React.useMemo(() => {
    if (!text) return [];
    
    // Sort keys by length descending to match longest terms first (e.g., "QSFP-DD" before "QSFP")
    const sortedKeys = Object.keys(glossary).sort((a, b) => b.length - a.length);
    // Escape for regex
    const escapedKeys = sortedKeys.map(key => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escapedKeys.join('|')})\\b`, 'g');
    
    // Split and keep delimiters
    return text.split(pattern);
  }, [text]);

  return (
    <span className={className}>
      {segments.map((part, index) => {
        const definition = glossary[part];
        if (definition) {
          return <TooltipWord key={index} word={part} definition={definition} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

export default TextWithTooltip;
