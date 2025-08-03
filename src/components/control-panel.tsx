'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { AiRecommendations } from './ai-recommendations';
import type { LogEntry } from './event-log';
import { useToast } from '@/hooks/use-toast';


interface ControlPanelProps {
  addLog: (message: string, type?: LogEntry['type']) => void;
}

export const ControlPanel = ({ addLog }: ControlPanelProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSealVault = async () => {
    setIsLoading(true);
    addLog('Executing Scenario: Seal Vault Server', 'warn');
    try {
      const response = await fetch('http://localhost:8080/api/actions/seal-vault', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.details || result.message || 'Failed to seal Vault');
      }
      addLog(result.message, 'success');
      toast({
        title: "Action Sent",
        description: result.message,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`Error sealing vault: ${errorMessage}`, 'danger');
      toast({
        variant: "destructive",
        title: "Action Failed",
        description: `Could not seal Vault: ${errorMessage}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Scenario Control</CardTitle>
          <CardDescription>Trigger actions in the tactical environment.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSealVault}
            disabled={isLoading}
            className="w-full"
            variant="destructive"
          >
            <Lock className="mr-2 h-4 w-4" />
            {isLoading ? 'Sealing...' : 'Seal Vault Server'}
          </Button>
        </CardContent>
      </Card>
      
      <AiRecommendations addLog={addLog} />
    </div>
  );
};
