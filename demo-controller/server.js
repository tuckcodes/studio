const express = require('express');
const { exec } = require('child_process');
const cors = 'cors';
const { Docker } = require('node-docker-api');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// Simple in-memory state
const state = {
  scenarioRunning: false,
  compromisedNode: null,
  leases: {}, // Store lease IDs for revocation
};

// Helper function to run shell commands
const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return reject({ error, stderr });
      }
      resolve(stdout.trim());
    });
  });
};

// *****************************************************************************
// VAULT SETUP AND SCENARIO LOGIC
// *****************************************************************************

const VAULT_ADDR = 'http://vault-server:8200';

const setupVault = async () => {
    try {
        await runCommand(`docker exec vault-tactical-edge-demo-vault-server-1 vault login root`);
        console.log("Logged into Vault");

        await runCommand(`docker exec vault-tactical-edge-demo-vault-server-1 vault secrets enable -path=secret kv-v2`);
        console.log("Enabled KV-v2 secrets engine at secret/");

        await runCommand(`docker exec vault-tactical-edge-demo-vault-server-1 vault kv put secret/mission-plan target_location="Hill 493" objective="Recon"`);
        console.log("Wrote sample mission plan to secret/mission-plan");

        await runCommand(`docker exec vault-tactical-edge-demo-vault-server-1 vault policy write mission-plan-readonly - <<EOF
path "secret/data/mission-plan" {
  capabilities = ["read"]
}
EOF`);
        console.log("Created read-only policy for mission-plan");

    } catch (e) {
        // Ignore errors if setup has already been run
        if (e.stderr && e.stderr.includes("path is already in use")) {
            console.log("Vault already initialized. Skipping setup.");
        } else {
            console.error("Failed to setup Vault:", e);
            throw e;
        }
    }
};


// *****************************************************************************
// API ENDPOINTS
// *****************************************************************************

app.get('/api/status', (req, res) => {
  res.json(state);
});

app.post('/api/scenario/start', async (req, res) => {
    if (state.scenarioRunning) {
        return res.status(400).json({ message: "Scenario already running." });
    }
    
    console.log("--- Starting Scenario ---");
    state.scenarioRunning = true;
    state.compromisedNode = null;
    state.leases = {};
    
    // In a real scenario, we would trigger actions. Here we just set the state.
    
    res.json({ message: "Scenario started." });
});

app.post('/api/secret/request', async (req, res) => {
    const { node } = req.body;
    try {
        const command = `docker exec vault-tactical-edge-demo-vault-server-1 vault token create -policy=mission-plan-readonly -ttl=120s -format=json`;
        const output = await runCommand(command);
        const tokenData = JSON.parse(output);
        
        state.leases[node] = {
            lease_id: tokenData.auth.lease_id,
            token: tokenData.auth.client_token,
        };

        console.log(`Lease created for ${node}: ${tokenData.auth.lease_id}`);
        res.json({ 
            message: "Token created", 
            token: tokenData.auth.client_token, 
            lease_duration: tokenData.auth.lease_duration 
        });
    } catch (e) {
        res.status(500).json({ message: "Failed to create token" });
    }
});

app.post('/api/secret/revoke', async (req, res) => {
    const { node } = req.body;
    const lease = state.leases[node];
    if (!lease) {
        return res.status(404).json({ message: "No lease found for node" });
    }

    try {
        const command = `docker exec vault-tactical-edge-demo-vault-server-1 vault token revoke ${lease.token}`;
        await runCommand(command);
        
        delete state.leases[node];

        console.log(`Lease revoked for ${node}`);
        res.json({ message: "Token revoked" });
    } catch (e) {
        res.status(500).json({ message: "Failed to revoke token" });
    }
});

app.post('/api/secret/read', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        const command = `docker exec vault-tactical-edge-demo-vault-server-1 sh -c "VAULT_TOKEN=${token} vault kv get secret/mission-plan"`;
        const output = await runCommand(command);
        res.json({ message: "Access granted", data: output });
    } catch (e) {
        res.status(403).json({ message: "Access denied" });
    }
});

app.post('/api/scenario/compromise', async (req, res) => {
    if (!state.scenarioRunning) {
        return res.status(400).json({ message: "Scenario not running." });
    }
    const { node } = req.body; // e.g., "stryker-2"
    console.log(`--- Compromising node: ${node} ---`);
    state.compromisedNode = node;
    
    // Simulate revoking access - In this simplified version, we just update state
    // In a real version, we'd call `vault token revoke <token>`
    
    res.json({ message: `Node ${node} marked as compromised.` });
});


app.get('/api/containers', async (req, res) => {
    try {
      const containers = await docker.container.list();
      const relevantContainers = containers.filter(c => c.data.Names[0].includes('vault-tactical-edge-demo'));
      const containerInfo = relevantContainers.map(c => ({
        id: c.id,
        name: c.data.Names[0].replace('/', ''),
        state: c.data.State,
        status: c.data.Status,
      }));
      res.json(containerInfo);
    } catch (error) {
      console.error('Failed to get container status:', error);
      res.status(500).json({ message: 'Failed to retrieve container status' });
    }
  });


// *****************************************************************************
// SERVER INITIALIZATION
// *****************************************************************************

const startServer = async () => {
    // Wait for Vault to be healthy before starting
    console.log("Waiting for Vault to become healthy...");
    let vaultHealthy = false;
    while (!vaultHealthy) {
        try {
            const output = await runCommand(`docker inspect --format='{{.State.Health.Status}}' vault-tactical-edge-demo-vault-server-1`);
            if (output === 'healthy') {
                vaultHealthy = true;
                console.log("Vault is healthy!");
            } else {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (e) {
            console.log("Waiting for vault container to be created...");
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    // Once Vault is healthy, run the setup script
    await setupVault();
    
    // Start the Express server
    app.listen(port, () => {
        console.log(`Demo controller listening at http://localhost:${port}`);
    });
};

startServer();
