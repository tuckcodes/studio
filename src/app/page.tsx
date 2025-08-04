"use client";

import { MapDisplay } from "@/components/map-display";
import { ControlPanel } from "@/components/control-panel";
import { EventLog } from "@/components/event-log";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      <main className="flex-1 flex flex-col relative">
        <MapDisplay />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <EventLog />
        </div>
      </main>
      <div className="w-[350px] bg-gray-800 border-l border-gray-700 flex flex-col">
        <ControlPanel />
      </div>
      <Toaster />
    </div>
  );
}
