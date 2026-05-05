import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createEmployee, patchEmployeeFromRepository, uploadEmployeePhoto } from '@/lib/api/employees';
import type { CreateEmployeeRequest, PatchEmployeeRequest } from '@/types/employee';
import { EMPLOYEES_QUERY_KEY } from './useEmployees';

/**
 * Mutation hook for creating a new employee.
 * Invalidates the employees list cache on success.
 */
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeRequest) => createEmployee(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] });
    },
  });
}

/**
 * Mutation hook for patching (partially updating) an employee.
 * Invalidates the employees list cache on success.
 */
export function usePatchEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchEmployeeRequest }) =>
      patchEmployeeFromRepository(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEES_QUERY_KEY] });
    },
  });
}

/**
 * Mutation hook for uploading an employee profile photo.
 */
export function useUploadEmployeePhoto() {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      uploadEmployeePhoto(id, file),
  });
}