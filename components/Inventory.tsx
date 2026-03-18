
import React from 'react';
import { Package } from '../types';
import PackageCard from './PackageCard';

interface InventoryProps {
  packages: Package[];
  onPickUp: (id: string) => void;
  onSetLocation: (id: string, code: string) => void;
  onScanLocation: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ packages, onPickUp, onSetLocation, onScanLocation }) => {
  const activePackages = packages
    .filter(p => !p.pickedUp)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());

  return (
    <div className="p-4 h-full overflow-y-auto pb-24">
      <div className="flex justify-between items-center mb-6 px-1">
        <h1 className="text-2xl font-bold text-white">Stockpile</h1>
        <span className="bg-slate-700 px-3 py-1 rounded-full text-xs font-mono text-emerald-400">
          {activePackages.length} units
        </span>
      </div>

      {activePackages.length === 0 ? (
        <div className="mt-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
             </svg>
          </div>
          <p className="text-slate-500">Kiosk is clear.</p>
        </div>
      ) : (
        activePackages.map(pkg => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            onPickUp={onPickUp} 
            onSetLocation={onSetLocation}
            onScanLocation={onScanLocation}
          />
        ))
      )}
    </div>
  );
};

export default Inventory;
