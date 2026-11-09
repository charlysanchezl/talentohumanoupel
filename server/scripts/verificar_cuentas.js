const db = require('../db');

async function test() {
  const [rows] = await db.query(
    "SELECT cedula, nombres, apellidos, banco, cuentaBancaria, tipoCuenta FROM docentes WHERE LENGTH(cuentaBancaria) >= 10 LIMIT 10"
  );
  console.table(rows);
  const [totalWithBank] = await db.query(
    "SELECT COUNT(*) as total FROM docentes WHERE LENGTH(cuentaBancaria) >= 10"
  );
  console.log('Total docentes con cuenta bancaria activa:', totalWithBank[0].total);
  process.exit(0);
}

test().catch(e => {
  console.error(e);
  process.exit(1);
});
