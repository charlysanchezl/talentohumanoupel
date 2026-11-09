# Informe de Auditoría de Ciberseguridad Ofensiva, DevOps & AppSec
**Sistema:** UPEL SIGOA — Talento Humano  
**Clasificación del Informe:** CONFIDENCIAL / REVISIÓN DE SEGURIDAD CRÍTICA  
**Enfoque:** Análisis Forense de Código, Modelado de Amenazas, Superficie de Ataque y Remediación  

---

## 1. Auditoría de Scripts de Arranque y Automatización (`.bat`, `.py`, `.ps1`)

```
                          [ ATACANTE EN INTERNET ]
                                     |
                                     v (Tráfico HTTPS cifrado vía Cloudflare Edge)
                   https://xxxxxx.trycloudflare.com
                                     |
                     +---------------+---------------+
                     |   iniciar_tunel_publico.bat   |
                     |       (cloudflared.exe)       |
                     +---------------+---------------+
                                     |
                        (Redirección a Localhost)
                                     v
                  +-------------------------------------+
                  |   Node.js Cluster (Puerto 3001)     |
                  |     (INICIAR_TALENTO_HUMANO.bat)    |
                  +-------------------------------------+
                  |  [X] Sin Autenticación JWT          |
                  |  [X] Backdoors Activos              |
                  |  [X] /api/backup/sql Expuesto       |
                  |  [X] /api/backup/restore Abierto    |
                  +-------------------------------------+
                                     |
                       (Impacto Crítico Inmediato)
                                     v
                  +-------------------------------------+
                  |  Base de Datos MySQL / PII Docente  |
                  |     Exfiltrada o Destruida          |
                  +-------------------------------------+
```

### A. Exposición WAN Insegura: `iniciar_tunel_publico.bat` y `cloudflared.exe`
- **Mecanismo:** El script ejecuta `.\cloudflared.exe tunnel --url http://localhost:3001` sin ningún tipo de configuración de autenticación perimetral (Cloudflare Access, Zero Trust, Service Tokens o restricción de IPs).
- **Riesgo Crítico:** Al publicar el puerto `3001` a través de un dominio público efímero (`https://*.trycloudflare.com`), se expone inmediatamente un backend que **no implementa autenticación en sus endpoints REST**. Cualquier usuario en internet que obtenga el subdominio puede consultar, volcar o destruir la base de datos institucional sin requerir credenciales válidas.
- **Riesgo de Cadena de Suministro (Supply Chain):** El archivo `cloudflared.exe` (53 MB) reside directamente en la raíz del repositorio sin validación de suma criptográfica (SHA-256) en tiempo de ejecución. Si el archivo es modificado por un malware local o un commit no autorizado, los operadores ejecutarán un binario arbitrario con privilegios de usuario local.

### B. Fuga Masiva de Secretos y PII: `push.ps1`
```powershell
$git = "C:\Program Files\Git\cmd\git.exe"
& $git init
& $git config user.name "UPEL Admin"
& $git config user.email "admin@upel.edu"
& $git add .
& $git commit -m "Initial commit"
& $git branch -M main
& $git remote add origin https://github.com/xvyerika/talentohumanoupel.git
& $git push -u origin main
```
- **Riesgo DevOps / Fuga de Datos:** 
  1. La instrucción `git add .` sin un `.gitignore` restrictivo sube automáticamente el archivo `server/.env` (credenciales de MySQL), plantillas con datos personales reales de docentes (`Docentes_contratados.xlsx`, `finalexcel.xlsx`, `talento_humano_upel.pdf`) y números de cuenta bancaria.
  2. Expone una URL remota de GitHub fija (`https://github.com/xvyerika/talentohumanoupel.git`).
  3. Ejecuta `git init` indiscriminadamente en cada invocación, lo que puede corromper el árbol de commits y el historial de autoría en entornos compartidos.

### C. Fuga de Rutas de Infraestructura y Manipulación Ciega: `script.py` y `capture.js`
- **Ruta Hardcodeada en Python:** `script.py` apunta a `c:\Users\User\Desktop\2LIBARDOS\talento_humano_upel\src\components\ConsultarDocentes.jsx`. Revela nombres de usuario del sistema operativo y estructuras de directorios locales.
- **Modificación Destructiva sin AST:** Realiza reemplazos basados en cadenas planas (`content.replace`) sobre archivos fuente de React sin validación sintáctica. Si se ejecuta en un entorno donde el código fuente difiere ligeramente, corrompe silenciosamente el frontend en producción.

---

## 2. Disección de Puertas Traseras (Backdoors) y Credenciales Hardcodeadas

### A. Backdoor Maestro en Autenticación Administrativa
Ubicación: `server/index.js` (Líneas 636-638)
```javascript
// server/index.js (Líneas 636-638)
} else if (matchedUser.role === 'ADMIN' && (password === 'informatica' || password === 'admin')) {
  passwordValid = true;
}
```
- **Mapeo de la Vulnerabilidad:**
  - Si un usuario ingresa cualquier identificador asociado al rol `ADMIN` (incluyendo los alias automáticos `'admin'`, `'administrador'`, `'informatica'`, `'ing.yudithpena'`, `'ing.yudithpeña'`), el sistema **ignora la contraseña real configurada en la base de datos** si el atacante ingresa `'admin'` o `'informatica'`.
  - Concede acceso total inmediato con privilegios de Administrador.

### B. Bypass Universal de Cuentas Docentes
Ubicación: `server/index.js` (Líneas 642-660)
```javascript
// server/index.js (Líneas 648-650)
// Acepta su cédula con o sin V-, su correo, 'docente', o '123456'
if (password === doc.cedula || password === docPassClean || (doc.correo && password === doc.correo) || password === 'docente' || password === '123456') {
  matchedUser = {
    id: 9000 + (doc.id || 1),
    username: `V-${docPassClean}`,
    name: doc.nombreCompleto || doc.nombre || 'Docente UPEL',
    role: 'DOCENCIA',
    ...
```
- **Mapeo de la Vulnerabilidad:**
  - Conociendo únicamente el número de Cédula de Identidad de cualquier docente (dato público en listados universitarios), cualquier persona puede iniciar sesión en su cuenta utilizando las contraseñas universales `'docente'`, `'123456'`, el correo o la misma cédula.

### C. Almacenamiento en Texto Plano y Exposición Masiva en Memoria
- **Base de Datos:** En `server/database.sql` (línea 7), el campo `password` de la tabla `usuarios` está tipado como `VARCHAR(100)` y el seed por defecto inserta `'admin123'` en texto plano (línea 104). La tabla `docentes` tiene el campo `clave VARCHAR(100)` igualmente sin cifrar (línea 44).
- **Extracción Insegura en Cada Intento de Login:** En `server/index.js` (línea 613), la sentencia `SELECT * FROM usuarios` carga **todos los usuarios y sus contraseñas en texto plano a la memoria RAM de Node.js** en cada petición de inicio de sesión antes de realizar la comparación en JavaScript.

---

## 3. Análisis de Superficie de Ataque y Endpoints Desprotegidos

La API carece en su totalidad de middlewares de validación de sesión o tokens criptográficos (JWT). Todas las rutas son accesibles de forma anónima:

```
+-----------------------------------------------------------------------------------------------+
| RUTA HTTP                     | MÉTODO | AUTORIZACIÓN | RIESGO / IMPACTO                      |
+-------------------------------+--------+--------------+---------------------------------------+
| /api/backup/sql               | GET    | NINGUNA      | Exfiltración masiva de BD completa    |
| /api/backup/json              | GET    | NINGUNA      | Volcado de usuarios, claves y nómina  |
| /api/backup/restore           | POST   | NINGUNA      | TRUNCATE y reescritura de tablas      |
| /api/docentes/:cedula         | DELETE | NINGUNA      | Borrado no autorizado de docentes     |
| /api/users/:id                | DELETE | NINGUNA      | Eliminación de cuentas administrativas|
| /api/users                    | POST   | NINGUNA      | Creación de nuevos administradores    |
| /api/mail-config              | POST   | NINGUNA      | Secuestro de credenciales SMTP/Resend |
| /api/send-ficha-email         | POST   | NINGUNA      | Spam institucional / Phishing masivo  |
| /api/periodos/replicar        | POST   | NINGUNA      | Modificación no auditada de semestres |
+-------------------------------+--------+--------------+---------------------------------------+
```

### A. Exfiltración y Destrucción Masiva: Bóveda de Respaldo
- **Volcado Completo sin Credenciales:** `GET /api/backup/sql` genera y devuelve el volcado DDL y DML de todas las tablas críticas (`usuarios`, `docentes`, `cargas_historicas`, `audit_logs`). Un atacante puede descargar toda la base de datos ejecutando una simple petición GET en el navegador.
- **Riesgo de Inyección SQL y Destrucción en Restauración:** `POST /api/backup/restore` ejecuta `TRUNCATE TABLE docentes`, `TRUNCATE TABLE docentes_materias` y construye consultas `INSERT` concatenando directamente las claves del objeto JSON:
  ```javascript
  const keys = Object.keys(d).map(k => `\`${k}\``).join(', ');
  const vals = Object.values(d).map(v => db.escape(v)).join(', ');
  await connection.query(`INSERT INTO docentes (${keys}) VALUES (${vals})`);
  ```
  La manipulación de las claves JSON permite inyectar nombres de columnas arbitrarios o corromper la consulta SQL.

### B. Falsificación de Identidad e Impunidad en Auditoría
En todas las rutas (`/api/docentes`, `/api/periodos`, `/api/backup/restore`), la identidad del usuario que ejecuta la acción se extrae del cuerpo JSON de la petición entrante:
```javascript
const auditor = req.body.auditor; // O req.query.user
await logAction(auditor.username, auditor.role, 'ACCION_CRITICA', ...);
```
Un atacante puede ejecutar operaciones destructivas y enviar `{"auditor": {"username": "rector_upel", "role": "ADMIN"}}`, incriminando a terceros en `audit_logs`.

---

## 4. Higiene del Repositorio y Control de Versiones

### Hallazgos Forenses en el Espacio de Trabajo:
1. **Binarios Compilados sin Gobernanza:**
   - `cloudflared.exe`: 53 MB incluidos en el índice de Git. Dificulta auditorías de código fuente y representa un vector de persistencia binaria.
   - `cPanel_Upload.zip`: 1.6 MB que contiene un snapshot comprimido de código antiguo y artefactos potencialmente desactualizados.
2. **Archivos Temporales y Bloqueos de MS Office en Git:**
   - Archivos como `~$Docentes_contratados.xlsx`, `~$finalexcel.xlsx`, `..xlsx`, `ofertacharly.xls` y `Docentes_contratados.xlsx` contienen metadatos de usuario de Windows, marcas de tiempo y datos personales reales de profesores (PII sujeta a regulaciones de protección de datos).
3. **Secretos en Claro en Control de Versiones:**
   - `server/.env` se encuentra bajo seguimiento de Git, versionando la configuración de base de datos local.

---

## 5. Vectores de Explotación Teóricos

### Escenario 1: Exfiltración Completa de la Base de Datos vía Túnel Expuesto
1. **Descubrimiento:** El administrador inicia `iniciar_tunel_publico.bat` para pruebas externas. La URL generada (`https://subdominio.trycloudflare.com`) es compartida o descubierta mediante escaneo pasivo de certificados de Cloudflare.
2. **Acceso Anónimo:** Un atacante accede directamente a la URL pública en el endpoint `https://subdominio.trycloudflare.com/api/backup/sql`.
3. **Descarga:** El servidor Express genera inmediatamente el volcado SQL con todas las tablas de usuarios, docentes y registros históricos, sin solicitar sesión, token ni autenticación básica.

### Escenario 2: Secuestro de Cuenta de Administrador Mediante Backdoor
1. **Acceso al Login:** El atacante visita la interfaz web o realiza una petición HTTP `POST` hacia `/api/login`.
2. **Uso de Clave Maestra:** Envía `username: "admin"` y `password: "informatica"` o `"admin"`.
3. **Elevación de Privilegios:** La condición de la línea 636 en `server/index.js` valida la autenticación como exitosa y devuelve el objeto de usuario con rol `ADMIN`.

### Escenario 3: Destrucción Total de Datos con Falsificación de Auditoría
1. **Construcción de Carga Destructiva:** El atacante envía una petición HTTP `POST` a `/api/backup/restore` con un objeto `data` que contiene `docentes: []` y un parámetro `user: "administrador_legitimo"`.
2. **Vaciado de Tablas:** El servidor ejecuta `TRUNCATE TABLE docentes`, eliminando todo el registro docente.
3. **Registro Falso:** El log de auditoría registra que la acción fue ejecutada por `"administrador_legitimo"`.

---

## 6. Matriz de Riesgo Corregida y Profundizada

| ID | Vulnerabilidad | Vector de Ataque | CVSS v3.1 Base | Impacto Técnico |
| :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | Endpoints de Backup y Restauración sin Autenticación | Red (WAN/LAN) vía HTTP GET/POST directo | **9.8 (Crítico)** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` | Pérdida total de confidencialidad, integridad y disponibilidad de los datos universitarios. |
| **SEC-02** | Puertas Traseras de Autenticación Hardcodeadas | Autenticación HTTP POST a `/api/login` | **9.8 (Crítico)** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H` | Bypass completo de control de acceso; toma de control administrativo. |
| **SEC-03** | Contraseñas en Texto Plano en MySQL | Lectura local/SQLi o lectura de respaldos | **8.6 (Alto)** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N` | Compromiso transversal de cuentas de usuarios y docentes. |
| **SEC-04** | Túnel WAN Inseguro a Backend Desprotegido | Red WAN (Cloudflare Tunnel público) | **9.1 (Crítico)** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N` | Exposición de servicios de desarrollo y administración a internet. |
| **SEC-05** | Falsificación de Identidad en Auditoría | Inyección en cuerpo HTTP `req.body.auditor` | **7.5 (Alto)** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N` | Imposibilidad de realizar análisis forense confiable (repudio de acciones). |
| **SEC-06** | Fuga de PII y Credenciales en Git (`push.ps1`) | Repositorio Git remoto mal configurado | **7.7 (Alto)** `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N` | Exposición de secretos del servidor y datos personales de docentes en repositorios. |

---

## 7. Plan de Remediación Inmediata (Código Seguro / Patches)

### Parche 1: Hashing Criptográfico con `bcryptjs` y Eliminación de Backdoors
Instalar dependencias necesarias:
```bash
npm install bcryptjs jsonwebtoken
```

Crear el módulo de autenticación segura:
```javascript
// server/utils/security.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET || 'UPEL_SIGOA_STRONG_SECRET_KEY_PROD_2027';
const JWT_EXPIRES_IN = '8h';

async function hashPassword(plainTextPassword) {
  return await bcrypt.hash(plainTextPassword, SALT_ROUNDS);
}

async function comparePassword(plainTextPassword, hashedPassword) {
  if (!plainTextPassword || !hashedPassword) return false;
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}

function generateToken(user) {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    department: user.department
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

module.exports = { hashPassword, comparePassword, generateToken, JWT_SECRET };
```

Reemplazar la lógica de `/api/login` en `server/index.js`:
```javascript
// server/index.js - Endpoint de Login Seguro
const { comparePassword, generateToken } = require('./utils/security');

app.post('/api/login', async (req, res) => {
  try {
    let { username, password } = req.body;
    username = (username || '').toString().trim();
    password = (password || '').toString().trim();

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Usuario y contraseña requeridos.' });
    }

    // Consulta parametrizada exacta por usuario o correo (sin traer toda la tabla a memoria)
    const [users] = await db.query(
      'SELECT id, username, password, name, role, department, correo FROM usuarios WHERE username = ? OR correo = ? LIMIT 1',
      [username, username]
    );

    let user = users[0];
    let isValid = false;

    if (user) {
      // Verificación contra hash bcrypt (se eliminan todas las contraseñas maestras hardcodeadas)
      isValid = await comparePassword(password, user.password);
    }

    if (!user || !isValid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
    }

    // Generar Token JWT con firma criptográfica
    const token = generateToken(user);

    // Registrar en auditoría utilizando la identidad verificada
    await logAction(user.username, user.role, 'AUTH_LOGIN_SUCCESS', 'Inicio de sesión exitoso', req);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});
```

---

### Parche 2: Middleware de Autenticación y Autorización por Roles (RBAC)

```javascript
// server/middlewares/auth.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/security');

function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Acceso denegado: Token Bearer requerido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Inyección de identidad verificada (id, username, role, department)
    next();
  } catch (err) {
    return res.status(403).json({ success: false, error: 'Token inválido o expirado.' });
  }
}

function requireRole(allowedRoles = []) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Acceso denegado: Permisos insuficientes.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
```

---

### Parche 3: Aseguramiento de Rutas Críticas y Auditoría Inmutable

Aplicar `requireAuth` y `requireRole` a los endpoints administrativos y de respaldo en `server/index.js`:

```javascript
const { requireAuth, requireRole } = require('./middlewares/auth');

// 1. Descarga de Backup SQL: Solo ADMIN con Token
app.get('/api/backup/sql', requireAuth, requireRole('ADMIN'), async (req, res) => {
  // La identidad proviene de req.user (no de req.query)
  await logAction(req.user.username, req.user.role, 'BACKUP_SQL_EXPORT', 'Exportación de respaldo SQL', req);
  // ... lógica de volcado ...
});

// 2. Restauración de Respaldo: Solo ADMIN con Token
app.post('/api/backup/restore', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const { payload } = req.body;
  if (!payload || !payload.data) {
    return res.status(400).json({ success: false, error: 'Estructura de respaldo inválida.' });
  }

  await logAction(req.user.username, req.user.role, 'BACKUP_RESTORE_EXECUTE', 'Restauración ejecutada', req);
  // ... lógica de restauración transaccional parametrizada ...
});

// 3. Operaciones destructivas de usuarios y docentes
app.delete('/api/users/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
  const targetId = parseInt(req.params.id, 10);
  if (targetId === 1 || targetId === req.user.id) {
    return res.status(400).json({ success: false, error: 'No se puede eliminar la cuenta actual.' });
  }
  await db.query('DELETE FROM usuarios WHERE id = ?', [targetId]);
  await logAction(req.user.username, req.user.role, 'USER_DELETE', `Usuario ID ${targetId} eliminado`, req);
  res.json({ success: true });
});

app.delete('/api/docentes/:cedula', requireAuth, requireRole(['ADMIN', 'DOCENCIA']), async (req, res) => {
  const { cedula } = req.params;
  await db.query('DELETE FROM docentes WHERE cedula = ?', [cedula]);
  await logAction(req.user.username, req.user.role, 'DOCENTE_DELETE', `Docente ${cedula} eliminado`, req);
  res.json({ success: true });
});
```

---

### Parche 4: Higiene del Repositorio y Saneamiento de Git

Actualizar el archivo `.gitignore` en la raíz para prevenir fugas de secretos y archivos binarios:

```gitignore
# ==========================================
# SECRETOS Y VARIABLES DE ENTORNO
# ==========================================
.env
*.env
server/.env
server/.env.local

# ==========================================
# BINARIOS Y EJECUTABLES DE TERCEROS
# ==========================================
*.exe
cloudflared.exe
*.zip
cPanel_Upload.zip
*.tar.gz

# ==========================================
# DATOS SENSIBLES Y ARCHIVOS DE OFICINA (PII)
# ==========================================
*.xlsx
*.xls
~$*
*.pdf
*.doc
*.docx
test_unzip*/
test_unzip2*/

# ==========================================
# SCRIPTS TEMPORALES Y DE PRUEBAS LOCALES
# ==========================================
script.py
capture.js
test_excel.js
server/check*.js
server/test_*.js

# ==========================================
# DEPENDENCIAS Y COMPILADOS
# ==========================================
node_modules/
dist/
dist-ssr/
build/
.gradle/
android/app/build/
```

Ejecutar la purga de archivos cacheados en Git:
```bash
# Eliminar binarios y archivos sensibles del índice de Git sin borrarlos del disco local
git rm --cached cloudflared.exe cPanel_Upload.zip server/.env
git rm --cached *.xlsx ~$*.xlsx 2>/dev/null
git commit -m "chore(security): sanitize repository, remove binaries, credentials and PII"
```
