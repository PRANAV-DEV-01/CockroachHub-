import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Activity, Train, ArrowRight } from 'lucide-react';
import { Station, Disruption } from '../types';
import { format } from 'date-fns';

export function StatusBadge({ status }: { status: "Open" | "Limited" | "Closed" }) {
  if (status === 'Open') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Open
      </span>
    );
  }
  if (status === 'Limited') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Limited
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      Closed
    </span>
  );
}

export function StationCard({ 
  station, 
  disruption, 
  onClick 
}: { 
  station: Station; 
  disruption?: Disruption; 
  onClick: () => void 
}) {
  const status = disruption?.status || 'Open';

  return (
    <motion.button
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col text-left p-5 rounded-2xl bg-card border border-card-border shadow-sm hover:shadow-md transition-all hover-elevate overflow-hidden relative group"
    >
      <div className="flex justify-between items-start w-full mb-4">
        <div>
          <h3 className="text-lg font-bold text-foreground leading-tight tracking-tight font-display">{station.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {station.area}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-wrap gap-2 mt-auto">
        {station.lines.map((line) => (
          <div 
            key={line.name} 
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-black/40 border border-white/5"
          >
            <span 
              className="w-2 h-2 rounded-full shadow-sm" 
              style={{ backgroundColor: line.color }} 
            />
            {line.name}
          </div>
        ))}
      </div>

      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
         <ArrowRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </motion.button>
  );
}

export function DetailPanel({
  station,
  disruption,
  onClose
}: {
  station: Station;
  disruption?: Disruption;
  onClose: () => void;
}) {
  const status = disruption?.status || 'Open';

  // Handle escape key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
        />
        
        <motion.div
          initial={{ x: '100%', boxShadow: '-20px 0 25px -5px rgba(0, 0, 0, 0.5)' }}
          animate={{ x: 0 }}
          exit={{ x: '100%', boxShadow: '0px 0 0px 0px rgba(0, 0, 0, 0)' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col z-10 overflow-y-auto"
        >
          <div className="p-6 pb-4 border-b border-border/50 flex justify-between items-start sticky top-0 bg-card/95 backdrop-blur z-20">
            <div>
              <StatusBadge status={status} />
              <h2 className="text-3xl font-extrabold mt-3 font-display tracking-tight text-foreground">{station.name}</h2>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> {station.area}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-8 flex-1">
            {/* Status Section */}
            <section className="bg-black/20 rounded-xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4" /> Operations
              </h3>
              
              {status === 'Open' ? (
                <p className="text-emerald-400 font-medium">
                  No reported disruptions. Running normally.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className={`font-medium text-lg ${status === 'Closed' ? 'text-rose-400' : 'text-amber-400'}`}>
                    {disruption?.reason}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {disruption?.lastUpdated ? format(new Date(disruption.lastUpdated), 'MMM d, yyyy • h:mm a') : 'Unknown'}
                  </p>
                </div>
              )}
            </section>

            {/* Lines */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                <Train className="w-4 h-4" /> Connecting Lines
              </h3>
              <div className="flex flex-wrap gap-2">
                {station.lines.map((line) => (
                  <div 
                    key={line.name} 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-black/40 border border-white/5"
                  >
                    <span 
                      className="w-3 h-3 rounded-full shadow-sm" 
                      style={{ backgroundColor: line.color }} 
                    />
                    {line.name}
                  </div>
                ))}
              </div>
            </section>

            {/* Facts Grid */}
            <section className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Type</p>
                <p className="font-semibold text-foreground">{station.type}</p>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Interchange</p>
                <p className="font-semibold text-foreground">{station.interchange ? 'Yes ⇄' : 'No'}</p>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Latitude</p>
                <p className="font-mono text-sm text-foreground">{station.coordinates.lat.toFixed(4)}</p>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Longitude</p>
                <p className="font-mono text-sm text-foreground">{station.coordinates.lng.toFixed(4)}</p>
              </div>
            </section>

            {/* Alternatives */}
            {station.alternatives.length > 0 && status !== 'Open' && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                  Alternative Stations
                </h3>
                <div className="flex flex-col gap-2">
                  {station.alternatives.map(alt => (
                    <div key={alt} className="px-4 py-3 rounded-lg bg-black/20 border border-white/5 text-sm font-medium flex items-center justify-between group">
                      {alt}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
