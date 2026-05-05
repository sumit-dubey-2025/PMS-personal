'use server';

import { cookies, headers } from 'next/headers';
import { getDashboardStats } from '@/lib/api/dashboard';

export async function fetchDashboardStats() {
    const cookieStore = await cookies();
    const headerStore = await headers();
    
    const authToken =
        cookieStore.get('auth-token')?.value ??
        headerStore.get('authorization') ??
        '';

    return getDashboardStats({ authToken });
}