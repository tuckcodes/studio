"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

export function EventLog({ events }) {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <List className="mr-2 h-4 w-4 text-cyan-400" />
          <span>Event Log</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs font-mono h-24 overflow-y-auto">
          {events.map((event, index) => (
            <p key={index}>
              <span className="text-gray-500 mr-2">[{event.time}]</span>
              <span>{event.message}</span>
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
