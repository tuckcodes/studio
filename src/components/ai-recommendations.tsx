'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2 } from 'lucide-react';
import { generateSecurityRecommendations } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';
import type { LogEntry } from './event-log';

interface AiRecommendationsProps {
  addLog: (message: string, type?: LogEntry['type']) => void;
}

export const AiRecommendations = ({ addLog }: AiRecommendationsProps) => {
  const [description, setDescription] = useState('A fleet of Stryker vehicles are deployed in a disconnected, limited, and intermittent (DIL) environment. Each vehicle runs a Vault Agent. A central Vault server at HQ provides secrets and configuration. The network is unreliable.');
  const [recommendations, setRecommendations] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setRecommendations('');
    addLog('Generating AI security recommendations...', 'info');

    const result = await generateSecurityRecommendations({ environmentDescription: description });

    if (result.success) {
      setRecommendations(result.recommendations || '');
      addLog('AI security recommendations generated successfully.', 'success');
    } else {
      setRecommendations(`Error: ${result.error}`);
      addLog(`Failed to generate AI recommendations: ${result.error}`, 'danger');
    }
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Security Hardening</CardTitle>
        <CardDescription>Get AI-powered recommendations for your environment.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Describe your tactical edge environment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generating...' : 'Get Recommendations'}
          </Button>
        </form>
        {recommendations && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="font-semibold mb-2 text-foreground">Recommendations:</h4>
            <ScrollArea className="h-48">
              <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/50 p-3 rounded-md">{recommendations}</pre>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
