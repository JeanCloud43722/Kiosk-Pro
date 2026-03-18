
import React, { useState, useMemo } from 'react';
import { Package } from '../types';
import PackageCard from './PackageCard';

interface SearchProps {
  packages: Package[];
  onPickUp: (id: string) => void;
  onSetLocation: (id: string, code: string) => void;
  onScanLocation: (id: string) => void;
}

const Search: React.FC<SearchProps> = ({ packages, onPickUp, onSetLocation, onScanLocation }) => {
  const [query, setQuery] = useState('');

  const filteredPackages = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return packages.filter(p => 
      !p.pickedUp && 
      (p.name.toLowerCase().includes(lowerQuery) || 
       p.trackingId.toLowerCase().includes(lowerQuery) ||
       (p.locationCode && p.locationCode.toLowerCase().includes(lowerQuery)))
    );
  }, [packages, query]);

  return (
    <div className="p-4 h-full overflow-y-auto pb-24">
      <h1 className="text-2xl font-bold text-white mb-6 px-1">Fast Search</h1>
      
      <div className="relative mb-8">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Name, ID, or Location..."
          className="w-full bg-slate-800 border-2 border-slate-700 focus:border-emerald-500 rounded-xl px-5 py-4 text-white outline-none transition-all placeholder:text-slate-600 shadow-xl"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPackages.map(pkg => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            onPickUp={onPickUp} 
            onSetLocation={onSetLocation}
            onScanLocation={onScanLocation}
          />
        ))}
      </div>

      {!query.trim() && (
        <div className="text-center py-20 opacity-30 select-none">
          <p className="text-slate-400 font-medium">Ready for input</p>
        </div>
      )}
    </div>
  );
};

export default Search;
