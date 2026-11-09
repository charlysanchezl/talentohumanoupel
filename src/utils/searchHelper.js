/**
 * Utilidad Institucional de Búsqueda Inteligente e Insensible a Diacríticos (Acentos/Tildes)
 * UPEL SIGOA - Permite que búsquedas como "matematica", "pedagogia", "quimica"
 * encuentren con precisión "MATEMÁTICA", "PEDAGOGÍA", "QUÍMICA".
 */

/**
 * Normaliza un texto removiendo tildes, diacríticos y espacios sobrantes
 * @param {string|number} text 
 * @returns {string} Texto en minúsculas sin acentos
 */
export function normalizeSearchText(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Verifica si un texto fuente contiene el término de búsqueda, ignorando mayúsculas, minúsculas y tildes
 * @param {string} sourceText - Texto base donde buscar (ej. nombre del docente, materia)
 * @param {string} queryTerm - Término ingresado por el usuario
 * @returns {boolean}
 */
export function matchesSearch(sourceText, queryTerm) {
  if (!queryTerm) return true;
  if (!sourceText) return false;
  return normalizeSearchText(sourceText).includes(normalizeSearchText(queryTerm));
}

/**
 * Verifica si alguno de los campos de un objeto coincide con el término de búsqueda
 * @param {string[]} fields - Lista de strings a evaluar
 * @param {string} queryTerm - Término buscado
 * @returns {boolean}
 */
export function matchesAnyField(fields, queryTerm) {
  if (!queryTerm) return true;
  const normalizedQuery = normalizeSearchText(queryTerm);
  if (!normalizedQuery) return true;
  return fields.some(f => normalizeSearchText(f).includes(normalizedQuery));
}
