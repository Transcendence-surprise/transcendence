# Persist secrets to disk so they survive container restarts.
# The path is inside the vault_data Docker volume.
storage "file" {
  path = "/vault/file"
}

# Listen on all interfaces inside the container.
# tls_disable = 1 because TLS is terminated by Nginx at the edge.
listener "tcp" {
  address     = "0.0.0.0:8200"
  tls_disable = 1
}

# The address Vault advertises to other services (used in redirect URLs).
# "vault" resolves to the Vault container via Docker's internal DNS.
api_addr = "http://vault:8200"

# IPC_LOCK capability is granted via docker-compose.prod.yml (cap_add: IPC_LOCK),
# mlock is enabled — secrets cannot be swapped to disk.
disable_mlock = false

# Enable the built-in web UI at http://localhost:8200/ui.
ui = true
