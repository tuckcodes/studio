'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CheckCircle, Info, ShieldAlert, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export interface LogEntry {
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warn' | 'danger';
}

const logMeta = {
  info: { icon: Info, color: 'text-primary' },
  success: { icon: CheckCircle, color: 'text-green-500' },
  warn: { icon: AlertTriangle, color: 'text-yellow-500' },
  danger: { icon: ShieldAlert, color: 'text-destructive' },
};

export const EventLog = ({ logs }: { logs: LogEntry[] }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Live Event Log</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-6 pt-0">
          <div className="space-y-3 font-mono text-xs">
            {logs.map((log, index) => {
              const MetaIcon = logMeta[log.type].icon;
              return(
              <div key={index} className="flex items-start space-x-2">
                <span className="text-muted-foreground">{format(log.timestamp, 'HH:mm:ss')}</span>
                <MetaIcon className={cn('w-4 h-4 flex-shrink-0 mt-px', logMeta[log.type].color)} />
                <span className={cn('flex-1', logMeta[log.type].color)}>{log.message}</span>
              </div>
            )})}
            {logs.length === 0 && <div className="text-muted-foreground text-center py-4">Waiting for events...</div>}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
