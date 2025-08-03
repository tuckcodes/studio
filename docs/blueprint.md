# **App Name**: Vault Edge Tactical Demo

## Core Features:

- Interactive Map Display: Display Vault server and Stryker vehicles on an interactive map interface, updating location and status in real-time.
- Scenario Execution GUI: Provide a GUI for executing Vault-related scenarios, such as sealing the Vault server.
- Live Event Log: Display a live event log to show the history of executed scenarios and system events.
- Vault API Controller: Allow triggering actions against a Vault server via API calls, like 'seal', from the NextJS frontend
- Docker Compose Setup: Use Docker Compose to create self-contained demo environments consisting of a Vault server and other simulated services, all managed with configuration-as-code.
- AI-Powered Security Recommendations: Provide an AI tool that can make security hardening recommendations for the tactical edge environment, and display it inline.

## Style Guidelines:

- Primary color: HSL(210, 75%, 50%) - RGB(#3992ff). A vibrant blue to convey trust and security.
- Background color: HSL(210, 20%, 15%) - RGB(#242933). A dark background for enhanced focus on interactive elements.
- Accent color: HSL(180, 60%, 40%) - RGB(#2ba8b0). A contrasting cyan to highlight key actions and interactive elements.
- Body and headline font: 'Inter', sans-serif, for a modern, machined, objective feel.
- Use clear, outline-style icons from Lucide to represent system status and actions.
- Split the screen into three sections: an interactive map on the left, controls in the middle, and a live event log on the right.
- Implement subtle animations for changes in Vault server status to provide clear visual feedback.