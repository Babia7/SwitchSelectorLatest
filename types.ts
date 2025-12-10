
export interface SwitchSpec {
  id: string;
  model: string;
  series: string;
  description: string;
  type: 'Switch' | 'Line Card' | 'Spine Switch' | 'Leaf Switch';
  ports: string;
  max800G: number;
  max400G: number;
  max100G: number;
  throughputTbps: number;
  pps: string;
  latency: string;
  cpu: string;
  memory: string;
  buffer: string;
  powerDraw: string;
  size: string;
  weight: string;
  eosLicense?: string;
}

export interface FilterState {
  series: string[];
  nativeSpeeds: string[];
  minThroughput: number;
  min800G: number;
  min400G: number;
  min100G: number;
  searchTerm: string;
  sortByDensity: boolean;
}

export interface FeedbackItem {
  id: string;
  type: 'Bug' | 'Feature' | 'General';
  message: string;
  timestamp: number;
}
