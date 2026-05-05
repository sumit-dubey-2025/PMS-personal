import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { listEmployees } from '@/lib/api/employees';
import type { Employee, EmployeeListQuery } from '@/types/employee';
import { listOrgNodes } from '@/lib/api/employees';

export const EMPLOYEES_QUERY_KEY = 'employees' as const;

/**
 * Infinite-scroll hook for the employee list.
 * Each page is fetched via cursor-based pagination.
 *
 * Returns a flattened `employees` array plus standard
 * TanStack Query cursor-pagination helpers.
 */
export function useEmployees(query: EmployeeListQuery = {}) {
  return useInfiniteQuery({
    queryKey: [EMPLOYEES_QUERY_KEY, query],
    queryFn: ({ pageParam }) => listEmployees({ ...query, cursor: pageParam ?? undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    select: (data): { employees: Employee[]; totalCount: number | null } => ({
      employees: data.pages.flatMap((p) => p.data),
      totalCount: data.pages[0]?.pagination.totalCount ?? null,
    }),
  });
}

export const ORG_NODES_QUERY_KEY = 'orgNodes';

/**
 * Fetches all active org nodes for the department dropdown.
 */
export function useOrgNodes() {
  return useQuery({
    queryKey: [ORG_NODES_QUERY_KEY],
    queryFn: listOrgNodes,
    staleTime: 5 * 60 * 1000, // cache for 5 minutes — org structure rarely changes
  });
}
