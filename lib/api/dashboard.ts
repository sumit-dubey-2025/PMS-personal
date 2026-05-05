const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5104/api';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? 'v1';

const DEV_USER_EMAIL = process.env.NODE_ENV === 'development'
    ? (process.env.NEXT_PUBLIC_DEV_USER_EMAIL ?? 'dev@localhost')
    : null;

async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
    const url = `${API_BASE}/${API_VERSION}${path}`;
    return fetch(url, {
        cache: 'no-store',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(DEV_USER_EMAIL ? { 'X-Dev-User-Email': DEV_USER_EMAIL } : {}),
            ...(options?.headers ?? {}),
        },
    });
}


const handleApiResponse = async <T>(response: Response, errorMessage: string): Promise<T> => {
    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`${errorMessage}: ${response.status}`);
    }
    return response.json() as Promise<T>;
};

interface DashboardStats {
    activeEmployees: number;
    newEmployeesLastMonth: number;
    orgNodes: number;
    roleFamilies: number;
    departments: number;
    activeCycles: number;
}

const DEFAULT_DASHBOARD_STATS: DashboardStats = {
    activeEmployees: 0,
    newEmployeesLastMonth: 5,
    orgNodes: 0,
    roleFamilies: 10,
    departments: 4,
    activeCycles: 2,
};

interface DashboardStatsOptions {
    authToken?: string;
}

export const getDashboardStats = async (
    { authToken }: DashboardStatsOptions = {}
): Promise<DashboardStats> => {
    const fetchOptions = authToken
        ? { headers: { Authorization: `Bearer ${authToken}` } }
        : {};

    try {
        const [employeeData, orgNodes] = await Promise.all([
            apiFetch('/employees/count?status=Active', fetchOptions)
                .then(res => handleApiResponse<{ count: number }>(res, 'Failed to get employees')),
            getOrganisationNode(fetchOptions),
        ]);

        const activeEmployees = employeeData?.count ?? 0;

        return {
            ...DEFAULT_DASHBOARD_STATS,
            activeEmployees,
            orgNodes,
        };
    } catch (err) {
        console.error('getDashboardStats error:', err);
        return DEFAULT_DASHBOARD_STATS;
    }
};

export const getOrganisationNode = async (
    fetchOptions: RequestInit = {}
): Promise<number> => {
    try {
        const response = await apiFetch('/org/nodes?flat=true', fetchOptions);
        const data = await handleApiResponse<{
            data: unknown[];
            pagination?: {
                total?: number;
            };
        }>(response, 'Failed to get org nodes');
        if (typeof data?.pagination?.total === 'number') {
            return data?.pagination?.total;
        }
        return data?.data?.length;
    } catch (err) {
        console.error('getOrganisationNode error:', err);
        return 0;
    }
};