"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { List } from "lucide-react";

const events = [
  { time: "00:00", message: "Scenario initiated. Stryker units deployed." },
  { time: "00:05", message: "Stryker 1, 2, and 3 establishing connection to Vault..." },
  { time: "00:10", message: "All units connected. Ready to request mission data." },
];

export function EventLog() {
  return (
    <Card className="bg-black/50 backdrop-blur-sm border-gray-700 text-white">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <List className="mr-2 h-4 w-4 text-cyan-400" />
          <span>Event Log</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs font-mono">
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
