import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getDocenteContractStatus, getStatusBadgeInfo } from '../../src/utils/contractStatus.js';
import { normalizeSearchText, matchesSearch, matchesAnyField } from '../../src/utils/searchHelper.js';

describe('Suite Unitaria Frontend: Estatus Contractual y Búsqueda', () => {
  const periods = [
    { nombre: '2026-I', estado: 'CERRADO', fechaHasta: '2026-09-30' },
    { nombre: '2026-II', estado: 'ACTIVO', fechaHasta: '2027-03-15' },
    { nombre: '2027-I', estado: 'PLANIFICACION', fechaHasta: '' }
  ];

  it('getDocenteContractStatus debe devolver Inactivo cuando no hay materias o horas', () => {
    const status = getDocenteContractStatus({
      cedula: 'V-18959604',
      status: 'Por Revisar',
      periodoAcademico: '2026-II',
      materias: []
    }, periods);
    assert.strictEqual(status, 'Inactivo');
  });

  it('getDocenteContractStatus debe devolver Vencido para períodos CERRADOS', () => {
    const status = getDocenteContractStatus({
      cedula: 'V-18959604',
      status: 'Validado',
      periodoAcademico: '2026-I',
      materias: [{ nombre: 'TIC I', horasSemanal: 4 }]
    }, periods);
    assert.strictEqual(status, 'Vencido');
  });

  it('getDocenteContractStatus debe devolver Planificación para períodos en PLANIFICACION', () => {
    const status = getDocenteContractStatus({
      cedula: 'V-18959604',
      status: 'Por Revisar',
      periodoAcademico: '2027-I',
      materias: [{ nombre: 'TIC I', horasSemanal: 4 }]
    }, periods);
    assert.strictEqual(status, 'Planificación');
  });

  it('getDocenteContractStatus debe devolver Activo cuando está validado y vigente', () => {
    const futureDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const status = getDocenteContractStatus({
      cedula: 'V-18959604',
      status: 'Validado',
      periodoAcademico: '2026-II',
      fechaHasta: futureDate,
      materias: [{ nombre: 'TIC III', horasSemanal: 4 }]
    }, periods);
    assert.strictEqual(status, 'Activo');
  });

  it('getStatusBadgeInfo debe retornar estilos válidos para cada estado', () => {
    const badge = getStatusBadgeInfo('Activo');
    assert.strictEqual(badge.label, 'Activo Vigente');
    assert.ok(badge.bg && badge.color && badge.border);
  });

  it('matchesSearch y matchesAnyField deben ignorar tildes y mayúsculas', () => {
    assert.strictEqual(normalizeSearchText('  Matemática Aplicada '), 'matematica aplicada');
    assert.strictEqual(matchesSearch('ROSA VIRGINIA PÉREZ', 'perez'), true);
    assert.strictEqual(matchesAnyField(['Educación Física', 'TIC III'], 'fisica'), true);
    assert.strictEqual(matchesAnyField(['Educación Física'], 'quimica'), false);
  });
});
