'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { MapDisplay } from './map-display';
import { ControlPanel } from './control-panel';
import { EventLog, type LogEntry } from './event-log';

export type VaultStatus = 'unsealed' | 'sealed' | 'unknown' | 'error';

export interface VaultState {
  vault_server: {
    status: VaultStatus;
  };
}

export const Dashboard = () => {
  const [vaultState, setVaultState] = useState<VaultState>({ vault_server: { status: 'unknown' } });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      timestamp: new Date(),
      message,
      type,
    };
    setLogs(prevLogs => [newLog, ...prevLogs]);
  }, []);

  useEffect(() => {
    addLog('UI Initialized. Connecting to demo controller...', 'info');

    const checkState = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/state');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const state: VaultState = await response.json();
        setVaultState(prevState => {
            if (prevState.vault_server.status !== state.vault_server.status) {
                if (prevState.vault_server.status !== 'unknown') {
                    addLog(`Vault status changed to: ${state.vault_server.status.toUpperCase()}`, 'warn');
                }
            }
            return state;
        });
      } catch (error) {
        if (vaultState.vault_server.status !== 'error') {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            addLog(`Cannot connect to demo controller: ${errorMessage}`, 'danger');
            setVaultState({ vault_server: { status: 'error' } });
        }
      }
    };
    
    const intervalId = setInterval(checkState, 3000);
    checkState();

    return () => clearInterval(intervalId);
  }, [addLog, vaultState.vault_server.status]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="bg-card border-b border-border p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Vault Tactical Edge Demo</h1>
        </div>
      </header>
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        <div className="lg:col-span-5 xl:col-span-6 h-full">
            <MapDisplay vaultStatus={vaultState.vault_server.status} />
        </div>
        <div className="lg:col-span-4 xl:col-span-3 h-full overflow-y-auto">
            <ControlPanel addLog={addLog} />
        </div>
        <div className="lg:col-span-3 xl:col-span-3 h-full">
            <EventLog logs={logs} />
        </div>
      </main>
    </div>
  );
};
