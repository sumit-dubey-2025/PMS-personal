'use server';

import { signIn, signOut } from '@/auth';

export async function signInWithMicrosoft(callbackUrl?: string): Promise<void> {
  await signIn('microsoft-entra-id', { redirectTo: callbackUrl ?? '/dashboard' });
}

export async function signOutUser(): Promise<void> {
  await signOut({ redirectTo: '/login' });
}
