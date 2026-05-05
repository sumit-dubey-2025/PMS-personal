export const downloadEmployeeTemplate = () => {
  const headers = [
    "Email",
    "FullName",
    "EmployeeID",
    "DepartmentNodeCode",
    "PrimaryManagerEmail",
    "RoleFamilyCode",
    "JobLevelCode",
    "EmploymentType",
    "JoiningDate",
    "EmployeeStatus",
  ];
  
  const csvContent =
    // [headers, sampleRow]
    [headers]
      .map((row) => row.join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", "employee_template.csv");
  link.click();

  URL.revokeObjectURL(url);
};