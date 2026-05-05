'use client';

import { useState } from 'react';
import EmployeeToolbar from './components/EmployeeToolbar';
import EmployeeTable from './components/EmployeeTable';
import EmployeeFormSlideOver from './components/EmployeeFormSlideOver';
import type { Employee } from '@/types/employee';
import type { SortValue } from './components/EmployeeSortPanel';
import { useEmployees,useOrgNodes  } from '@/hooks/useEmployees';
import { useCreateEmployee, usePatchEmployee } from '@/hooks/useEmployeeMutations';

// ─── Client component ─────────────────────────────────────────────────────────

export default function EmployeeRegistryClient() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSlideOverOpen, setSlideOverOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [roleFamily, setRoleFamily] = useState('');
  const [jobLevel, setJobLevel] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [sort, setSort] = useState<SortValue>({ column: '', direction: 'asc' });

  const { data, fetchNextPage, hasNextPage, isFetching, isLoading, isError } = useEmployees({
    search,
    status,
    department,
    sortBy: sort.column || 'name',
    sortOrder: sort.direction || 'asc',
  });

  const employees = data?.employees ?? [];
  const totalCount = data?.totalCount ?? null;

  const createMutation = useCreateEmployee();
  const patchMutation = usePatchEmployee();
  const { data: orgNodes = [], isLoading: isOrgNodesLoading } = useOrgNodes();

  function handleEdit(employee: Employee) {
    setSelectedEmployee(employee);
    setSlideOverOpen(true);
  }

  function handleAddNew() {
    setSelectedEmployee(null);
    setSlideOverOpen(true);
  }

  function handleCloseSlideOver() {
    setSlideOverOpen(false);
  }

  function handleClearAllFilters() {
    setSearch('');
    setDepartment('');
    setStatus('');
    setRoleFamily('');
    setJobLevel('');
    setEmploymentType('');
  }

  return (
    <div className="relative flex flex-col gap-6">
      <EmployeeToolbar
        search={search}
        onSearch={setSearch}
        department={department}
        setDepartment={setDepartment}
        status={status}
        setStatus={setStatus}
        roleFamily={roleFamily}
        setRoleFamily={setRoleFamily}
        jobLevel={jobLevel}
        setJobLevel={setJobLevel}
        employmentType={employmentType}
        setEmploymentType={setEmploymentType}
        sort={sort}
        onSortChange={setSort}
        onSync={() => {}}
        onBulkImport={() => {}}
        onAddNew={handleAddNew}
        onClearAll={handleClearAllFilters}
      />

      {isError && (
        <div className="border-error/20 bg-error-container/30 text-on-error-container rounded-md border px-4 py-3 text-sm">
          Failed to load employees. Please refresh or try again.
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <p className="text-on-surface-variant text-sm">Loading employees…</p>
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          totalCount={totalCount}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetching={isFetching}
          onEdit={handleEdit}
        />
      )}

      <EmployeeFormSlideOver
        isOpen={isSlideOverOpen}
        employee={selectedEmployee}
        onClose={handleCloseSlideOver}
        createMutation={createMutation}
        patchMutation={patchMutation}
         orgNodes={orgNodes}
  isOrgNodesLoading={isOrgNodesLoading}
      />
    </div>
  );
}
