const mysql = require('C:/Users/User/Desktop/2LIBARDOS/SIGOA/server/node_modules/mysql2/promise');

async function eliminarDocentesV() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'upel_talento_humano'
  });

  try {
    await conn.beginTransaction();

    // 1. Obtener los docentes con cédula V-
    const [docentesV] = await conn.query("SELECT * FROM docentes_v3 WHERE cedula LIKE 'V-%'");
    console.log(`Docentes encontrados con cédula V-: ${docentesV.length}`);
    console.table(docentesV.map(d => ({ id: d.id, cedula: d.cedula, nombres: d.nombres, apellidos: d.apellidos })));

    if (docentesV.length === 0) {
      console.log('No se encontraron docentes con cédula V-. Nada que eliminar.');
      await conn.rollback();
      return;
    }

    // 2. Reasignar la cuenta bancaria de Franklin Arzola duplicado (ID 140) al legítimo (ID 129)
    const [bancos140] = await conn.query("SELECT * FROM docentes_datos_bancarios_v3 WHERE docente_id = 140");
    if (bancos140.length > 0) {
      console.log(`Reasignando cuenta bancaria ${bancos140[0].cuenta_bancaria} de ID 140 al docente legítimo ID 129 (Franklin Arzola)...`);
      await conn.query(
        "UPDATE docentes_datos_bancarios_v3 SET docente_id = 129 WHERE docente_id = 140"
      );
      console.log('Cuenta bancaria reasignada exitosamente.');
    }

    // 3. Eliminar los docentes con prefijo V-
    const [delRes] = await conn.query("DELETE FROM docentes_v3 WHERE cedula LIKE 'V-%'");
    console.log(`Registros eliminados de docentes_v3: ${delRes.affectedRows}`);

    // 4. Registrar la acción en la tabla de auditoría institucional
    const detalleAuditoria = `Eliminación administrativa de ${delRes.affectedRows} registros atípicos con formato 'V-' por no pertenecer al personal docente del Pedagógico (IDs depurados: ${docentesV.map(d => d.id).join(', ')}).`;
    await conn.query(
      `INSERT INTO audit_logs (usuario_id, user_name, user_role, action, details) 
       VALUES (1, 'Administrador', 'ADMIN', 'Depuración de Base de Datos - Cédulas V-', ?)`,
      [detalleAuditoria]
    );
    console.log('Registro de auditoría insertado con éxito.');

    await conn.commit();
    console.log('Transacción confirmada (COMMIT) con éxito.');

    // 5. Verificación post-eliminación
    console.log('\n--- VERIFICACIÓN POST-ELIMINACIÓN ---');
    const [vCheck] = await conn.query("SELECT COUNT(*) as count FROM docentes_v3 WHERE cedula LIKE 'V-%'");
    console.log(`Docentes con cédula V- restantes en docentes_v3: ${vCheck[0].count}`);

    const [totalDocentes] = await conn.query("SELECT COUNT(*) as total FROM docentes_v3");
    console.log(`Total docentes actuales en docentes_v3: ${totalDocentes[0].total}`);

    const [arzolaCheck] = await conn.query(
      "SELECT d.id, d.cedula, d.nombres, d.apellidos, b.cuenta_bancaria, b.tipo_cuenta FROM docentes_v3 d LEFT JOIN docentes_datos_bancarios_v3 b ON d.id = b.docente_id WHERE d.id = 129"
    );
    console.log('Estado final docente Franklin Arzola (ID 129):', arzolaCheck[0]);

  } catch (err) {
    await conn.rollback();
    console.error('Error durante la eliminación. Se aplicó ROLLBACK:', err);
    throw err;
  } finally {
    await conn.end();
  }
}

eliminarDocentesV().catch(console.error);
