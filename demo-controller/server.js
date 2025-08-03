const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const CONTAINER_NAME = 'vault-tactical-edge-demo-vault-server-1';

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Exec error for command "${command}": ${stderr}`);
        return reject({ message: stderr || error.message });
      }
      resolve({ message: stdout.trim() });
    });
  });
};

app.get('/api/state', (req, res) => {
    const vaultStatusCmd = `docker exec ${CONTAINER_NAME} vault status -format=json`;

    exec(vaultStatusCmd, (error, stdout, stderr) => {
        if (error && error.code !== 2) {
            if (stderr.includes("No such container")) {
                return res.status(404).json({ message: `Vault container not found. Is the demo running?`, details: stderr });
            }
            return res.status(500).json({ message: "Failed to get Vault status", details: stderr });
        }
        
        try {
            const vaultState = JSON.parse(stdout);
            res.json({ vault_server: { status: vaultState.sealed ? 'sealed' : 'unsealed' } });
        } catch (e) {
            if (stdout.includes("Vault is sealed")) {
                return res.json({ vault_server: { status: 'sealed' } });
            }
            res.status(503).json({ message: "Could not parse Vault status. Is it initialized?", details: stdout });
        }
    });
});

app.post('/api/actions/:action', async (req, res) => {
    const { action } = req.params;
    
    try {
        let command;
        let successMessage;

        switch (action) {
            case 'seal-vault':
                command = `docker exec ${CONTAINER_NAME} vault operator seal`;
                successMessage = "Command to seal Vault has been sent.";
                break;
            default:
                return res.status(400).json({ message: "Invalid action." });
        }

        await runCommand(command);
        res.json({ message: successMessage });
    } catch (error) {
        if (error.message && error.message.includes("Vault is sealed")) {
            return res.json({ message: "Vault is already sealed." });
        }
        res.status(500).json({ message: `Action '${action}' failed.`, details: error.message });
    }
});

app.listen(port, () => {
  console.log(`Demo controller listening at http://localhost:${port}`);
});
