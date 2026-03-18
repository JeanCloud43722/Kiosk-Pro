
import React from 'react';
import { Package } from '../types';

interface PackageCardProps {
  pkg: Package;
  onPickUp: (id: string) => void;
  onSetLocation: (id: string, code: string) => void;
  onScanLocation: (id: string) => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, onPickUp, onSetLocation, onScanLocation }) => {
  const date = new Date(pkg.receivedAt);
  const formattedDate = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleManualLocation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const loc = prompt("Enter storage location (e.g. Shelf B4):", pkg.locationCode || "");
    if (loc !== null) {
      onSetLocation(pkg.id, loc);
    }
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate">{pkg.name}</h3>
          <p className="text-sm text-slate-400 font-mono mt-0.5">{pkg.trackingId}</p>
        </div>
        <div className="text-right ml-4">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">{formattedDate}</p>
          <p className="text-xs text-slate-500">{formattedTime}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        {pkg.locationCode ? (
          <div 
            onClick={handleManualLocation}
            className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 flex items-center justify-between cursor-pointer active:bg-emerald-500/20 transition-colors"
          >
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight">Location</span>
            <span className="text-sm text-emerald-300 font-bold">{pkg.locationCode}</span>
          </div>
        ) : (
          <div className="flex-1 flex gap-2">
            <button
              onClick={() => onScanLocation(pkg.id)}
              className="flex-[2] bg-slate-700 hover:bg-slate-600 active:scale-95 text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all border border-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="text-xs font-bold">Scan Loc</span>
            </button>
            <button
              onClick={handleManualLocation}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 py-2 px-2 rounded-lg text-xs font-bold border border-slate-700"
            >
              Manual
            </button>
          </div>
        )}
      </div>
      
      <button
        onClick={() => onPickUp(pkg.id)}
        className="w-full mt-3 bg-emerald-600 active:bg-emerald-700 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-inner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        Mark Picked Up
      </button>
    </div>
  );
};

export default PackageCard;
