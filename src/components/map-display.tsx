'use client';

import { Shield, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VaultStatus } from './dashboard';

interface VehicleProps {
  id: string;
  position: { top: string; left: string };
}

const Vehicle = ({ id, position }: VehicleProps) => (
  <div
    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
    style={{ top: position.top, left: position.left }}
  >
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-secondary/80 border-2 border-muted-foreground/50 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:scale-110">
      <Truck className="w-6 h-6 text-foreground" />
    </div>
    <span className="mt-2 text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">{id}</span>
  </div>
);

const VaultServerIcon = ({ status }: { status: VaultStatus }) => {
  const isSealed = status === 'sealed';
  const isUnsealed = status === 'unsealed';
  const isUnknown = status === 'unknown' || status === 'error';

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
      style={{ top: '50%', left: '50%' }}
    >
      <div
        className={cn(
          'relative w-16 h-16 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg border-4 transition-all duration-500 backdrop-blur-sm',
          isUnsealed && 'bg-primary/80 border-blue-400',
          isSealed && 'bg-destructive/80 border-red-500',
          isUnknown && 'bg-gray-600/80 border-gray-400 animate-pulse'
        )}
      >
        {isUnsealed && <div className="absolute inset-0 rounded-full animate-pulse" style={{ animationDuration: '2s', boxShadow: '0 0 0 0px hsl(var(--primary))' }}></div>}
        {isSealed && <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ animationDuration: '1.5s', backgroundColor: 'hsl(var(--destructive))' }}></div>}
        <Shield className="w-8 h-8 z-10" />
      </div>
      <span className="mt-3 text-sm font-bold text-white bg-black/50 px-2.5 py-1 rounded">VAULT HQ</span>
    </div>
  );
};

export const MapDisplay = ({ vaultStatus }: { vaultStatus: VaultStatus }) => {
  const vehicles: VehicleProps[] = [
    { id: 'Stryker-1', position: { top: '35%', left: '30%' } },
    { id: 'Stryker-2', position: { top: '35%', left: '70%' } },
    { id: 'Stryker-3', position: { top: '75%', left: '50%' } },
  ];

  return (
    <div className="w-full h-full rounded-lg border border-border shadow-inner overflow-hidden relative bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1568623229237-072211de2cb2?q=80&w=2070&auto=format&fit=crop')" }}>
        <div className="absolute inset-0 bg-black/40"></div>
        <VaultServerIcon status={vaultStatus} />
        {vehicles.map(vehicle => <Vehicle key={vehicle.id} {...vehicle} />)}
    </div>
  );
};
