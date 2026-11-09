const db = require('./db'); 
async function run() {
  try {
    const [res] = await db.query(`UPDATE docentes SET periodoAcademico='2026-I'`);
    console.log('Updated ' + res.affectedRows + ' rows'); 
  } catch(e) {
    console.error(e);
  }
  process.exit(0); 
}
run();
