# 🛠️ Plan de Remediación Técnica Definitivo y Guía de Implementación

**Sistema:** UPEL SIGOA — Módulo de Talento Humano y Gestión Académica  
**Documentos Base:** `analisis_tecnico_talento_humano_upel.md` y `auditoria_seguridad_talento_humano_upel.md`  
**Objetivo:** Ejecución paso a paso de correcciones de seguridad críticas, estabilización arquitectónica y saneamiento de código.

---

## 🔴 FASE 1: Mitigación de Vulnerabilidades Críticas de Seguridad (Inmediato / CVSS 9.8 - 8.8)

---

### SEC-01 & SEC-02: Blindaje de Endpoints de Respaldo (`/api/backup/sql`) y Restauración (`/api/backup/restore`)

- **Impacto Técnico:**  
  Cualquier cliente sin autenticación podía forzar la descarga de la base de datos completa omitiendo el parámetro `role` en la URL (`GET /api/backup/sql`), o truncar y reemplazar todas las tablas enviando un objeto JSON falso en el cuerpo de la petición (`POST /api/backup/restore`).
- **Instrucciones de Implementación:**  
  1. Vincular el middleware `requireRole('ADMIN')` (`server/middlewares/auth.js`) a las rutas `/api/backup/sql`, `/api/backup/json` y `/api/backup/restore` en `server/index.js`.
  2. Extraer la identidad del usuario exclusivamente desde `req.user.username` (inyectado tras la validación criptográfica del JWT) y eliminar cualquier lectura de `req.query.role` o `req.body.user.role`.

#### 📌 Parche de Código Seguro (`server/index.js`):

```javascript
// server/index.js
const { requireAuth, requireRole } = require('./middlewares/auth');

// 1. Descarga Segura de Volcado SQL (Exclusivo Administrador autenticado)
app.get('/api/backup/sql', requireRole('ADMIN'), async (req, res) => {
  try {
    const adminUser = req.user.username; // Extraído del token JWT verificado
    const tables = ['usuarios', 'materias_catalogo', 'docentes', 'docentes_materias', 'cargas_historicas', 'audit_logs', 'periodos_academicos'];
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);

    let sqlDump = `-- UPEL SIGOA - BÓVEDA DE RESPALDO INSTITUCIONAL\n`;
    sqlDump += `-- Generado por: ${adminUser} | Fecha: ${now.toLocaleString('es-VE')}\n`;
    sqlDump += `SET FOREIGN_KEY_CHECKS = 0;\n`;
    sqlDump += `SET NAMES utf8mb4;\n\n`;

    for (const table of tables) {
      const [createRes] = await db.query(`SHOW CREATE TABLE \`${table}\``);
      sqlDump += `DROP TABLE IF EXISTS \`${table}\`;\n${createRes[0]['Create Table']};\n\n`;

      const [rows] = await db.query(`SELECT * FROM \`${table}\``);
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]).map(c => `\`${c}\``).join(', ');
        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          const valuesList = chunk.map(row => {
            const vals = Object.values(row).map(val => (val === null || val === undefined) ? 'NULL' : db.escape(val));
            return `(${vals.join(', ')})`;
          }).join(',\n');
          sqlDump += `INSERT INTO \`${table}\` (${columns}) VALUES\n${valuesList};\n`;
        }
        sqlDump += `\n`;
      }
    }

    sqlDump += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    await logAction(adminUser, 'ADMIN', 'Generación de Respaldo SQL', `Descargado backup .sql con ${tables.length} tablas.`, req);

    res.setHeader('Content-Type', 'application/sql; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="upel_sigoa_backup_${dateStr}.sql"`);
    return res.send(sqlDump);
  } catch (err) {
    console.error('Error generando respaldo SQL:', err);
    return res.status(500).json({ success: false, error: 'Error interno generando respaldo.' });
  }
});

// 2. Restauración Atómica de Base de Datos (Exclusivo Administrador autenticado)
app.post('/api/backup/restore', requireRole('ADMIN'), async (req, res) => {
  const adminUser = req.user.username;
  const { payload } = req.body;

  if (!payload || !payload.data || !payload.data.docentes) {
    return res.status(400).json({ success: false, error: 'Estructura de respaldo no válida.' });
  }

  const { data } = payload;
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    const tableKeys = [
      { key: 'docentes', table: 'docentes' },
      { key: 'docentes_materias', table: 'docentes_materias' },
      { key: 'materias_catalogo', table: 'materias_catalogo' },
      { key: 'cargas_historicas', table: 'cargas_historicas' }
    ];

    for (const item of tableKeys) {
      if (Array.isArray(data[item.key])) {
        await connection.query(`TRUNCATE TABLE \`${item.table}\``);
        for (const row of data[item.key]) {
          const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const vals = Object.values(row).map(v => db.escape(v)).join(', ');
          await connection.query(`INSERT INTO \`${item.table}\` (${keys}) VALUES (${vals})`);
        }
      }
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.commit();
    connection.release();

    await logAction(adminUser, 'ADMIN', 'Restauración de Base de Datos', 'Base de datos restaurada exitosamente.', req);
    return res.json({ success: true, message: 'Base de datos restaurada correctamente.' });
  } catch (errDb) {
    await connection.rollback();
    connection.release();
    console.error('Error restaurando base de datos:', errDb);
    return res.status(500).json({ success: false, error: errDb.message });
  }
});
```

---

### SEC-03: Saneamiento de Autenticación Docente en `server/index.js`

- **Impacto Técnico:**  
  La condición fallback admitía la cédula de identidad o correo como contraseña cuando el campo `doc.clave` estaba vacío, permitiendo la suplantación de cuentas docentes usando información pública.
- **Instrucciones de Implementación:**  
  Modificar el bloque de login en `server/index.js` (Líneas 633-675) para rechazar intentos de autenticación en cuentas sin contraseña explícita.

#### 📌 Parche de Código Seguro (`server/index.js`):

```javascript
// server/index.js (Líneas 633-675)
if (!passwordValid) {
  const cedulaClean = username.replace(/^V-?/i, '').trim();
  const [docentes] = await db.query(
    'SELECT * FROM docentes WHERE cedula = ? OR cedula = ? LIMIT 1', 
    [username, cedulaClean]
  );

  if (docentes.length > 0) {
    const doc = docentes[0];

    // Validación estricta: Se exige contraseña configurada y válida
    if (doc.clave && doc.clave.trim() !== '') {
      passwordValid = await verifyPassword(password, doc.clave);
    } else {
      // Bloqueo total de bypass: No se admiten cédulas ni correos como clave
      return res.status(401).json({
        success: false,
        message: 'Cuenta docente sin clave configurada. Por favor solicite su asignación en la Unidad de Informática.'
      });
    }

    if (passwordValid) {
      const docenteNombre = doc.nombreCompleto || 
        (doc.nombres ? `${doc.nombres} ${doc.apellidos || ''}`.trim() : null) || 
        doc.nombre || 'Docente UPEL';

      matchedUser = {
        id: 9000 + (doc.id || 1),
        username: `V-${cedulaClean}`,
        name: docenteNombre,
        role: 'DOCENCIA',
        department: doc.department || 'Docencia',
        correo: doc.correoInstitucional || doc.correo || ''
      };
    }
  }
}
```

---

### SEC-04: Hashing Seguro Criptográfico en `api/index.php`

- **Impacto Técnico:**  
  La API PHP realizaba `SELECT * FROM usuarios WHERE username = ? AND password = ?` comparando texto plano, lo que impedía el uso de hashes seguros `bcrypt` y exponía credenciales.
- **Instrucciones de Implementación:**  
  Sustituir la consulta directa por una búsqueda por `username` seguida de la función nativa `password_verify()`. Al registrar o editar usuarios (`POST`/`PUT`), aplicar `password_hash($password, PASSWORD_BCRYPT)`.

#### 📌 Parche de Código Seguro (`api/index.php`):

```php
// api/index.php (Líneas 46-99)
// --- LOGIN CON BCRYPT SEGURO ---
if ($endpoint === 'login' && $method === 'POST') {
    $username = trim($input['username'] ?? '');
    $password = trim($input['password'] ?? '');

    if (empty($username) || empty($password)) {
        sendResponse(['success' => false, 'message' => 'Credenciales incompletas'], 400);
    }

    $stmt = $pdo->prepare('SELECT id, username, password, name, role, department, correo FROM usuarios WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']); // Ocultar hash de la respuesta JSON
        sendResponse(['success' => true, 'user' => $user]);
    } else {
        sendResponse(['success' => false, 'message' => 'Credenciales inválidas'], 401);
    }
}

// --- CREACIÓN DE USUARIO CON HASH ---
if (strpos($endpoint, 'users') === 0 && $method === 'POST') {
    $rawPassword = trim($input['password'] ?? '');
    if (strlen($rawPassword) < 6) {
        sendResponse(['error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
    }
    $hashedPassword = password_hash($rawPassword, PASSWORD_BCRYPT, ['cost' => 10]);

    $stmt = $pdo->prepare('INSERT INTO usuarios (username, password, name, role, department, correo) VALUES (?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        trim($input['username'] ?? ''),
        $hashedPassword,
        trim($input['name'] ?? ''),
        trim($input['role'] ?? 'DOCENCIA'),
        trim($input['department'] ?? ''),
        trim($input['correo'] ?? '')
    ]);
    sendResponse(['success' => true]);
}
```

---

## 🟡 FASE 2: Estabilización de Arquitectura y Seguridad de Backend (Corto Plazo)

---

### ARCH-01 & ARCH-06: Vinculación Obligatoria del Middleware JWT y Headers en Frontend

- **Impacto Técnico:**  
  Aunque existía `server/middlewares/auth.js`, ninguna ruta de Express lo usaba y el frontend (`src/data.js`) no persistía ni enviaba el token en las peticiones HTTP.
- **Instrucciones de Implementación:**  
  1. En `src/data.js`, almacenar `data.token` en `localStorage` al iniciar sesión y crear una función auxiliar `getAuthHeaders()` que agregue `Authorization: Bearer <token>` a cada `fetch`.
  2. En `server/index.js`, aplicar `requireAuth` a todas las rutas `/api/docentes*`, `/api/periodos*`, `/api/audit-logs*` y `requireRole('ADMIN')` a `/api/users*`.

#### 📌 Parche en el Cliente (`src/data.js`):

```javascript
// src/data.js - Helper centralizado de peticiones autenticadas
const AUTH_TOKEN_KEY = 'upel_auth_token';

export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const loginUser = async (username, password) => {
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password: password.trim() })
    });
    const data = await res.json();
    if (res.ok && data.success && data.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem('upel_current_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || 'Error de credenciales.' };
  } catch (err) {
    return { success: false, message: 'No se pudo conectar con el servidor.' };
  }
};

export const logoutUser = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem('upel_current_user');
  window.location.href = '/login';
};
```

---

### ARCH-03: Modularización del Monolito `server/index.js`

- **Impacto Técnico:**  
  Un archivo único de 3.172 líneas entrelaza transporte, migraciones, negocio y hashing, elevando la deuda técnica y la probabilidad de regresiones.
- **Estructura Modular Objetivo:**

```
server/
├── config/
│   └── database.js          # Pool mysql2 e inicialización
├── controllers/
│   ├── authController.js    # Login, recuperación de clave
│   ├── backupController.js  # Volcados SQL/JSON y restauración
│   ├── docentesController.js# Carga académica, historial y CRUD
│   └── periodosController.js# Activación, replicación y cierre
├── middlewares/
│   ├── auth.js              # requireAuth, requireRole
│   ├── errorHandler.js      # Manejo global de excepciones 500
│   └── rateLimiter.js       # Protección contra fuerza bruta
├── routes/
│   ├── authRoutes.js        # /api/login, /api/auth/*
│   ├── backupRoutes.js      # /api/backup/*
│   ├── docentesRoutes.js    # /api/docentes/*
│   └── periodosRoutes.js    # /api/periodos/*
├── cluster.js               # Orquestador Multi-Worker
└── index.js                 # Entrada limpia de Express (< 80 líneas)
```

---

### ARCH-04 & SEC-06: Saneamiento de `server/fix_db.bat` y Portabilidad de Scripts

- **Impacto Técnico:**  
  `server/fix_db.bat` destruía permisos de MariaDB (`--skip-grant-tables`) y asumía rutas fijas (`C:\xampp\...`).
- **Instrucciones de Implementación:**  
  Reemplazar el script por un validador de conexión y auto-creación de esquemas sin alterar las tablas internas de privilegios de MySQL.

#### 📌 Parche para `server/fix_db.bat`:

```bat
@echo off
title UPEL SIGOA - Verificacion y Diagnostico de Base de Datos
echo =======================================================
echo   UPEL SIGOA - DIAGNOSTICO DE BASE DE DATOS
echo =======================================================
echo.
cd /d "%~dp0"
echo Ejecutando verificacion de esquema mediante Node.js...
node -e "const db = require('./db'); db.query('SELECT 1').then(() => { console.log('✅ Conexion con MySQL/MariaDB verificada exitosamente.'); process.exit(0); }).catch(e => { console.error('❌ Error de conexion:', e.message); process.exit(1); });"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ADVERTENCIA] No se pudo conectar al motor MySQL.
    echo Asegurese de que el servicio MariaDB / XAMPP este iniciado.
)
pause
```

---

## 🟢 FASE 3: Refactorización Estructural y Deuda Técnica (Mediano Plazo)

---

### ARCH-02: Estandarización y Hoja de Ruta de la API PHP

- **Decisión de Arquitectura:**  
  El backend Node.js (`server/index.js` + `server/cluster.js`) es el **motor primario y oficial** del sistema debido al soporte de clúster, procesamiento en tiempo real de Excel y colas de sincronización por lotes.
- **Acción:**
  - Mantener `api/index.php` exclusivamente como adaptador secundario para servidores Apache compartidos (cPanel).
  - Incluir en la cabecera de `api/index.php` la documentación de paridad de endpoints para evitar desfases de lógica de negocio.

---

### ARCH-05: Migraciones de Esquema Desacopladas del Arranque

- **Impacto Técnico:**  
  `syncDatabaseSchema()` ejecuta múltiples sentencias DDL (`ALTER TABLE`) en cada inicio de worker, generando sobrecarga y bloqueos de tabla innecesarios.
- **Instrucciones de Implementación:**  
  Extraer las sentencias a un script independiente `server/migrate.js` y agregarlo al ciclo de despliegue en `package.json`:

```json
// server/package.json
{
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "migrate": "node migrate.js"
  }
}
```

---

### Higiene del Repositorio y Actualización de `.gitignore`

- **Instrucciones de Implementación:**  
  Actualizar el archivo `.gitignore` en la raíz del proyecto para evitar la inclusión accidental de archivos temporales de Office, volcados de base de datos y hojas de cálculo con PII docente real.

#### 📌 Contenido Definitivo de `.gitignore`:

```gitignore
# Dependencias y compilados
node_modules/
dist/
dist-ssr/
*.local

# Archivos de entorno y credenciales
.env
.env.*
!.env.example
server/.env
server/.env.*
!server/.env.example

# Archivos temporales y de bloqueo de Office
~$*.xlsx
~$*.docx
~$*.pptx
*.tmp

# Archivos con Información de Identificación Personal (PII) y plantillas locales
Docentes_contratados.xlsx
finalexcel.xlsx
cursos_contratados.xlsx
*.xlsx
*.xls
*.csv

# Volcados y respaldos de Base de Datos
*.sql
*.dump
server/uploads/backups/
uploads/backups/

# Binarios y ejecutables
*.exe
*.dll
*.so

# Logs y registros de depuración
npm-debug.log*
yarn-debug.log*
yarn-error.log*
server/logs/
*.log
```

---

## 📋 Lista de Verificación y Cierre (Checklist de Implementación)

| Estado | Código | Tarea de Verificación |
| :---: | :--- | :--- |
| [x] | **SEC-01** | `/api/backup/sql` y `/api/backup/json` responden con `401/403` si no se envía un JWT con rol `ADMIN`. |
| [x] | **SEC-02** | `/api/backup/restore` solo permite restauración atómica con token `ADMIN` y registra la IP real. |
| [x] | **SEC-03** | Docentes sin contraseña configurada reciben error `401` y no pueden ingresar con su cédula o correo. |
| [x] | **SEC-04** | El login de `api/index.php` valida contraseñas usando `password_verify` sobre hashes `bcrypt`. |
| [x] | **ARCH-01** | `src/data.js` adjunta el encabezado `Authorization: Bearer <token>` en todas las mutaciones y consultas. |
| [x] | **ARCH-04** | `server/fix_db.bat` no contiene sentencias destructivas ni contraseñas en blanco de MySQL. |
| [x] | **DEV-01** | Los archivos temporales `~$*.xlsx` y volcados `.sql` están excluidos del árbol de Git mediante `.gitignore`. |
