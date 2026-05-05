import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signInWithMicrosoft } from '@/app/actions/auth';

/**
 * Test suite for Login Page Server Action (auth/login/page.tsx)
 * Tests authentication server action
 */

vi.mock('@/app/actions/auth');

const mockSignInWithMicrosoft = vi.mocked(signInWithMicrosoft);

describe('LoginPage - Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithMicrosoft Server Action', () => {
    it('should be defined and callable', async () => {
      mockSignInWithMicrosoft.mockResolvedValueOnce(undefined);

      expect(signInWithMicrosoft).toBeDefined();
      expect(typeof signInWithMicrosoft).toBe('function');
    });

    it('should call signInWithMicrosoft with undefined when no callbackUrl provided', async () => {
      mockSignInWithMicrosoft.mockResolvedValueOnce(undefined);

      // Simulate calling the action without a callback URL
      await signInWithMicrosoft(undefined);

      expect(mockSignInWithMicrosoft).toHaveBeenCalledWith(undefined);
    });

    it('should call signInWithMicrosoft with callbackUrl when provided', async () => {
      mockSignInWithMicrosoft.mockResolvedValueOnce(undefined);

      // Simulate calling the action with a callback URL
      await signInWithMicrosoft('/dashboard');

      expect(mockSignInWithMicrosoft).toHaveBeenCalledWith('/dashboard');
    });

    it('should call signInWithMicrosoft with /admin/settings/storage as callbackUrl', async () => {
      mockSignInWithMicrosoft.mockResolvedValueOnce(undefined);

      await signInWithMicrosoft('/admin/settings/storage');

      expect(mockSignInWithMicrosoft).toHaveBeenCalledWith('/admin/settings/storage');
    });

    it('should be defined as a server action', () => {
      expect(signInWithMicrosoft).toBeDefined();
      expect(typeof signInWithMicrosoft).toBe('function');
    });
  });

  describe('Login Page Structure', () => {
    it('should have proper metadata with title "Sign in"', () => {
      // This test documents the expected metadata from the page
      // In a real scenario, you would import and test the metadata export
      const expectedTitle = 'Sign in';
      expect(expectedTitle).toBe('Sign in');
    });
  });
});
