/**
 * Script de Respaldo Automatizado Institucional (Paso 3 y 4)
 * UPEL SIGOA - Sistema Integrado de Gestión y Organización Académica
 * 
 * Funcionalidades:
 * 1. Genera un volcado SQL íntegro con estructura y datos.
 * 2. Guarda el archivo en data_insumos/backups/sigoa_backup_YYYY-MM-DD_HH-mm.sql
 * 3. Rotación automática FIFO: conserva los últimos 7 días de respaldos y depura los anteriores.
 * 4. Si rclone está instalado, sincroniza automáticamente hacia la nube (Google Drive).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db');

async function realizarRespaldo() {
  console.log('=======================================================');
  console.log('   UPEL SIGOA - GENERADOR DE RESPALDO AUTOMATIZADO');
  console.log('=======================================================');

  const backupDir = path.resolve(__dirname, '../../data_insumos/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const now = new Date();
  const fechaStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const nombreArchivo = `sigoa_backup_${fechaStr}.sql`;
  const rutaCompleta = path.join(backupDir, nombreArchivo);

  console.log(`[1/3] Extrayendo base de datos upel_talento_humano...`);

  try {
    const [tableRows] = await db.query('SHOW TABLES');
    const tables = tableRows.map(row => Object.values(row)[0]);

    let dump = `-- ========================================================\n`;
    dump += `-- UPEL SIGOA - RESPALDO AUTOMATIZADO INSTITUCIONAL\n`;
    dump += `-- Fecha: ${now.toLocaleString('es-VE')}\n`;
    dump += `-- Tablas: ${tables.length}\n`;
    dump += `-- ========================================================\n\n`;
    dump += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    dump += `SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";\n`;
    dump += `SET NAMES utf8mb4;\n\n`;

    for (const table of tables) {
      const [createRes] = await db.query(`SHOW CREATE TABLE \`${table}\``);
      const createSql = createRes[0]['Create Table'];

      dump += `-- --------------------------------------------------------\n`;
      dump += `DROP TABLE IF EXISTS \`${table}\`;\n`;
      dump += `${createSql};\n\n`;

      const [dataRows] = await db.query(`SELECT * FROM \`${table}\``);
      if (dataRows.length > 0) {
        dump += `INSERT INTO \`${table}\` VALUES\n`;
        const valueStrings = dataRows.map(r => {
          const vals = Object.values(r).map(v => db.escape(v)).join(', ');
          return `(${vals})`;
        });
        dump += `${valueStrings.join(',\n')};\n\n`;
      }
    }

    dump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    fs.writeFileSync(rutaCompleta, dump, 'utf8');
    const sizeKB = Math.round(fs.statSync(rutaCompleta).size / 1024);
    console.log(`[OK] Archivo generado exitosamente: ${nombreArchivo} (${sizeKB} KB)`);

    // 2. Rotación FIFO (Eliminar respaldos con más de 7 días de antigüedad)
    console.log(`[2/3] Verificando rotación de respaldos locales (retención 7 días)...`);
    const sieteDiasMs = 7 * 24 * 60 * 60 * 1000;
    const ahoraMs = Date.now();
    const archivos = fs.readdirSync(backupDir);
    let eliminados = 0;

    for (const f of archivos) {
      if (f.startsWith('sigoa_backup_') && f.endsWith('.sql')) {
        const filePath = path.join(backupDir, f);
        const stats = fs.statSync(filePath);
        if (ahoraMs - stats.mtimeMs > sieteDiasMs) {
          fs.unlinkSync(filePath);
          eliminados++;
        }
      }
    }
    console.log(`[OK] Rotación completada. Archivos antiguos depurados: ${eliminados}`);

    // 3. Sincronización con rclone (Nube / Google Drive) si está disponible
    console.log(`[3/3] Comprobando sincronización con rclone / Nube...`);
    try {
      execSync('rclone --version', { stdio: 'ignore' });
      console.log('[INFO] rclone detectado. Sincronizando respaldo con Google Drive...');
      execSync(`rclone copy "${rutaCompleta}" gdrive:Respaldos_UPEL_SIGOA/`, { stdio: 'inherit' });
      console.log('[OK] Respaldo sincronizado en Google Drive.');
    } catch (e) {
      console.log('[INFO] rclone no configurado en este equipo (respaldo local resguardado con éxito).');
    }

    console.log('=======================================================');
    console.log('   PROCESO DE RESPALDO FINALIZADO CORRECTAMENTE');
    console.log('=======================================================');
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Falló la generación del respaldo:', err);
    process.exit(1);
  }
}

realizarRespaldo();
