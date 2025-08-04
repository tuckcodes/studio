"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Info, Bot, ExternalLink } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast";
  

export function ControlPanel({ setEvents, setCompromisedNode }) {
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const addEvent = (message) => {
    const time = new Date().toLocaleTimeString();
    setEvents(prev => [...prev, { time, message }]);
  }

  const runScenario = async () => {
    setIsRunning(true);
    setCompromisedNode(null);
    setEvents([]); // Clear previous events

    addEvent("Scenario initiated. Stryker units deployed.");
    
    // --- Step 1: Start the scenario on the backend ---
    await fetch('http://localhost:8080/api/scenario/start', { method: 'POST' });
    addEvent("Backend scenario state initialized.");

    // --- Step 2: Simulate Strykers requesting the secret ---
    await new Promise(r => setTimeout(r, 1000));
    addEvent("Stryker units requesting access to mission plan...");
    
    // In a real scenario, each stryker would do this. We simulate for one.
    const response = await fetch('http://localhost:8080/api/secret/request', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node: 'stryker-2' })
    });
    const data = await response.json();
    addEvent(`Stryker 2 granted temporary access token (Lease TTL: ${data.lease_duration}s).`);
    toast({
        title: "Lease Acquired",
        description: "A temporary token has been generated for Stryker 2. View active leases in the Vault UI.",
    });

    // --- Step 3: Simulate a compromise ---
    await new Promise(r => setTimeout(r, 3000));
    addEvent("ALERT: Anomalous signals detected from Stryker 2's location.");
    await new Promise(r => setTimeout(r, 2000));
    addEvent("Compromise detected! Revoking Stryker 2's access immediately.");
    setCompromisedNode('stryker-2');
    
    await fetch('http://localhost:8080/api/secret/revoke', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node: 'stryker-2' })
    });
    addEvent("Stryker 2's access token has been revoked.");
    toast({
        variant: "destructive",
        title: "Access Revoked",
        description: "The token for Stryker 2 has been instantly revoked. The compromised unit can no longer access the secret.",
    });

    // --- Step 4: Show secret is safe ---
    await new Promise(r => setTimeout(r, 2000));
    addEvent("Adversary attempting to access mission plan with compromised key...");
    
    const finalCheck = await fetch('http://localhost:8080/api/secret/read', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.token }) // using the revoked token
    });

    if(finalCheck.status === 403) {
        addEvent("ACCESS DENIED. The compromised token is invalid. Mission plan is secure.");
    } else {
        addEvent("Something went wrong, access was not denied.");
    }

    addEvent("Scenario Complete.");
    setIsRunning(false);
  }

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Shield className="mr-2 text-cyan-400" />
            <span>Control Panel</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 mb-4">
            Use this panel to run the pre-canned DIL-Vault demo scenario.
          </p>
          <Button className="w-full bg-cyan-600 hover:bg-cyan-700" onClick={runScenario} disabled={isRunning}>
            {isRunning ? "Scenario in Progress..." : "Run Scenario"}
          </Button>
          <a href="http://localhost:8200/ui/vault/auth/token/leases" target="_blank" rel="noopener noreferrer" className="text-center text-sm text-cyan-400 hover:underline mt-2 flex items-center justify-center">
              View Token Leases in Vault UI <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700 text-white flex-grow">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Info className="mr-2 text-cyan-400" />
          <span>Scenario Details</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-400">
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
                <AccordionTrigger>What is this demo?</AccordionTrigger>
                <AccordionContent>
                This demo showcases HashiCorp Vault in a simulated tactical scenario. It illustrates how Vault manages secrets and access for dynamic, short-lived units in a Disconnected, Intermittent, and Limited (DIL) network environment.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
                <AccordionTrigger>The Scenario</AccordionTrigger>
                <AccordionContent>
                A secret, "Mission Plan", is stored in the central Vault server. Three Stryker units on the battlefield need access to this secret. When you run the scenario, the demo simulates one Stryker being compromised. Vault's capabilities are then used to instantly revoke the compromised unit's access, securing the mission plan without disrupting operations for the other units.
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
                <AccordionTrigger>Key Vault Features</AccordionTrigger>
                <AccordionContent>
                    <ul className="list-disc pl-5 space-y-1">
                        <li><span className="font-bold">Dynamic Secrets:</span> Temporary credentials are not the focus of this simplified demo, but Vault can create them on-the-fly for databases, cloud services, and more.</li>
                        <li><span className="font-bold">Token-based Access:</span> Units are given short-lived tokens to access secrets.</li>
                        <li><span className="font-bold">Automated Revocation:</span> Access for compromised units can be revoked instantly.</li>
                        <li><span className="font-bold">Centralized Policy:</span> Access control is managed from the central Vault server.</li>
                    </ul>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>

      <Card className="bg-gray-800 border-gray-700 text-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Bot className="mr-2 text-cyan-400" />
            <span>GenAI Assistant</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-gray-400 mb-4">Ask me about the demo, Vault, or the scenario.</p>
            <Button className="w-full bg-gray-600 hover:bg-gray-700" disabled>
            AI Chat (Coming Soon)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
