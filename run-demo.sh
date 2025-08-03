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
COMPOSE_FILE="ddil-vault-compose.yaml"

print_message() {
    echo -e "${GREEN}▶ $1${NC}"
}

check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${YELLOW}Error: '$1' command not found. Please install it and try again.${NC}"
        exit 1
    fi
}

# --- Phase 1: Pre-flight Checks ---
print_message "Phase 1: Running Pre-flight Checks..."
check_dependency "docker"
check_dependency "docker-compose"

# --- Phase 2: Environment Cleanup ---
print_message "Phase 2: Cleaning up any previous demo environments..."
if [ -f "$COMPOSE_FILE" ]; then
    # Use docker compose instead of docker-compose for newer versions
    if command -v "docker-compose" &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" down --remove-orphans || true
    else
        docker compose -f "$COMPOSE_FILE" down --remove-orphans || true
    fi
fi

# --- Phase 3: Build and Launch Environment ---
print_message "Phase 3: Building and launching the demo environment..."
if command -v "docker-compose" &> /dev/null; then
    docker-compose -f "$COMPOSE_FILE" up --build -d
else
    docker compose -f "$COMPOSE_FILE" up --build -d
fi


# --- Phase 4: Final Output ---
print_message "Waiting for containers to be ready..."
sleep 5
VAULT_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' vault-tactical-edge-demo-vault-server-1 2>/dev/null || echo "127.0.0.1")
if [ "$VAULT_IP" = "127.0.0.1" ]; then
    VAULT_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' vault_tactical_edge_demo_vault-server_1 2>/dev/null || echo "127.0.0.1")
fi


print_message "Phase 4: Demo Environment is Ready!"
echo "------------------------------------------------------------------"
echo -e "${YELLOW}The Vault Tactical Edge Demo GUI is running at:${NC} http://localhost:9002 (if you used 'npm run dev')"
echo -e "${YELLOW}The Vault Server UI is accessible at:${NC} http://localhost:8200 (forwarded port)"
echo ""
echo "Use the web GUI to run interactive scenarios against the live Vault instance."
echo "The initial Unseal Key and Root Token will be printed in the Docker Compose logs."
echo "You can view logs with: 'docker compose -f ${COMPOSE_FILE} logs -f' or 'docker-compose -f ${COMPOSE_FILE} logs -f'"
echo "------------------------------------------------------------------"
