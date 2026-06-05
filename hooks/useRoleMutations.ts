import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRoleFamily,
  patchRoleFamily,
  cloneRoleFamily,
  archiveRoleFamily,
  deleteRoleFamily,
  createJobLevel,
  patchJobLevel,
  reorderJobLevels,
  archiveJobLevel,
  saveMatrix,
  updateMatrixColumns,
} from '@/lib/api/roles';
import type {
  CreateRoleFamilyRequest,
  PatchRoleFamilyRequest,
  CloneRoleFamilyRequest,
  CreateJobLevelRequest,
  PatchJobLevelRequest,
  SaveMatrixRequest,
  MatrixColumn,
} from '@/types/role';
import {
  ROLE_FAMILIES_QUERY_KEY,
  JOB_LEVELS_QUERY_KEY,
  MATRIX_QUERY_KEY,
} from './useRoles';

// ─── Role Family mutations ─────────────────────────────────────────────────────

export function useCreateRoleFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoleFamilyRequest) => createRoleFamily(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ROLE_FAMILIES_QUERY_KEY] }),
  });
}

export function usePatchRoleFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchRoleFamilyRequest }) =>
      patchRoleFamily(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ROLE_FAMILIES_QUERY_KEY] }),
  });
}

export function useCloneRoleFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloneRoleFamilyRequest }) =>
      cloneRoleFamily(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ROLE_FAMILIES_QUERY_KEY] }),
  });
}

export function useDeleteRoleFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRoleFamily(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ROLE_FAMILIES_QUERY_KEY] }),
  });
}

export function useArchiveRoleFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveRoleFamily(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [ROLE_FAMILIES_QUERY_KEY] }),
  });
}

// ─── Job Level mutations ───────────────────────────────────────────────────────

export function useCreateJobLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobLevelRequest) => createJobLevel(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_LEVELS_QUERY_KEY] }),
  });
}

export function usePatchJobLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchJobLevelRequest }) =>
      patchJobLevel(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_LEVELS_QUERY_KEY] }),
  });
}

export function useReorderJobLevels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderJobLevels(orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_LEVELS_QUERY_KEY] }),
  });
}

export function useArchiveJobLevel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveJobLevel(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_LEVELS_QUERY_KEY] }),
  });
}

// ─── Matrix mutations ──────────────────────────────────────────────────────────

export function useSaveMatrix() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveMatrixRequest) => saveMatrix(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MATRIX_QUERY_KEY] }),
  });
}

export function useUpdateMatrixColumns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (columns: MatrixColumn[]) => updateMatrixColumns(columns),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [MATRIX_QUERY_KEY] }),
  });
}
