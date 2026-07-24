import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, X, Train, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './safecircle.css';
import { useMetroData } from './hooks/useMetroData';
import { StationCard, DetailPanel } from './components/StationComponents';
import { Station } from './types';
import { motion, AnimatePresence } from 'framer-motion';

export default function SafeCirclePage() {
  const { stations, disruptions, disruptionMap, loading, error } = useMetroData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLineFilter, setActiveLineFilter] = useState<string | null>(null);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close autocomplete on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute unique lines for filters
  const uniqueLines = useMemo(() => {
    const map = new Map<string, string>();
    stations.forEach(s => {
      s.lines.forEach(l => {
        if (!map.has(l.name)) map.set(l.name, l.color);
      });
    });
    return Array.from(map.entries()).map(([name, color]) => ({ name, color }));
  }, [stations]);

  // Autocomplete matching
  const autocompleteResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return stations
      .filter(s => s.name.toLowerCase().includes(query) || s.area.toLowerCase().includes(query))
      .slice(0, 7);
  }, [searchQuery, stations]);

  // Main grid filtering
  const filteredStations = useMemo(() => {
    return stations.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.area.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLine = activeLineFilter ? s.lines.some(l => l.name === activeLineFilter) : true;
      return matchesSearch && matchesLine;
    });
  }, [stations, searchQuery, activeLineFilter]);

  // Overview stats
  const stats = useMemo(() => {
    return {
      total: stations.length,
      lines: uniqueLines.length,
      interchanges: stations.filter(s => s.interchange).length,
      disrupted: disruptions.length,
      open: stations.length - disruptions.length
    };
  }, [stations, uniqueLines, disruptions]);

  // Chart data
  const chartData = useMemo(() => {
    const lineCounts = new Map<string, number>();
    stations.forEach(s => {
      s.lines.forEach(l => {
        lineCounts.set(l.name, (lineCounts.get(l.name) || 0) + 1);
      });
    });
    
    return uniqueLines
      .map(line => ({
        ...line,
        count: lineCounts.get(line.name) || 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [stations, uniqueLines]);

  // Keyboard nav
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || autocompleteResults.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < autocompleteResults.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = autocompleteResults[selectedIndex];
      if (selected) {
        setSelectedStationId(selected.id);
        setSearchQuery(selected.name);
        setIsFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-display font-medium text-lg text-muted-foreground animate-pulse">Initializing MetroRoute Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center max-w-md p-6 bg-destructive/10 rounded-2xl border border-destructive/20">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">System Failure</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  const selectedStation = selectedStationId ? stations.find(s => s.id === selectedStationId) : undefined;

  return (
    <div className="safecircle-scope min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground pb-20">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground mr-1 hidden sm:block">← CockroachHub</Link>
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-display font-bold text-lg shadow-[0_0_15px_rgba(123,97,255,0.4)]">
              S
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight hidden sm:block">SafeCircle<span className="text-muted-foreground font-medium ml-1">· Metro Route Delhi</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3 text-sm font-medium">
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/5">{stats.total} Stations</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> {stats.open} Open</span>
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/> {stats.disrupted} Alerts</span>
            </div>
            <a href="#about" className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-4 hidden sm:block">Disclaimer</a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-12 md:pt-20">
        
        {/* Hero & Search */}
        <div className="max-w-2xl mx-auto text-center mb-12 relative z-30">
          <h2 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
            Where to, Delhi?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Check live disruption status and operating information for {stats.total} stations before you commute.
          </p>

          <div className="relative text-left" ref={searchRef}>
            <div className={`relative flex items-center bg-card rounded-2xl border transition-all duration-300 ${isFocused ? 'border-primary shadow-[0_0_0_4px_rgba(123,97,255,0.1)]' : 'border-card-border shadow-sm'}`}>
              <Search className="w-6 h-6 text-muted-foreground ml-4 absolute pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search stations or areas..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                onKeyDown={handleKeyDown}
                className="w-full h-14 pl-12 pr-12 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none rounded-2xl"
              />
              {searchQuery && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    inputRef.current?.focus();
                  }}
                  className="absolute right-4 p-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {isFocused && autocompleteResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
                >
                  {autocompleteResults.map((station, idx) => (
                    <button
                      key={station.id}
                      onClick={() => {
                        setSelectedStationId(station.id);
                        setSearchQuery(station.name);
                        setIsFocused(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${idx === selectedIndex ? 'bg-white/10' : 'hover:bg-white/5'}`}
                    >
                      <div>
                        <span className="font-semibold text-foreground block">{station.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/>{station.area}</span>
                      </div>
                      <div className="flex gap-1">
                        {station.lines.map(l => (
                          <span key={l.name} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                        ))}
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Line Filters */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveLineFilter(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeLineFilter === null 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              All Lines
            </button>
            {uniqueLines.map(line => (
              <button
                key={line.name}
                onClick={() => setActiveLineFilter(line.name)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  activeLineFilter === line.name
                    ? 'bg-white/15 border-white/20 text-foreground shadow-sm'
                    : 'bg-card border-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: line.color }} />
                {line.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-display">
              {activeLineFilter ? `${activeLineFilter} Line Stations` : 'All Stations'}
              <span className="ml-3 text-sm font-normal text-muted-foreground px-2 py-0.5 rounded-md bg-white/5 border border-white/5">
                {filteredStations.length} found
              </span>
            </h3>
          </div>

          {filteredStations.length === 0 ? (
            <div className="py-20 text-center rounded-2xl bg-black/20 border border-white/5 border-dashed">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No stations found matching your criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setActiveLineFilter(null); }}
                className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence>
                {filteredStations.map(station => (
                  <StationCard 
                    key={station.id}
                    station={station}
                    disruption={disruptionMap.get(station.id)}
                    onClick={() => setSelectedStationId(station.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Network Overview */}
        <div className="pt-16 border-t border-white/5 mb-16">
          <h2 className="text-2xl font-bold font-display mb-8">Network Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="p-5 rounded-2xl bg-card border border-card-border">
              <p className="text-sm text-muted-foreground mb-1">Stations Monitored</p>
              <p className="text-3xl font-bold text-foreground font-display">{stats.total}</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-card-border">
              <p className="text-sm text-muted-foreground mb-1">Active Lines</p>
              <p className="text-3xl font-bold text-foreground font-display">{stats.lines}</p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-card-border">
              <p className="text-sm text-muted-foreground mb-1">Interchanges</p>
              <p className="text-3xl font-bold text-foreground font-display">{stats.interchanges}</p>
            </div>
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <p className="text-sm text-rose-400 mb-1">Active Disruptions</p>
              <p className="text-3xl font-bold text-rose-500 font-display">{stats.disrupted}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-2xl bg-card border border-card-border overflow-hidden">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Train className="w-5 h-5 text-muted-foreground" />
              Stations per Line
            </h3>
            <div className="space-y-4">
              {chartData.map(line => {
                const max = Math.max(...chartData.map(d => d.count));
                const percentage = (line.count / max) * 100;
                
                return (
                  <div key={line.name} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium text-muted-foreground truncate" title={line.name}>
                      {line.name}
                    </div>
                    <div className="flex-1 h-3 bg-black/40 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full shadow-sm"
                        style={{ backgroundColor: line.color }}
                      />
                    </div>
                    <div className="w-8 text-right text-sm font-bold text-foreground">
                      {line.count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </main>

      {/* Detail Panel */}
      {selectedStation && (
        <DetailPanel 
          station={selectedStation} 
          disruption={disruptionMap.get(selectedStation.id)}
          onClose={() => setSelectedStationId(null)}
        />
      )}

      {/* Footer */}
      <footer id="about" className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="w-8 h-8 bg-black/40 rounded mx-auto flex items-center justify-center text-muted-foreground font-display font-bold text-sm mb-4 border border-white/5">
            M
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Independent student project — not affiliated with or endorsed by DMRC. 
            Data is curated for learning purposes only and may not reflect real-time conditions.
          </p>
        </div>
      </footer>
    </div>
  );
}
