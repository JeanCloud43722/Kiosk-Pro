
import React, { useState, useEffect, useCallback } from 'react';
import { Tab, Package } from './types';
import { db } from './services/db';
import Scanner from './components/Scanner';
import LocationScanner from './components/LocationScanner';
import Inventory from './components/Inventory';
import Search from './components/Search';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [locationTargetId, setLocationTargetId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await db.init();
        const data = await db.getAll();
        setPackages(data);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handlePackageScanned = useCallback(async (pkg: Package) => {
    setPackages(prev => [...prev, pkg]);
    setLocationTargetId(pkg.id);
    await db.save(pkg);
    // Auto-switch to location tab for rapid workflow
    setActiveTab('set-location');
  }, []);

  const handleLocationScanned = useCallback(async (code: string) => {
    if (!locationTargetId) {
      alert("No package to link location to. Scan a package first.");
      setActiveTab('scan');
      return;
    }

    setPackages(prev => {
      const updated = prev.map(p => p.id === locationTargetId ? { ...p, locationCode: code } : p);
      const updatedPkg = updated.find(p => p.id === locationTargetId);
      if (updatedPkg) db.save(updatedPkg);
      return updated;
    });

    // Provide haptic-like visual feedback then go back to inventory
    setTimeout(() => {
        setActiveTab('inventory');
        setLocationTargetId(null);
    }, 300);
  }, [locationTargetId]);

  const handleInitiateLocationScan = useCallback((id: string) => {
    setLocationTargetId(id);
    setActiveTab('set-location');
  }, []);

  const handleSetLocationManual = useCallback(async (id: string, code: string) => {
    setPackages(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, locationCode: code } : p);
      const pkg = updated.find(p => p.id === id);
      if (pkg) db.save(pkg);
      return updated;
    });
  }, []);

  const handlePickUp = useCallback(async (id: string) => {
    setPackages(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, pickedUp: true } : p);
      const pkg = updated.find(p => p.id === id);
      if (pkg) db.save(pkg);
      return updated;
    });
  }, []);

  const locationTargetName = packages.find(p => p.id === locationTargetId)?.name || null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900 flex items-center justify-center">
         <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-900 font-sans">
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'scan' && <Scanner onPackageScanned={handlePackageScanned} />}
        {activeTab === 'set-location' && (
            <LocationScanner 
                lastPackageName={locationTargetName} 
                onLocationScanned={handleLocationScanned} 
            />
        )}
        {activeTab === 'inventory' && (
            <Inventory 
                packages={packages} 
                onPickUp={handlePickUp} 
                onSetLocation={handleSetLocationManual}
                onScanLocation={handleInitiateLocationScan}
            />
        )}
        {activeTab === 'search' && (
            <Search 
                packages={packages} 
                onPickUp={handlePickUp} 
                onSetLocation={handleSetLocationManual}
                onScanLocation={handleInitiateLocationScan}
            />
        )}
      </main>

      <nav className="h-20 bg-slate-950 border-t border-slate-800 flex items-center justify-around safe-bottom z-50">
        <NavItem active={activeTab === 'scan'} label="Package" onClick={() => setActiveTab('scan')}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </NavItem>
        
        <NavItem active={activeTab === 'set-location'} label="Location" onClick={() => setActiveTab('set-location')}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </NavItem>

        <NavItem active={activeTab === 'inventory'} label="Stock" onClick={() => setActiveTab('inventory')} badge={packages.filter(p => !p.pickedUp).length}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </NavItem>

        <NavItem active={activeTab === 'search'} label="Find" onClick={() => setActiveTab('search')}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </NavItem>
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, label: string, onClick: () => void, children: React.ReactNode, badge?: number }> = ({ active, label, onClick, children, badge }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-1/4 py-2 transition-all ${active ? 'text-emerald-400' : 'text-slate-500'}`}>
    <div className="relative">
      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 mb-1 ${active ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {children}
      </svg>
      {!!badge && badge > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-bold text-white ring-2 ring-slate-950">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
