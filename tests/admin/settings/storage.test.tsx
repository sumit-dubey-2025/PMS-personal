import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getStorageConfig,
  testStorageConnection,
  saveStorageConfig,
  runHealthCheck,
  initialiseStorageSchema,
  getSchemaJobStatus,
} from '@/lib/api/storageConfig';

/**
 * Test suite for Storage Configuration API and Server Actions
 * Tests API calls, data transformations, and error handling
 */

vi.mock('@/lib/api/storageConfig');

const mockGetStorageConfig = vi.mocked(getStorageConfig);
const mockTestStorageConnection = vi.mocked(testStorageConnection);
const mockSaveStorageConfig = vi.mocked(saveStorageConfig);
const mockRunHealthCheck = vi.mocked(runHealthCheck);
const mockInitialiseStorageSchema = vi.mocked(initialiseStorageSchema);
const mockGetSchemaJobStatus = vi.mocked(getSchemaJobStatus);

describe('StorageConfig API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getStorageConfig', () => {
    it('should call API to fetch storage configuration', async () => {
      mockGetStorageConfig.mockResolvedValueOnce({
        status: 'success',
        data: null,
      });

      const result = await getStorageConfig();

      expect(mockGetStorageConfig).toHaveBeenCalledOnce();
      expect(result.status).toBe('success');
    });

    it('should return success response with configuration data', async () => {
      const mockConfig = {
        status: 'success' as const,
        data: {
          backend: 'sharepoint' as const,
          sharePoint: {
            siteUrl: 'https://contoso.sharepoint.com',
            listPrefix: 'PMS',
            authenticationType: 'servicePrincipal' as const,
            clientId: 'client-123',
            tenantId: 'tenant-123',
          },
          etag: 'etag-123',
          lastSavedAt: '2026-04-07T10:00:00Z',
          environment: 'dev' as const,
        },
      };

      mockGetStorageConfig.mockResolvedValueOnce(mockConfig);

      const result = await getStorageConfig();

      expect(result.status).toBe('success');
      expect(result.data?.backend).toBe('sharepoint');
      expect(result.data?.sharePoint.siteUrl).toBe('https://contoso.sharepoint.com');
    });

    it('should return not_found status when configuration does not exist', async () => {
      mockGetStorageConfig.mockResolvedValueOnce({
        status: 'not_found',
        data: null,
      });

      const result = await getStorageConfig();

      expect(result.status).toBe('not_found');
      expect(result.data).toBeNull();
    });

    it('should handle API errors', async () => {
      mockGetStorageConfig.mockRejectedValueOnce(new Error('Network error'));

      try {
        await getStorageConfig();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Network error');
      }
    });

    it('should never include client secrets in response', async () => {
      mockGetStorageConfig.mockResolvedValueOnce({
        status: 'success',
        data: {
          backend: 'sharepoint',
          sharePoint: {
            siteUrl: 'https://contoso.sharepoint.com',
            listPrefix: 'PMS',
            authenticationType: 'servicePrincipal',
            clientId: 'client-123',
            tenantId: 'tenant-123',
          },
          etag: 'etag-123',
          lastSavedAt: '2026-04-07T10:00:00Z',
          environment: 'dev',
        },
      });

      const result = await getStorageConfig();

      expect(result.data?.sharePoint).not.toHaveProperty('clientSecret');
    });
  });

  describe('testStorageConnection', () => {
    it('should POST test connection request with configuration', async () => {
      mockTestStorageConnection.mockResolvedValueOnce({
        status: 'connected',
        backend: 'sharepoint',
        latencyMs: 150,
        schema: {
          entities: [],
        },
      });

      const testConfig = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      const result = await testStorageConnection(testConfig);

      expect(mockTestStorageConnection).toHaveBeenCalledWith(testConfig);
      expect(result.status).toBe('connected');
      expect(result.latencyMs).toBe(150);
    });

    it('should return failed status on connection failure', async () => {
      mockTestStorageConnection.mockResolvedValueOnce({
        status: 'failed',
        backend: 'sharepoint',
        error: 'Invalid credentials',
      });

      const testConfig = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://invalid.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      const result = await testStorageConnection(testConfig);

      expect(result.status).toBe('failed');
      expect(result.error).toBe('Invalid credentials');
    });

    it('should include schema entities in successful response', async () => {
      mockTestStorageConnection.mockResolvedValueOnce({
        status: 'connected',
        backend: 'sharepoint',
        latencyMs: 150,
        schema: {
          entities: [
            {
              name: 'Employees',
              status: 'Missing' as const,
            },
            {
              name: 'Departments',
              status: 'Exists' as const,
            },
          ],
        },
      });

      const testConfig = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      const result = await testStorageConnection(testConfig);

      expect(result.schema?.entities).toHaveLength(2);
      expect(result.schema?.entities[0].name).toBe('Employees');
      expect(result.schema?.entities[1].status).toBe('Exists');
    });

    it('should handle connection timeout errors', async () => {
      mockTestStorageConnection.mockRejectedValueOnce(new Error('Request timeout'));

      const testConfig = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      try {
        await testStorageConnection(testConfig);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Request timeout');
      }
    });
  });

  describe('runHealthCheck', () => {
    it('should call health check endpoint', async () => {
      mockRunHealthCheck.mockResolvedValueOnce({
        status: 'Healthy',
        backend: 'sharepoint',
        lastCheckedAt: '2026-04-07T10:00:00Z',
        latencyMs: 200,
      });

      const result = await runHealthCheck();

      expect(mockRunHealthCheck).toHaveBeenCalledOnce();
      expect(result.status).toBe('Healthy');
    });

    it('should return Healthy status', async () => {
      mockRunHealthCheck.mockResolvedValueOnce({
        status: 'Healthy',
        backend: 'sharepoint',
        lastCheckedAt: '2026-04-07T10:00:00Z',
        latencyMs: 200,
      });

      const result = await runHealthCheck();

      expect(result.status).toBe('Healthy');
      expect(result.latencyMs).toBe(200);
    });

    it('should return Unreachable status', async () => {
      mockRunHealthCheck.mockResolvedValueOnce({
        status: 'Unreachable',
        backend: 'sharepoint',
        lastCheckedAt: '2026-04-07T10:00:00Z',
        error: 'Network timeout',
      });

      const result = await runHealthCheck();

      expect(result.status).toBe('Unreachable');
      expect(result.error).toBe('Network timeout');
    });

    it('should return NotConfigured status', async () => {
      mockRunHealthCheck.mockResolvedValueOnce({
        status: 'NotConfigured',
        backend: 'sharepoint',
        lastCheckedAt: '2026-04-07T10:00:00Z',
      });

      const result = await runHealthCheck();

      expect(result.status).toBe('NotConfigured');
    });

    it('should handle health check errors', async () => {
      mockRunHealthCheck.mockRejectedValueOnce(new Error('API error'));

      try {
        await runHealthCheck();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('API error');
      }
    });
  });

  describe('initialiseStorageSchema', () => {
    it('should POST schema initialization request with entity name', async () => {
      mockInitialiseStorageSchema.mockResolvedValueOnce({
        jobId: 'job-123',
      });

      const result = await initialiseStorageSchema('Employees');

      expect(mockInitialiseStorageSchema).toHaveBeenCalledWith('Employees');
      expect(result.jobId).toBe('job-123');
    });

    it('should return job ID for tracking progress', async () => {
      mockInitialiseStorageSchema.mockResolvedValueOnce({
        jobId: 'job-456',
      });

      const result = await initialiseStorageSchema('Departments');

      expect(result.jobId).toBe('job-456');
    });

    it('should handle initialization errors', async () => {
      mockInitialiseStorageSchema.mockRejectedValueOnce(new Error('Schema initialization failed'));

      try {
        await initialiseStorageSchema('Employees');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Schema initialization failed');
      }
    });
  });

  describe('getSchemaJobStatus', () => {
    it('should GET job status with job ID', async () => {
      mockGetSchemaJobStatus.mockResolvedValueOnce({
        jobId: 'job-123',
        status: 'InProgress',
        entityName: 'Employees',
        progress: 50,
      });

      const result = await getSchemaJobStatus('job-123');

      expect(mockGetSchemaJobStatus).toHaveBeenCalledWith('job-123');
      expect(result.status).toBe('InProgress');
      expect(result.progress).toBe(50);
    });

    it('should return completed status', async () => {
      mockGetSchemaJobStatus.mockResolvedValueOnce({
        jobId: 'job-123',
        status: 'Completed',
        entityName: 'Employees',
      });

      const result = await getSchemaJobStatus('job-123');

      expect(result.status).toBe('Completed');
    });

    it('should return failed status with error message', async () => {
      mockGetSchemaJobStatus.mockResolvedValueOnce({
        jobId: 'job-123',
        status: 'Failed',
        entityName: 'Employees',
        error: 'Permission denied',
      });

      const result = await getSchemaJobStatus('job-123');

      expect(result.status).toBe('Failed');
      expect(result.error).toBe('Permission denied');
    });

    it('should handle job status query errors', async () => {
      mockGetSchemaJobStatus.mockRejectedValueOnce(new Error('Job not found'));

      try {
        await getSchemaJobStatus('invalid-job-id');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Job not found');
      }
    });
  });

  describe('saveStorageConfig', () => {
    it('should POST save configuration request', async () => {
      mockSaveStorageConfig.mockResolvedValueOnce({
        etag: 'etag-456',
        lastSavedAt: '2026-04-07T11:00:00Z',
      });

      const config = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      const result = await saveStorageConfig(config, 'etag-123');

      expect(mockSaveStorageConfig).toHaveBeenCalledWith(config, 'etag-123');
      expect(result.etag).toBe('etag-456');
    });

    it('should update ETag on successful save', async () => {
      mockSaveStorageConfig.mockResolvedValueOnce({
        etag: 'etag-789',
        lastSavedAt: '2026-04-07T12:00:00Z',
      });

      const config = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      const result = await saveStorageConfig(config);

      expect(result.etag).toBe('etag-789');
      expect(result.lastSavedAt).toBe('2026-04-07T12:00:00Z');
    });

    it('should handle 412 conflict error (concurrent edit)', async () => {
      mockSaveStorageConfig.mockRejectedValueOnce({
        statusCode: 412,
        message: 'Configuration was modified by another user',
      });

      const config = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      try {
        await saveStorageConfig(config, 'stale-etag');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as any).statusCode).toBe(412);
        expect((error as any).message).toContain('modified by another user');
      }
    });

    it('should handle 422 validation error (immutable field)', async () => {
      mockSaveStorageConfig.mockRejectedValueOnce({
        statusCode: 422,
        message: 'Field "siteUrl" is immutable',
      });

      const config = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://different.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      try {
        await saveStorageConfig(config, 'etag-123');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as any).statusCode).toBe(422);
        expect((error as any).message).toContain('immutable');
      }
    });

    it('should handle save configuration errors', async () => {
      mockSaveStorageConfig.mockRejectedValueOnce(new Error('Server error'));

      const config = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: 'tenant-123',
          clientId: 'client-123',
          clientSecret: 'secret',
        },
      };

      try {
        await saveStorageConfig(config);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Server error');
      }
    });
  });

  describe('Configuration Data Validation', () => {
    it('should support SharePoint backend configuration', () => {
      const config = {
        backend: 'sharepoint' as const,
        sharePoint: {
          siteUrl: 'https://contoso.sharepoint.com',
          listPrefix: 'PMS',
          authenticationType: 'servicePrincipal' as const,
          tenantId: '00000000-0000-0000-0000-000000000000',
          clientId: '00000000-0000-0000-0000-000000000001',
          clientSecret: 'secret',
        },
      };

      expect(config.backend).toBe('sharepoint');
      expect(config.sharePoint.authenticationType).toBe('servicePrincipal');
    });

    it('should support Azure SQL backend configuration', () => {
      const config = {
        backend: 'azuresql' as const,
        azureSql: {
          server: 'contoso.database.windows.net',
          database: 'PMS',
          username: 'admin',
          password: 'secret',
        },
      };

      expect(config.backend).toBe('azuresql');
      expect(config.azureSql.server).toBe('contoso.database.windows.net');
    });
  });
});
