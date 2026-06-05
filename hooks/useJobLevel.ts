import { useQuery } from '@tanstack/react-query';
import { listRoleFamilies, listJobLevels, listCompetencies, getMatrix } from '@/lib/api/jobLevel';

export const ROLE_FAMILIES_QUERY_KEY = 'roleFamilies' as const;
export const JOB_LEVELS_QUERY_KEY = 'jobLevels' as const;
export const COMPETENCIES_QUERY_KEY = 'competencies' as const;
export const MATRIX_QUERY_KEY = 'competencyMatrix' as const;

/**
 * Fetches all role families.
 */
export function useRoleFamilies() {
  return useQuery({
    queryKey: [ROLE_FAMILIES_QUERY_KEY],
    queryFn: listRoleFamilies,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches all job levels.
 */
export function useJobLevels() {
  return useQuery({
    queryKey: [JOB_LEVELS_QUERY_KEY],
    queryFn: listJobLevels,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches all competencies.
 */
export function useCompetencies() {
  return useQuery({
    queryKey: [COMPETENCIES_QUERY_KEY],
    queryFn: listCompetencies,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches the competency matrix data and column configuration.
 */
export function useCompetencyMatrix() {
  return useQuery({
    queryKey: [MATRIX_QUERY_KEY],
    queryFn: getMatrix,
    staleTime: 2 * 60 * 1000,
  });
}

import { listDesignations } from '@/lib/api/jobLevel';

export const DESIGNATIONS_QUERY_KEY = 'designations' as const;

export function useDesignations() {
  return useQuery({
    queryKey: [DESIGNATIONS_QUERY_KEY],
    queryFn: listDesignations,
    staleTime: 5 * 60 * 1000,
  });
}
