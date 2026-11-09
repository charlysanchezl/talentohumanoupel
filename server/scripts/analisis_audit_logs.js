const db = require('../db');

async function check() {
  const [st] = await db.query("SHOW TABLE STATUS LIKE 'audit_logs'");
  const [idx] = await db.query("SHOW INDEX FROM audit_logs");
  const [cnt] = await db.query("SELECT COUNT(*) as c FROM audit_logs");
  const [desc] = await db.query("DESCRIBE audit_logs");

  console.log('=== STATUS ===');
  console.log({
    Engine: st[0].Engine,
    Rows: st[0].Rows,
    Avg_row_length: st[0].Avg_row_length,
    Data_length_KB: (st[0].Data_length / 1024).toFixed(2),
    Index_length_KB: (st[0].Index_length / 1024).toFixed(2),
    Total_size_MB: ((st[0].Data_length + st[0].Index_length) / 1024 / 1024).toFixed(3),
    Auto_increment: st[0].Auto_increment
  });

  console.log('=== COLUMNS ===');
  console.table(desc.map(d => ({ Field: d.Field, Type: d.Type, Key: d.Key, Extra: d.Extra })));

  console.log('=== INDEXES ===');
  console.table(idx.map(i => ({ Key_name: i.Key_name, Column: i.Column_name, Cardinality: i.Cardinality })));

  console.log('Total registros reales:', cnt[0].c);

  // Ver antigüedad de registros
  const [oldest] = await db.query("SELECT MIN(timestamp) as minDate, MAX(timestamp) as maxDate FROM audit_logs");
  console.log('Rango de fechas:', oldest[0]);

  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
