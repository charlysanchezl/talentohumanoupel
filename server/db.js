const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'upel_talento_humano',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

// Probar conexión
promisePool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a la base de datos MySQL establecida con éxito.');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error conectando a la base de datos MySQL:', err.message);
    console.error('Asegúrate de que XAMPP/MySQL esté encendido y la base de datos exista.');
  });

module.exports = promisePool;
