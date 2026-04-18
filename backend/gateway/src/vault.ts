const RETRY_DELAY_MS = 2000;
const MAX_RETRIES = 5;

type VaultSecretResponse = {
  data: {
    data: Record<string, string>;
  };
};

function isVaultSecretResponse(value: unknown): value is VaultSecretResponse {
  if (!value || typeof value !== 'object') return false;

  const maybeData = (value as { data?: unknown }).data;
  if (!maybeData || typeof maybeData !== 'object') return false;

  const maybeSecrets = (maybeData as { data?: unknown }).data;
  if (!maybeSecrets || typeof maybeSecrets !== 'object') return false;

  return Object.values(maybeSecrets).every((entry) => typeof entry === 'string');
}

export async function loadVaultSecrets(): Promise<void> {
  const vaultAddr = process.env.VAULT_ADDR;
  const token = process.env.VAULT_TOKEN;
  if (!vaultAddr || !token) return;

  const secretPath = 'secret/data/transcendence';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${vaultAddr}/v1/${secretPath}`, {
        headers: { 'X-Vault-Token': token },
      });

      if (!res.ok) {
        throw new Error(`Vault responded with HTTP ${res.status}`);
      }

      const json: unknown = await res.json();
      if (!isVaultSecretResponse(json)) {
        throw new Error('Vault response had unexpected shape');
      }

      const secrets = json.data.data;

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
        `Vault not ready (attempt ${attempt}/${MAX_RETRIES}), retrying in ${RETRY_DELAY_MS / 1000}s...`,
      );
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
}
