"use client";

import Image from "next/image";
import { AlertTriangle, HardDrive, Wifi, Shield, Server, Smartphone, Laptop, Database } from "lucide-react";

// Define the positions for the nodes on the map
const nodePositions = {
  commandPost: { top: "10%", left: "50%" },
  database: { top: "12%", left: "65%" },
  stryker1: { top: "35%", left: "30%" },
  stryker2: { top: "40%", left: "65%" },
  stryker3: { top: "60%", left: "45%" },
  device1: { top: "30%", left: "20%" },
  device2: { top: "45%", left: "25%" },
  device3: { top: "38%", left: "78%" },
  device4: { top: "55%", left: "75%" },
  device5: { top: "68%", left: "55%" },
  device6: { top: "75%", left: "40%" },
};

const Node = ({ icon, label, position, isCompromised = false }) => (
  <div
    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
    style={{ top: position.top, left: position.left }}
  >
    <div className={`relative p-2 bg-black/50 backdrop-blur-sm rounded-full border-2 ${isCompromised ? "border-red-500 animate-pulse-compromised" : "border-cyan-400"}`}>
      {icon}
      {isCompromised && (
        <div className="absolute -top-2 -right-2">
          <AlertTriangle className="h-5 w-5 text-red-500 fill-yellow-400" />
        </div>
      )}
    </div>
    <span className="mt-1 text-xs text-white bg-black/50 px-2 py-1 rounded">{label}</span>
  </div>
);

const ConnectionLine = ({ from, to, isCompromised = false }) => {
  return (
    <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
      <line
        x1={from.left}
        y1={from.top}
        x2={to.left}
        y2={to.top}
        className={`animate-pulse-line ${isCompromised ? "stroke-red-500" : "stroke-cyan-400"}`}
        strokeWidth="2"
      />
    </svg>
  );
};


export function MapDisplay({ compromisedNode }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src="/background/1.jpg"
        alt="Battle Map"
        layout="fill"
        objectFit="cover"
        className="z-0"
      />
      <div className="relative z-10 w-full h-full">
         {/* Connections */}
         <ConnectionLine from={{top: "10%", left: "50%"}} to={{top: "12%", left: "65%"}} />
         <ConnectionLine from={{top: "10%", left: "50%"}} to={{top: "35%", left: "30%"}} />
         <ConnectionLine from={{top: "10%", left: "50%"}} to={{top: "40%", left: "65%"}} isCompromised={compromisedNode === 'stryker-2'} />
         <ConnectionLine from={{top: "10%", left: "50%"}} to={{top: "60%", left: "45%"}} />

         <ConnectionLine from={{top: "35%", left: "30%"}} to={{top: "30%", left: "20%"}} />
         <ConnectionLine from={{top: "35%", left: "30%"}} to={{top: "45%", left: "25%"}} />

         <ConnectionLine from={{top: "40%", left: "65%"}} to={{top: "38%", left: "78%"}} />
         <ConnectionLine from={{top: "40%", left: "65%"}} to={{top: "55%", left: "75%"}} />
         
         <ConnectionLine from={{top: "60%", left: "45%"}} to={{top: "68%", left: "55%"}} />
         <ConnectionLine from={{top: "60%", left: "45%"}} to={{top: "75%", left: "40%"}} />


        {/* Nodes */}
        <Node icon={<Server className="h-8 w-8 text-cyan-300" />} label="Vault Server" position={nodePositions.commandPost} />
        <Node icon={<Database className="h-6 w-6 text-purple-300" />} label="DB" position={nodePositions.database} />
        <Node icon={<HardDrive className="h-8 w-8 text-green-400" />} label="Stryker 1" position={nodePositions.stryker1} />
        <Node icon={<HardDrive className="h-8 w-8 text-green-400" />} label="Stryker 2" position={nodePositions.stryker2} isCompromised={compromisedNode === 'stryker-2'} />
        <Node icon={<HardDrive className="h-8 w-8 text-green-400" />} label="Stryker 3" position={nodePositions.stryker3} />
        
        <Node icon={<Smartphone className="h-5 w-5 text-blue-300" />} label="MANPACK" position={nodePositions.device1} />
        <Node icon={<Laptop className="h-5 w-5 text-blue-300" />} label="LAPTOP" position={nodePositions.device2} />
        <Node icon={<Smartphone className="h-5 w-5 text-blue-300" />} label="MANPACK" position={nodePositions.device3} />
        <Node icon={<Laptop className="h-5 w-5 text-blue-300" />} label="LAPTOP" position={nodePositions.device4} />
        <Node icon={<Smartphone className="h-5 w-5 text-blue-300" />} label="MANPACK" position={nodePositions.device5} />
        <Node icon={<Laptop className="h-5 w-5 text-blue-300" />} label="LAPTOP" position={nodePositions.device6} />
      </div>
    </div>
  );
}
