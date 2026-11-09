const db = require('../db');

async function cleanIndexes() {
  console.log('--- Optimizando índices de audit_logs ---');
  const [currentIndexes] = await db.query('SHOW INDEX FROM audit_logs');
  const indexNames = [...new Set(currentIndexes.map(i => i.Key_name))];
  console.log('Índices actuales detectados:', indexNames);

  // Índices duplicados o redundantes a eliminar
  const toDrop = [
    'idx_audit_timestamp',
    'idx_audit_time_role',
    'idx_audit_role_time'
  ];

  for (const idx of toDrop) {
    if (indexNames.includes(idx)) {
      try {
        await db.query(`DROP INDEX \`${idx}\` ON audit_logs`);
        console.log(`✅ Eliminado índice redundante: ${idx}`);
      } catch (e) {
        console.warn(`Aviso eliminando ${idx}:`, e.message);
      }
    }
  }

  // Verificar índices finales
  const [finalIndexes] = await db.query('SHOW INDEX FROM audit_logs');
  const finalNames = [...new Set(finalIndexes.map(i => i.Key_name))];
  console.log('Índices optimizados activos:', finalNames);

  const [status] = await db.query("SHOW TABLE STATUS LIKE 'audit_logs'");
  console.log('Nuevo estado de la tabla:');
  console.log({
    Engine: status[0].Engine,
    Rows: status[0].Rows,
    Data_KB: (status[0].Data_length / 1024).toFixed(2),
    Index_KB: (status[0].Index_length / 1024).toFixed(2)
  });

  process.exit(0);
}

cleanIndexes().catch(e => {
  console.error(e);
  process.exit(1);
});
