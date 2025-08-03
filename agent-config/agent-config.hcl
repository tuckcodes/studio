# This is a minimal placeholder config for the Vault agents.
# It tells the agent where the Vault server is.
# In a real scenario, this would contain auto-auth, sink, and template stanzas.

pid_file = "/home/vault/agent.pid"

vault {
  address = "http://vault-server:8200"
}

# The agent will try to authenticate but will fail without a method.
# For the purpose of this demo, having the agent containers running is sufficient.
# To make them functional, you would configure an auto_auth method.
exit_after_auth = false
