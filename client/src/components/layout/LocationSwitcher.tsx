import React, { useState } from 'react';
import { MapPin, ChevronDown, Check, Building } from 'lucide-react';

export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  doctorsCount: number;
  isPrimary?: boolean;
}

export const defaultLocations: ClinicLocation[] = [
  {
    id: 'loc-downtown',
    name: 'Apex Dental - Downtown Flagship',
    address: '450 Sutter St, Suite 1200, San Francisco',
    phone: '+1 (555) 234-5678',
    doctorsCount: 3,
    isPrimary: true,
  },
  {
    id: 'loc-north',
    name: 'Apex Dental - North Bay Pavilion',
    address: '1800 Redwood Hwy, Corte Madera',
    phone: '+1 (555) 987-6543',
    doctorsCount: 2,
  },
  {
    id: 'loc-airport',
    name: 'Apex Dental - SFO Medical Suites',
    address: '300 Gateway Blvd, South San Francisco',
    phone: '+1 (555) 345-6789',
    doctorsCount: 1,
  },
];

interface LocationSwitcherProps {
  currentLocation: ClinicLocation;
  onSelectLocation: (loc: ClinicLocation) => void;
}

export const LocationSwitcher: React.FC<LocationSwitcherProps> = ({
  currentLocation,
  onSelectLocation,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm"
      >
        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[190px]">{currentLocation.name}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Multi-Location Branches</span>
              <span className="text-blue-500 font-mono">3 Active</span>
            </div>

            {defaultLocations.map((loc) => {
              const isSelected = loc.id === currentLocation.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(loc);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0">
                    <p className="text-xs font-bold truncate">{loc.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{loc.address}</p>
                    <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                      {loc.doctorsCount} Clinicians • {loc.phone}
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-blue-500 shrink-0 mt-1" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
