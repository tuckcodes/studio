const express = require('express');
const cors = require('cors');
const vault = require('node-vault')({
    apiVersion: 'v1',
    endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
    token: process.env.VAULT_TOKEN
});

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const state = {
  scenarioRunning: false,
  compromisedNode: null,
  leases: {},
};

const setupVault = async () => {
    try {
        console.log("Vault client initialized. Proceeding with setup.");

        await vault.mount({
            mount_point: 'secret',
            type: 'kv',
            options: {
                version: '2'
            }
        });
        console.log("Enabled KV-v2 secrets engine at secret/");

        await vault.write('secret/mission-plan', { target_location: "Hill 493", objective: "Recon" });
        console.log("Wrote sample mission plan to secret/mission-plan");

        await vault.write('sys/policy/mission-plan-readonly', {
            policy: 'path "secret/data/mission-plan" { capabilities = ["read"] }'
        });
        console.log("Created read-only policy for mission-plan");

    } catch (e) {
        if (e.response && e.response.data && e.response.data.errors.includes("path is already in use")) {
            console.log("Vault already initialized. Skipping setup.");
        } else {
            console.error("Failed to setup Vault:", e);
            throw e;
        }
    }
};

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
    
    res.json({ message: "Scenario started." });
});

app.post('/api/secret/request', async (req, res) => {
    const { node } = req.body;
    try {
        const token = await vault.tokenCreate({
            policies: ['mission-plan-readonly'],
            ttl: '120s'
        });
        
        state.leases[node] = {
            lease_id: token.auth.lease_id,
            token: token.auth.client_token,
        };

        console.log(`Lease created for ${node}: ${token.auth.lease_id}`);
        res.json({ 
            message: "Token created", 
            token: token.auth.client_token, 
            lease_duration: token.auth.lease_duration 
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
        await vault.tokenRevoke({ token: lease.token });
        
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
        const tempVault = require('node-vault')({
            apiVersion: 'v1',
            endpoint: process.env.VAULT_ADDR || 'http://127.0.0.1:8200',
            token: token
        });
        const secret = await tempVault.read('secret/mission-plan');
        res.json({ message: "Access granted", data: secret.data });
    } catch (e) {
        res.status(403).json({ message: "Access denied" });
    }
});

app.post('/api/scenario/compromise', async (req, res) => {
    if (!state.scenarioRunning) {
        return res.status(400).json({ message: "Scenario not running." });
    }
    const { node } = req.body;
    console.log(`--- Compromising node: ${node} ---`);
    state.compromisedNode = node;
    
    res.json({ message: `Node ${node} marked as compromised.` });
});

const startServer = async () => {
    await setupVault();
    
    app.listen(port, () => {
        console.log(`Demo controller listening at http://localhost:${port}`);
    });
};

startServer();
