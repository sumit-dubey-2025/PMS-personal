export type StorageBackend = 'SharePoint' | 'AzureSQL';

export interface StorageConfig {
  activeBackend: StorageBackend;
  lastSavedAt?: string;
  lastSavedBy?: string;
  sharePoint?: SharePointConfig;
  azureSql?: AzureSqlConfig;
  health?: StorageHealth;
  etag?: string;
}

export interface SharePointConfig {
  siteUrl: string;
  authMethod: 'AppRegistration' | 'ServiceAccount';
  tenantId?: string;
  clientId?: string;
  clientSecret?: string; // Masked on GET
  serviceAccountUpn?: string;
  serviceAccountPassword?: string; // Masked on GET
  listPrefix: string;
}

export interface AzureSqlConfig {
  serverFqdn: string;
  databaseName: string;
  authMethod: 'ManagedIdentity' | 'SqlAuthentication';
  sqlUsername?: string;
  sqlPassword?: string; // Masked on GET
  connectionPoolSize: number;
  commandTimeoutSeconds: number;
}

export interface StorageHealth {
  status: 'Healthy' | 'Unreachable' | 'NotConfigured';
  latencyMs?: number;
  lastCheckedAt: string;
  message?: string;
}

export interface EntitySchemaStatus {
  entity: string;
  target: string;
  exists: boolean;
}

export interface SchemaStatusResponse {
  isFullyProvisioned: boolean;
  entities: EntitySchemaStatus[];
}
