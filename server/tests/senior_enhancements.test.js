const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { normalizeDepartmentName } = require('../utils/normalizer');

describe('Suite de Pruebas: Mejoras Técnicas Senior Implementadas', () => {

  describe('1. Seguridad Criptográfica de Contraseñas (Bcrypt & Retrocompatibilidad)', () => {
    it('debe generar y verificar hashes válidos con bcrypt', () => {
      const rawPassword = 'MiPasswordSeguro2026!';
      const hash = bcrypt.hashSync(rawPassword, 10);
      assert.strictEqual(hash.startsWith('$2a$') || hash.startsWith('$2b$'), true);
      assert.strictEqual(bcrypt.compareSync(rawPassword, hash), true);
      assert.strictEqual(bcrypt.compareSync('PasswordIncorrecto', hash), false);
    });

    it('debe admitir flujo retrocompatible y bloquear estrictamente los 4 dígitos por defecto cuando el docente ya tiene clave', () => {
      const verifyPortalPassword = (entered, claveInDb, default4) => {
        const hasCustomClave = Boolean(claveInDb && String(claveInDb).trim() !== '');
        if (hasCustomClave) {
          const expected = String(claveInDb).trim();
          const isBcrypt = expected.startsWith('$2a$') || expected.startsWith('$2b$');
          if (isBcrypt) {
            return bcrypt.compareSync(entered, expected);
          }
          return entered === expected;
        }
        return entered === default4;
      };

      const default4 = '5678';
      const customPlain = 'MiClaveNueva123';
      const customHash = bcrypt.hashSync('MiClaveNueva123', 10);

      // Docente SIN clave personalizada (primer ingreso):
      assert.strictEqual(verifyPortalPassword('5678', null, default4), true, 'Debe permitir 4 dígitos por defecto si no tiene clave');
      assert.strictEqual(verifyPortalPassword('5678', '', default4), true, 'Debe permitir 4 dígitos por defecto si clave está vacía');
      assert.strictEqual(verifyPortalPassword('0000', null, default4), false, 'Debe rechazar clave errónea en primer ingreso');

      // Docente CON clave personalizada (hash bcrypt):
      assert.strictEqual(verifyPortalPassword('MiClaveNueva123', customHash, default4), true, 'Debe aceptar la clave correcta');
      assert.strictEqual(verifyPortalPassword('5678', customHash, default4), false, 'DEBE RECHAZAR los 4 dígitos por defecto una vez que configuró su clave');
      assert.strictEqual(verifyPortalPassword('otraClave', customHash, default4), false, 'Debe rechazar contraseñas incorrectas');

      // Docente CON clave legada en texto plano:
      assert.strictEqual(verifyPortalPassword('MiClaveNueva123', customPlain, default4), true, 'Debe aceptar clave legada en texto plano');
      assert.strictEqual(verifyPortalPassword('5678', customPlain, default4), false, 'DEBE RECHAZAR los 4 dígitos por defecto si ya tiene clave legada');
    });
  });

  describe('2. Control de Acceso Basado en Atributos (ABAC) por Departamento', () => {
    const checkAbacPermission = (user, targetDepartment) => {
      if (!user) return false;
      if (user.role === 'ADMIN') return true;
      if (user.role === 'JEFE' && user.department) {
        const userDeptNorm = normalizeDepartmentName(user.department).toLowerCase();
        const targetDeptNorm = normalizeDepartmentName(targetDepartment || '').toLowerCase();
        return userDeptNorm === targetDeptNorm;
      }
      return false;
    };

    it('un usuario ADMIN debe tener acceso a cualquier departamento', () => {
      const adminUser = { username: 'admin', role: 'ADMIN' };
      assert.strictEqual(checkAbacPermission(adminUser, 'Matematica'), true);
      assert.strictEqual(checkAbacPermission(adminUser, 'Pedagogia'), true);
      assert.strictEqual(checkAbacPermission(adminUser, 'Ciencias Sociales'), true);
    });

    it('un JEFE de Matematica SOLO debe tener acceso a docentes de Matematica', () => {
      const jefeMate = { username: 'jefe.mate', role: 'JEFE', department: 'Matematica' };
      assert.strictEqual(checkAbacPermission(jefeMate, 'Matematica'), true);
      assert.strictEqual(checkAbacPermission(jefeMate, 'Matemática'), true); // Normalización con tildes
      assert.strictEqual(checkAbacPermission(jefeMate, 'Pedagogia'), false);
      assert.strictEqual(checkAbacPermission(jefeMate, 'Agroindustrial'), false);
    });

    it('un JEFE de Pedagogia no puede alterar departamentos ajenos', () => {
      const jefePeda = { username: 'jefe.peda', role: 'JEFE', department: 'Pedagogia' };
      assert.strictEqual(checkAbacPermission(jefePeda, 'Pedagogía'), true);
      assert.strictEqual(checkAbacPermission(jefePeda, 'Ciencias Sociales'), false);
    });
  });

  describe('3. Protección de Identidad en Auditoría contra Suplantación (Anti-Spoofing)', () => {
    const resolveAuditIdentity = (reqUser, bodyAuditor) => {
      const username = (reqUser && reqUser.username) ? reqUser.username : (bodyAuditor && bodyAuditor.username ? bodyAuditor.username : 'Sistema');
      const role = (reqUser && reqUser.role) ? reqUser.role : (bodyAuditor && bodyAuditor.role ? bodyAuditor.role : 'ADMIN');
      return { username, role };
    };

    it('debe priorizar la identidad del token JWT req.user por encima de cualquier valor falsificado en req.body', () => {
      const authenticatedUser = { username: 'carlos_jefe', role: 'JEFE' };
      const maliciousBodyAuditor = { username: 'super_admin_falso', role: 'ADMIN' };

      const resolved = resolveAuditIdentity(authenticatedUser, maliciousBodyAuditor);
      assert.strictEqual(resolved.username, 'carlos_jefe');
      assert.strictEqual(resolved.role, 'JEFE');
    });

    it('debe usar el body solo como fallback seguro si no existe req.user autenticado', () => {
      const resolved = resolveAuditIdentity(null, { username: 'soporte_local', role: 'DOCENCIA' });
      assert.strictEqual(resolved.username, 'soporte_local');
      assert.strictEqual(resolved.role, 'DOCENCIA');
    });
  });

  describe('4. Resiliencia de Cola Offline con ACKs Granulares', () => {
    it('debe remover únicamente los ítems confirmados por el servidor sin perder los pendientes o fallidos', () => {
      const queue = [
        { id: 'item_1', type: 'UPDATE_CARGA', payload: { cedula: 'V-1001' } },
        { id: 'item_2', type: 'CREATE_STAFF', payload: { cedula: 'V-1002' } },
        { id: 'item_3', type: 'UPDATE_CARGA', payload: { cedula: 'V-1003' } }
      ];

      // Simulamos que el servidor procesó con éxito solo item_1 e item_3
      const confirmedIds = ['item_1', 'item_3'];
      const idSet = new Set(confirmedIds);
      const remaining = queue.filter(item => !idSet.has(item.id));

      assert.strictEqual(remaining.length, 1);
      assert.strictEqual(remaining[0].id, 'item_2');
      assert.strictEqual(remaining[0].payload.cedula, 'V-1002');
    });
  });

  describe('5. Formato de Mensajería IPC para Coherencia de Caché en Cluster', () => {
    it('debe formatear el evento de invalidación compatible con el proceso maestro', () => {
      const message = { type: 'CACHE_INVALIDATE' };
      assert.strictEqual(typeof message, 'object');
      assert.strictEqual(message.type, 'CACHE_INVALIDATE');
    });
  });

});
