const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isTargetQuery, handleInterceptedQuery } = require('../utils/sql3NFInterceptor');
const adapter = require('../utils/docente3NFAdapter');
const cacheService = require('../services/docentesCache.service');

describe('Suite de Pruebas Unitarias: Interceptor y Adaptador 3NF', () => {

  describe('isTargetQuery() - Detección de Consultas SQL Dirigidas a Vistas', () => {
    it('debe detectar correctamente sentencias INSERT hacia docentes', () => {
      const sql = 'INSERT INTO docentes (cedula, nombres, apellidos) VALUES (?, ?, ?)';
      assert.strictEqual(isTargetQuery(sql), true);
    });

    it('debe detectar correctamente sentencias UPDATE hacia docentes', () => {
      const sql = 'UPDATE docentes SET telefono = ? WHERE cedula = ?';
      assert.strictEqual(isTargetQuery(sql), true);
    });

    it('debe detectar correctamente sentencias DELETE hacia docentes_materias', () => {
      const sql = 'DELETE FROM docentes_materias WHERE docente_cedula = ?';
      assert.strictEqual(isTargetQuery(sql), true);
    });

    it('debe detectar operaciones sobre cargas_historicas', () => {
      const sql = 'INSERT INTO cargas_historicas (cedula_docente, periodoAcademico, materias) VALUES (?, ?, ?)';
      assert.strictEqual(isTargetQuery(sql), true);
    });

    it('debe interceptar consultas SELECT sobre tablas virtuales 3NF y omitir tablas no objetivo', () => {
      assert.strictEqual(isTargetQuery('SELECT * FROM docentes WHERE cedula = ?'), true);
      assert.strictEqual(isTargetQuery('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 10'), false);
    });

    it('NO debe interceptar consultas de escritura sobre tablas no objetivo', () => {
      const sql = 'UPDATE audit_logs SET user_name = ? WHERE id = ?';
      assert.strictEqual(isTargetQuery(sql), false);
    });

    it('debe manejar entradas vacías o no string de forma segura', () => {
      assert.strictEqual(isTargetQuery(null), false);
      assert.strictEqual(isTargetQuery(undefined), false);
      assert.strictEqual(isTargetQuery(12345), false);
      assert.strictEqual(isTargetQuery(''), false);
    });
  });

  describe('normalizeCedula() - Normalización Canónica de Cédulas Venezolanas (3NF sin prefijo)', () => {
    it('debe conservar dígitos canónicos para entradas numéricas o string', () => {
      assert.strictEqual(adapter.normalizeCedula('12345678'), '12345678');
      assert.strictEqual(adapter.normalizeCedula(18500200), '18500200');
    });

    it('debe limpiar prefijos v/V o V- y devolver solo dígitos canónicos', () => {
      assert.strictEqual(adapter.normalizeCedula('v12345678'), '12345678');
      assert.strictEqual(adapter.normalizeCedula('V12345678'), '12345678');
    });

    it('debe remover prefijos V- / v- en cédulas formateadas para almacenamiento 3NF', () => {
      assert.strictEqual(adapter.normalizeCedula('V-12345678'), '12345678');
      assert.strictEqual(adapter.normalizeCedula('v-12345678'), '12345678');
    });

    it('debe eliminar espacios en blanco y caracteres no numéricos redundantes', () => {
      assert.strictEqual(adapter.normalizeCedula('  12345678  '), '12345678');
      assert.strictEqual(adapter.normalizeCedula(' V-9876543 '), '9876543');
    });

    it('debe retornar cadena vacía si el valor es falsy o inválido', () => {
      assert.strictEqual(adapter.normalizeCedula(''), '');
      assert.strictEqual(adapter.normalizeCedula(null), '');
      assert.strictEqual(adapter.normalizeCedula(undefined), '');
    });
  });

  describe('resolveDepartmentId() - Resolución Fonética y Coincidencia de Departamentos', () => {
    const mockDepts = [
      { id: 1, nombre: 'Matemática y Física' },
      { id: 2, nombre: 'Pedagogía y Filosofía' },
      { id: 3, nombre: 'Ciencias Sociales' },
      { id: 4, nombre: 'Educación Agropecuaria' }
    ];

    it('debe resolver departamentos exactos o por palabra clave', () => {
      assert.strictEqual(adapter.resolveDepartmentId('Matemática', mockDepts), 1);
      assert.strictEqual(adapter.resolveDepartmentId('PEDAGOGIA', mockDepts), 2);
      assert.strictEqual(adapter.resolveDepartmentId('Ciencias Sociales', mockDepts), 3);
      assert.strictEqual(adapter.resolveDepartmentId('Agropecuaria', mockDepts), 4);
    });

    it('debe retornar departamento por defecto (ID 1) si no hay coincidencia o está vacío', () => {
      assert.strictEqual(adapter.resolveDepartmentId('', mockDepts), 1);
      assert.strictEqual(adapter.resolveDepartmentId('Astronomía Cuántica', mockDepts), 1);
    });
  });

  describe('resolveSedeId() - Resolución de Sedes Académicas', () => {
    const mockSedes = [
      { id: 1, nombre: 'Rubio (Sede Central)' },
      { id: 2, nombre: 'Mendoza Fría' },
      { id: 3, nombre: 'Encontrados' }
    ];

    it('debe resolver sedes por concordancia de nombre', () => {
      assert.strictEqual(adapter.resolveSedeId('Rubio', mockSedes), 1);
      assert.strictEqual(adapter.resolveSedeId('Mendoza', mockSedes), 2);
      assert.strictEqual(adapter.resolveSedeId('Encontrados', mockSedes), 3);
    });

    it('debe retornar sede por defecto (ID 1) para entradas vacías', () => {
      assert.strictEqual(adapter.resolveSedeId('', mockSedes), 1);
      assert.strictEqual(adapter.resolveSedeId(null, mockSedes), 1);
    });
  });

  describe('Aislamiento estricto por periodo_id en Adaptador e Interceptor 3NF', () => {
    it('resolvePeriodoId() y resolveContratacionId() deben filtrar por periodo específico', async () => {
      const queries = [];
      const mockExecutor = {
        query: async (sql, params) => {
          queries.push({ sql, params });
          if (sql.includes('periodos_academicos_v3')) return [[{ id: 2 }]];
          if (sql.includes('docentes_contrataciones_v3')) return [[{ id: 77 }]];
          return [[]];
        }
      };

      const pId = await adapter.resolvePeriodoId(mockExecutor, '2026-II');
      assert.strictEqual(pId, 2);
      const cId = await adapter.resolveContratacionId(mockExecutor, 10, pId);
      assert.strictEqual(cId, 77);
      assert.ok(queries.some(q => q.sql.includes('docente_id = ? AND periodo_id = ?') && q.params[1] === 2));
    });

    it('deleteMateriasByCedula3NF() debe restringir el DELETE al periodo_id indicado', async () => {
      const queries = [];
      const mockExecutor = {
        query: async (sql, params) => {
          queries.push({ sql, params });
          if (sql.includes('SELECT id FROM docentes_v3')) return [[{ id: 10 }]];
          if (sql.includes('SELECT id FROM periodos_academicos_v3')) return [[{ id: 2 }]];
          return [{ affectedRows: 1 }];
        }
      };

      await adapter.deleteMateriasByCedula3NF(mockExecutor, 'V-18959604', '2026-II');
      const deleteQuery = queries.find(q => q.sql.includes('DELETE ca FROM cargas_academicas_v3'));
      assert.ok(deleteQuery, 'Debe ejecutar DELETE en cargas_academicas_v3');
      assert.ok(deleteQuery.sql.includes('c.periodo_id = ?'), 'Debe filtrar por c.periodo_id = ?');
      assert.deepStrictEqual(deleteQuery.params, [10, 2]);
    });

    it('handleInterceptedQuery() debe respetar AND periodoAcademico = ? en DELETE FROM docentes_materias', async () => {
      const queries = [];
      const mockExecutor = {
        query: async (sql, params) => {
          queries.push({ sql, params });
          if (sql.includes('SELECT id FROM docentes_v3')) return [[{ id: 10 }]];
          if (sql.includes('SELECT id FROM periodos_academicos_v3')) return [[{ id: 2 }]];
          return [{ affectedRows: 1 }];
        }
      };

      await handleInterceptedQuery(
        mockExecutor,
        'DELETE FROM docentes_materias WHERE (docente_cedula = ? OR docente_cedula = ?) AND periodoAcademico = ?',
        ['V-18959604', '18959604', '2026-II']
      );

      const deleteQuery = queries.find(q => q.sql.includes('DELETE ca FROM cargas_academicas_v3'));
      assert.ok(deleteQuery, 'Debe ejecutar DELETE en cargas_academicas_v3');
      assert.deepStrictEqual(deleteQuery.params, [10, 2]);
    });

    it('updateDocenteInCache() debe actualizar solo el periodo activo y preservar caches historicos', () => {
      cacheService.apiMemoryCache.docentes.clear();
      cacheService.setDocentesCache('ACTUAL', [{ cedula: 'V-18959604', status: 'Por Revisar', materias: [] }]);
      cacheService.setDocentesCache('2026-I', [{ cedula: 'V-18959604', status: 'Cerrado', materias: [{ nombre: 'TIC I' }] }]);

      cacheService.updateDocenteInCache('V-18959604', {
        status: 'Validado',
        periodoAcademico: '2026-II',
        materias: [{ nombre: 'TIC III' }]
      });

      const activeList = cacheService.getDocentesCache('ACTUAL');
      const historicList = cacheService.getDocentesCache('2026-I');
      assert.strictEqual(activeList[0].status, 'Validado');
      assert.strictEqual(activeList[0].materias[0].nombre, 'TIC III');
      assert.strictEqual(historicList[0].status, 'Cerrado');
      assert.strictEqual(historicList[0].materias[0].nombre, 'TIC I');
      cacheService.apiMemoryCache.docentes.clear();
    });
  });

});
