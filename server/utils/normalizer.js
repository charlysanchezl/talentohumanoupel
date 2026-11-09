/**
 * Utilidades de normalización institucional UPEL
 */

function normalizeDepartmentName(dept) {
  if (!dept) return 'Sin Asignar';
  const d = dept.toString().trim().toUpperCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (d.includes('MATEMATICA')) return 'Matemática';
  if (d.includes('PEDAGOGIA')) return 'Pedagogía';
  if (d.includes('CIENCIAS SOCIAL') || d.includes('SOCIAL')) return 'Ciencias Sociales';
  if (d.includes('AGROINDUSTRIAL') || d.includes('AGRO')) return 'Agroindustrial';
  return dept.toString().trim();
}

const normalizeSingleDepartment = normalizeDepartmentName;

module.exports = {
  normalizeDepartmentName,
  normalizeSingleDepartment
};
