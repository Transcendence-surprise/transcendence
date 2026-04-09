const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = parseInt(process.env.VAULT_MAX_RETRIES ?? '5');

async function resolveToken(vaultAddr: string): Promise<string | null> {
  const token = process.env.VAULT_TOKEN;
  if (token) return token;

  const roleId = process.env.VAULT_ROLE_ID;
  const secretId = process.env.VAULT_SECRET_ID;
  if (!roleId || !secretId) return null;

  const res = await fetch(`${vaultAddr}/v1/auth/approle/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: roleId, secret_id: secretId }),
  });
  if (!res.ok) throw new Error(`AppRole login failed: HTTP ${res.status}`);
  const json = await res.json();
  return json.auth.client_token as string;
}

export async function loadVaultSecrets(): Promise<void> {
  const vaultAddr = process.env.VAULT_ADDR;
  if (!vaultAddr) return;

  const hasToken = !!process.env.VAULT_TOKEN;
  const hasAppRole = !!(process.env.VAULT_ROLE_ID && process.env.VAULT_SECRET_ID);
  if (!hasToken && !hasAppRole) return;

  const secretPath =
    process.env.VAULT_SECRET_PATH ?? 'secret/data/transcendence';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const token = await resolveToken(vaultAddr);
      if (!token) return;

      const res = await fetch(`${vaultAddr}/v1/${secretPath}`, {
        headers: { 'X-Vault-Token': token },
      });

      if (!res.ok) {
        throw new Error(`Vault responded with HTTP ${res.status}`);
      }

      const json = await res.json();
      const secrets: Record<string, string> = json.data.data;

      for (const [key, value] of Object.entries(secrets)) {
        process.env[key] = value;
      }

      console.log(`Loaded ${Object.keys(secrets).length} secrets from Vault`);
      return;
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed to load secrets from Vault after ${MAX_RETRIES} attempts: ${err}`,
        );
      }
      console.log(
        `Vault not ready (attempt ${attempt}/${MAX_RETRIES}): ${err}. Retrying in ${RETRY_DELAY_MS / 1000}s...`,
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}
