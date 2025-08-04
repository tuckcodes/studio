#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e
# Treat unset variables as an error when substituting.
set -u
# Pipes will fail if any command in the pipe fails.
set -o pipefail

# --- Configuration & Helper Functions ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_message() {
    echo -e "${GREEN}▶ $1${NC}"
}

# --- Phase 1: Start Demo Controller ---
print_message "Phase 1: Starting the demo controller..."
(cd demo-controller && npm start) &

# --- Phase 2: Final Output ---
print_message "Phase 2: Demo Environment is getting ready!"
echo "------------------------------------------------------------------"
echo -e "${YELLOW}The Vault Tactical Edge Demo GUI can be started by running 'npm run dev' in the root directory.${NC}"
echo -e "${YELLOW}The Demo Controller is running in the background.${NC}"
echo "------------------------------------------------------------------"
