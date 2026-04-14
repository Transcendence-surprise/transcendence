# ACL policy for the transcendence backend services.
# Attached to the 'transcendence' AppRole — every token issued via that role
# inherits exactly these permissions and nothing more.

# Read the current version of the application secrets.
# KV v2 stores secret values under 'secret/data/<name>'.
path "secret/data/transcendence" {
  capabilities = ["read", "list"]
}

# Read secret metadata (version history, creation time, etc.).
# KV v2 stores metadata separately under 'secret/metadata/<name>'.
# Required by some Vault clients to check whether a secret exists.
path "secret/metadata/transcendence" {
  capabilities = ["read", "list"]
}
