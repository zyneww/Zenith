// apps/web/lib/doppler/index.ts
// Doppler Secrets Management - REST API wrapper
// Centralized API key management for production deployments

interface DopplerConfig {
  token: string;
  project: string;
  config: string;
}

interface Secret {
  name: string;
  value: string;
  computed?: string;
}

interface SecretResponse {
  secrets: Record<string, { computed?: string; raw?: string }>;
}

class DopplerClient {
  private baseUrl = 'https://api.doppler.com/v3';
  private token: string;
  private project: string;
  private config: string;

  constructor({ token, project, config }: DopplerConfig) {
    this.token = token;
    this.project = project;
    this.config = config;
  }

  private async fetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Doppler API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  // Get all secrets for the project/config
  async getSecrets(): Promise<Record<string, string>> {
    const result = await this.fetch<SecretResponse>(
      `/configs/config/secret?project=${this.project}&config=${this.config}`
    );

    return Object.entries(result.secrets).reduce((acc, [name, data]) => {
      acc[name] = data.computed || data.raw || '';
      return acc;
    }, {} as Record<string, string>);
  }

  // Get a single secret
  async getSecret(name: string): Promise<string | null> {
    const secrets = await this.getSecrets();
    return secrets[name] || null;
  }

  // Update or create a secret
  async setSecret(name: string, value: string): Promise<void> {
    await this.fetch('/configs/config/secrets', {
      method: 'POST',
      body: JSON.stringify({
        project: this.project,
        config: this.config,
        secrets: {
          [name]: { value },
        },
      }),
    });
  }

  // Delete a secret
  async deleteSecret(name: string): Promise<void> {
    await this.fetch('/configs/config/secrets', {
      method: 'DELETE',
      body: JSON.stringify({
        project: this.project,
        config: this.config,
        secrets: [name],
      }),
    });
  }

  // Get all environment variables for a service
  async getEnvironmentVariables(): Promise<Record<string, string>> {
    return this.getSecrets();
  }

  // Sync secrets to local environment (for development)
  async syncToEnvironment(): Promise<void> {
    const secrets = await this.getSecrets();
    for (const [name, value] of Object.entries(secrets)) {
      process.env[name] = value;
    }
  }
}

// Doppler configuration from environment
export const doppler = new DopplerClient({
  token: process.env.DOPPLER_TOKEN || '',
  project: process.env.DOPPLER_PROJECT || 'zenith',
  config: process.env.DOPPLER_CONFIG || 'dev',
});

// Helper to load secrets into environment
export async function loadSecrets(): Promise<void> {
  if (!process.env.DOPPLER_TOKEN) {
    console.warn('DOPPLER_TOKEN not set, skipping secrets sync');
    return;
  }

  try {
    await doppler.syncToEnvironment();
    console.log('✅ Doppler secrets synced to environment');
  } catch (error) {
    console.error('❌ Failed to sync Doppler secrets:', error);
    throw error;
  }
}

// Helper to get a specific secret
export async function getSecret(name: string): Promise<string | null> {
  if (!process.env.DOPPLER_TOKEN) {
    return process.env[name] || null;
  }

  try {
    return await doppler.getSecret(name);
  } catch (error) {
    console.error(`Failed to get secret ${name}:`, error);
    return process.env[name] || null;
  }
}

// Helper to set a secret
export async function setSecret(name: string, value: string): Promise<void> {
  if (!process.env.DOPPLER_TOKEN) {
    throw new Error('DOPPLER_TOKEN not set');
  }

  return doppler.setSecret(name, value);
}

export default {
  doppler,
  loadSecrets,
  getSecret,
  setSecret,
};
