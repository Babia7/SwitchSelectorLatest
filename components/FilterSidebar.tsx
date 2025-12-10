


import React from 'react';
import type { FilterState } from '../types';
import { SlidersHorizontal, Search, RotateCcw, Zap } from 'lucide-react';

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  totalCount: number;
  availableSeries: string[];
  availableSpeeds: string[];
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  filters, 
  setFilters, 
  totalCount,
  availableSeries,
  availableSpeeds
}) => {
  
  const handleSeriesChange = (series: string) => {
    setFilters(prev => {
      const newSeries = prev.series.includes(series)
        ? prev.series.filter(s => s !== series)
        : [...prev.series, series];
      return { ...prev, series: newSeries };
    });
  };

  const handleSpeedChange = (speed: string) => {
    setFilters(prev => {
      const newSpeeds = prev.nativeSpeeds.includes(speed)
        ? prev.nativeSpeeds.filter(s => s !== speed)
        : [...prev.nativeSpeeds, speed];
      return { ...prev, nativeSpeeds: newSpeeds };
    });
  };

  const resetFilters = () => {
      setFilters({
        series: [],
        nativeSpeeds: [],
        minThroughput: 0,
        min800G: 0,
        min400G: 0,
        min100G: 0,
        searchTerm: '',
        sortByDensity: false
      });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-neutral-900 transition-colors duration-300">
      <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <SlidersHorizontal size={16} />
            Filters
          </h2>
          <button 
            onClick={resetFilters} 
            className="text-[11px] font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={10}/> Reset
          </button>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search models..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-200 rounded-md focus:bg-white dark:focus:bg-neutral-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
           <p className="text-xs font-medium text-neutral-500">{totalCount} results found</p>
        </div>
      </div>

      <div className="p-6 space-y-8 overflow-y-auto flex-1 scrollbar-thin">
        
        {/* Highest Density Toggle */}
        <section>
             <button
                onClick={() => setFilters(prev => ({ ...prev, sortByDensity: !prev.sortByDensity }))}
                className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    filters.sortByDensity 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 text-purple-700 dark:text-purple-300' 
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-purple-300'
                }`}
             >
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${filters.sortByDensity ? 'bg-purple-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'}`}>
                        <Zap size={14} fill={filters.sortByDensity ? "currentColor" : "none"} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide">Sort by Highest Density</span>
                </div>
                {filters.sortByDensity && <span className="w-2 h-2 rounded-full bg-purple-500"></span>}
             </button>
             {filters.sortByDensity && (
                 <p className="text-[10px] text-neutral-400 mt-2 px-1">
                     Filters for 7280R3/A, 7060X6, 7050X3/4 and sorts by port count based on selected speed.
                 </p>
             )}
        </section>

        {/* Speed Filter (Prioritized for Density Sort) */}
        <section>
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Native Speed</h3>
          <div className="grid grid-cols-2 gap-2">
            {availableSpeeds.map(speed => (
              <label key={speed} className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                    type="checkbox"
                    checked={filters.nativeSpeeds.includes(speed)}
                    onChange={() => handleSpeedChange(speed)}
                    className="peer h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer checked:bg-blue-600 checked:border-blue-600"
                    />
                </div>
                <span className="ml-2.5 text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 font-medium transition-colors">{speed} Native</span>
              </label>
            ))}
          </div>
        </section>

        {/* Series Filter (Disabled in Density Mode) */}
        <section className={filters.sortByDensity ? 'opacity-50 pointer-events-none' : ''}>
          <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3">Series {filters.sortByDensity && '(Auto-selected)'}</h3>
          <div className="space-y-2">
            {availableSeries.map(series => (
              <label key={series} className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                    type="checkbox"
                    checked={filters.series.includes(series)}
                    onChange={() => handleSeriesChange(series)}
                    className="peer h-4 w-4 rounded border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer checked:bg-blue-600 checked:border-blue-600"
                    />
                </div>
                <span className="ml-2.5 text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-neutral-200 font-medium transition-colors">{series}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Throughput Filter */}
        <FilterRange 
            label="Min Throughput" 
            value={filters.minThroughput} 
            unit="Tbps" 
            min={0} 
            max={102.4} 
            step={1}
            onChange={(val) => setFilters(prev => ({ ...prev, minThroughput: val }))}
        />

         {/* 800G Ports Filter */}
        <FilterRange 
            label="Min 800G Ports" 
            value={filters.min800G} 
            unit="" 
            min={0} 
            max={128} 
            step={4}
            onChange={(val) => setFilters(prev => ({ ...prev, min800G: val }))}
        />
        
        {/* 400G Ports Filter */}
        <FilterRange 
            label="Min 400G Ports" 
            value={filters.min400G} 
            unit="" 
            min={0} 
            max={128} 
            step={4}
            onChange={(val) => setFilters(prev => ({ ...prev, min400G: val }))}
        />

        {/* 100G Ports Filter */}
        <FilterRange 
            label="Min 100G Ports" 
            value={filters.min100G} 
            unit="" 
            min={0} 
            max={256} 
            step={8}
            onChange={(val) => setFilters(prev => ({ ...prev, min100G: val }))}
        />
      </div>
    </div>
  );
};

interface FilterRangeProps {
    label: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}

const FilterRange: React.FC<FilterRangeProps> = ({ label, value, unit, min, max, step, onChange }) => (
    <section>
        <div className="flex justify-between items-baseline mb-3">
            <h3 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</h3>
            <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-500/20">
                {value}{unit ? ` ${unit}` : ''}
            </span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <div className="flex justify-between text-[10px] text-neutral-500 dark:text-neutral-600 mt-2 font-medium">
            <span>{min}</span>
            <span>{max}+</span>
        </div>
    </section>
);

export default FilterSidebar;