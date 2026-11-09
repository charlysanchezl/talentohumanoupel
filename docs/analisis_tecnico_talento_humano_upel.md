# Informe de Auditoría de Código y Arquitectura de Software
**Proyecto:** UPEL SIGOA — Sistema Integrado de Gestión y Organización Académica / Talento Humano  
**Repositorio:** `talento_humano_upel`  
**Institución:** Universidad Pedagógica Experimental Libertador (UPEL) — Instituto Pedagógico Rural Gervasio Rubio  
**Fecha de Evaluación:** Octubre 2026  
**Rol de Evaluación:** Senior Software Architect & Lead Security Auditor  

---

## 1. Resumen Ejecutivo

El sistema **UPEL SIGOA (Talento Humano)** es una plataforma de misión crítica concebida para la gestión integral del personal docente, planificación y asignación de cargas horarias, generación de fichas institucionales en formato PDF con verificación QR, emisión de nóminas por sede y exportación de archivos financieros (bancarios y ministeriales en Excel/TXT).

El sistema cuenta con una **arquitectura híbrida, polimórfica y multiplataforma**:
1. **Frontend:** Single Page Application (SPA) reactiva montada en **React 19** y empaquetada con **Vite 8**, que integra capacidades offline optimistas (`localStorage`) y sincronización P2P en red local.
2. **Backend Primario:** Servidor monolítico de alto rendimiento sobre **Node.js (Express)** orquestado con balanceo multi-núcleo (**Node Cluster**) y un pool de conexiones optimizado hacia **MySQL2**.
3. **Backend Secundario (Espejo):** Capa procedural en **PHP (PDO)** diseñada para permitir el funcionamiento de la API en alojamientos compartidos tradicionales (Apache/cPanel).
4. **Contenedor Móvil:** Wrapper nativo para **Android** implementado mediante **Capacitor 8.5** (`com.upel.sigoa`).

Esta auditoría técnica presenta una radiografía exhaustiva de la base de código, evaluando sus componentes, calidad estática, flujo de datos, seguridad, rendimiento en base de datos y un plan de acción estratégico de modernización.

---

## 2. Lenguajes de Programación Identificados

Se detectaron múltiples lenguajes a lo largo de las capas del repositorio, distribuidos según sus responsabilidades:

| Lenguaje | Capa / Módulo del Sistema | Archivos Clave | Rol y Responsabilidad |
| :--- | :--- | :--- | :--- |
| **JavaScript (ES2022+ / JSX)** | Frontend (SPA) & Servicios Web | `src/App.jsx`, `src/components/*`, `src/services/*`, `src/data.js` | Renderizado reactivo de interfaces, gestión de estados, validación de formularios docentes, motores de exportación documental (Excel, PDF, TXT) y capa de red cliente. |
| **JavaScript (Node.js CommonJS)** | Backend Transaccional & Herramientas | `server/index.js`, `server/cluster.js`, `server/db.js` | Servidor HTTP REST (Express), auto-migraciones DDL de MySQL, control de concurrencia anti-stampede, rate limiting, compresión GZIP, despacho SMTP y bitácora de auditoría. |
| **PHP (7.4+ / 8.x con PDO)** | API Espejo para Hosting Compartido | `api/db.php`, `api/index.php` | Backend alternativo procedural para despliegues en servidores Apache sin Node.js, capturando peticiones JSON mediante `.htaccess`. |
| **SQL (Dialecto MySQL 8 / MariaDB)** | Persistencia Relacional | `server/database.sql`, consultas en `server/index.js` | Definición de esquema de base de datos, relaciones de integridad referencial con borrado en cascada, índices de consulta frecuente y almacenamiento estructurado. |
| **Java / Groovy** | Capa Nativa Android | `android/app/src/main/java/.../MainActivity.java`, `android/app/build.gradle` | Actividad nativa de Capacitor (`BridgeActivity`), permisos de sistema y configuración de compilación del paquete APK. |
| **HTML5 & CSS3** | Presentación, Estilos y Manuales | `index.html`, `src/index.css`, `src/App.css`, `Manual_Institucional.html` | Variables de diseño CSS (paleta institucional UPEL), efectos de glassmorphism, media queries responsive y maquetación para impresión física. |
| **JSON** | Datos Estáticos y Manifiestos | `package.json`, `src/cursos.json`, `src/planes_estudio.json` | Catálogo maestro de 233 asignaturas, esquemas de planes de estudio y configuración de plugins. |
| **Windows Batch (`.bat`) / PowerShell (`.ps1`)** | Automatización DevOps & Despliegue | `INICIAR_MODO_DESARROLLO.bat`, `INICIAR_TALENTO_HUMANO.bat`, `push.ps1` | Ciclo de vida: lanzamiento concurrente dev/prod, compilación previa, arranque de cluster y túneles seguros Cloudflare. |

---

## 3. Arquitectura del Sistema y Flujo de Comunicación

```
+-----------------------------------------------------------------------------------------------+
|                                      CLIENTES / INTERFACES                                    |
+-----------------------------------------------------------------------------------------------+
|  1. Navegador Web Desktop / Móvil (Vite / React 19 SPA)                                       |
|  2. Aplicación Móvil Android (Capacitor WebView Bridge - com.upel.sigoa)                     |
+-----------------------------------------------------------------------------------------------+
                                                |
                                     (HTTP/REST JSON Fetch)
                                                |
                +-------------------------------+-------------------------------+
                |                                                               |
                v                                                               v
+-------------------------------+                               +-------------------------------+
|       BACKEND PRIMARIO        |                               |      BACKEND SECUNDARIO       |
|    Node.js Express Cluster    |                               |        PHP 8.x con PDO        |
|      (server/cluster.js)      |                               |        (api/index.php)        |
+-------------------------------+                               +-------------------------------+
| - Balanceador CPU multi-núcleo|                               | - Enrutador procedural        |
| - Express 4.19 REST API       |                               | - Conexión PDO directa        |
| - Cache Anti-Stampede         |                               | - Endpoints CRUD básicos      |
| - Auto-Saneamiento DDL MySQL  |                               +-------------------------------+
| - Multer (Carga de Imágenes)  |                                               |
| - Nodemailer (Emails SMTP)    |                                               |
| - Servidor Estático /dist     |                                               |
+-------------------------------+                                               |
                |                                                               |
                +-------------------------------+-------------------------------+
                                                |
                                                v
                              +-----------------------------------+
                              |     BASE DE DATOS RELACIONAL      |
                              |    MySQL / MariaDB (Pool: 75)     |
                              +-----------------------------------+
                              | Esquema: upel_talento_humano      |
                              | - docentes (127 registros)        |
                              | - docentes_materias (280 registros|
                              |   con seccion, cupos, inscritos)  |
                              | - materias_catalogo (233 asignat.)|
                              | - periodos_academicos (ACT/PLAN)  |
                              | - cargas_historicas (128 kardex)  |
                              | - usuarios (7 cuentas de acceso)  |
                              | - audit_logs (162 eventos)        |
                              | - autorizaciones                  |
                              +-----------------------------------+
```

### Patrón Arquitectónico de Base de Datos: Vistas SQL sobre Motor 3NF
Un hallazgo crítico de la auditoría es que las entidades `docentes` y `docentes_materias` no son tablas planas convencionales, sino **Vistas SQL de Alto Rendimiento (`SQL VIEW`)** que abstraen un motor normalizado en Tercera Forma Normal (3NF):
- La vista `docentes` proyecta de forma consolidada la unión de `docentes_v3` (datos personales), `docentes_contrataciones_v3` (contrato por lapso), `departamentos_v3` (catálogo departamental), `sedes_v3` (sedes académicas) y `docentes_datos_bancarios_v3` (cuenta principal).
- La vista `docentes_materias` proyecta la unión de `cargas_academicas_v3`, `docentes_contrataciones_v3` y `materias_catalogo_v3`.
- Esto confiere al sistema la velocidad de consulta plana para el frontend, manteniendo al mismo tiempo la pureza relacional e integridad referencial en las tablas base subyacentes.

#### `src/` (Frontend & Experiencia de Usuario)
- **`src/components/`:** Concentra los módulos de interfaz:
  - `StaffList.jsx`: Tabla global de docentes, filtrado por departamento, sede, categoría y dedicación; modales de edición y acciones masivas.
  - `ConsultarDocentes.jsx`: Interfaz de consulta y auditoría rápida de nómina, exportaciones directas y validación de horas.
  - `ProgramacionAcademica.jsx`: Matriz de asignación de oferta académica, control de cupos, secciones e inscritos.
  - `Dashboard.jsx`: Métricas gerenciales, gráficos de dedicación horaria y resúmenes presupuestarios.
  - `BackupVault.jsx`: Bóveda de respaldos que permite descargar e importar snapshots completos en JSON y SQL.
  - `PeriodManagementModal.jsx`: Administración de ciclo de vida de lapsos académicos (Activo, Planificación y Cierre).
- **`src/services/`:**
  - `excelExporter.js`: Motor especializado que genera libros Excel institucionales con 5 pestañas temáticas (Resumen General, Sede Rubio, Sede Sabana de Mendoza, Sede Encontrados y Demanda Académica) bajo el esquema de color oficial UPEL (`#003366`, `#D97706`).
  - `bankTxtExporter.js`: Generador de archivos planos de nómina para el Banco de Venezuela (`0102`) con sanitización posicional de cuentas y nombres.
  - `offlineManager.js` & `p2pMesh.js`: Capas de persistencia offline y sincronización P2P en red de área local (LAN).
- **`src/utils/`:**
  - `generateFichaPdf.js`: Renderizador dinámico de la Ficha Docente en PDF mediante `jspdf` y `jspdf-autotable`, incrustando sellos institucionales y códigos QR de autenticidad.

#### `server/` (Backend Principal Node.js)
- **`cluster.js`:** Monitorea la cantidad de hilos de CPU del sistema y bifurca trabajadores (`cluster.fork()`) para maximizar el throughput concurrente.
- **`db.js`:** Configura el Connection Pool de MySQL2 (75 conexiones, keep-alive periódico cada 10 min y timeout de 20s).
- **`index.js`:** Núcleo monolítico que implementa:
  - Mecanismos de migración y auto-saneamiento de esquema (`syncDatabaseSchema()`).
  - Caché en memoria con mitigación anti-stampede (`pendingDocentesFetches`).
  - Lógica de cierre automático de lapsos académicos por fecha.
  - API de autenticación, gestión de nómina, auditoría de eventos y servidor estático para la carpeta `dist/`.

#### `api/` (Backend Espejo PHP)
- Permite la portabilidad a servidores cPanel/Apache compartidos. Captura peticiones enviadas al endpoint `/api/*` y procesa directamente sentencias SQL mediante `PDO`.

#### `android/` (Plataforma Móvil)
- Configuración de Gradle, recursos nativos e integración de Capacitor (`com.upel.sigoa`), permitiendo que el bundle de Vite se ejecute en dispositivos móviles Android con aceleración por hardware.

---

## 4. Ecosistema de Frameworks y Librerías

```
+-----------------------------------------------------------------------------------+
|                        FRONTEND (Vite / React 19 Ecosystem)                       |
+------------------------------------+----------------------------------------------+
| Core Framework                     | React 19.2.7 + React-DOM 19.2.7              |
| Enrutamiento                       | React Router DOM 7.18.1                      |
| Compilador & Bundler               | Vite 8.1.4 + @vitejs/plugin-react 6.0.3      |
| Iconografía                        | Lucide-React 1.24.0                          |
| Gráficos y Dashboards              | Recharts 3.10.1                              |
| Procesamiento de Hojas de Cálculo  | ExcelJS 4.4.0 + SheetJS (xlsx 0.18.5)        |
|                                    | + xlsx-js-style 1.2.0                        |
| Generación de Documentos PDF       | jsPDF 4.2.1 + jsPDF-AutoTable 5.0.8          |
| Códigos QR de Validación           | QRCode 1.5.4                                 |
| Análisis Estático de Código        | Oxlint 1.71.0                                |
+------------------------------------+----------------------------------------------+

+-----------------------------------------------------------------------------------+
|                         BACKEND (Node.js / Express Core)                          |
+------------------------------------+----------------------------------------------+
| Framework Web                      | Express 4.19.2                               |
| Driver de Base de Datos            | MySQL2 3.10.0 (Promises + Connection Pool)   |
| Seguridad & CORS                   | Cors 2.8.5                                   |
| Compresión de Respuestas           | Compression 1.8.1 (GZIP)                     |
| Carga de Archivos (Multipart)      | Multer 2.2.0                                 |
| Despacho de Correo Electrónico     | Nodemailer 10.0.10                           |
| Configuración de Entorno           | Dotenv 16.4.5                                |
| Criptografía & Tokens              | JsonWebToken 9.0.3 + BcryptJS                |
+------------------------------------+----------------------------------------------+

+-----------------------------------------------------------------------------------+
|                            MÓVIL (Capacitor Native Bridge)                        |
+------------------------------------+----------------------------------------------+
| Runtime Híbrido Móvil              | @capacitor/core 8.5.0 + @capacitor/cli 8.5.0|
| Plataforma de Destino              | @capacitor/android 8.5.0                     |
+------------------------------------+----------------------------------------------+
```

---

## 5. Análisis Profundo de Código y Calidad Estática

### 1. Métricas de Complejidad y Tamaño de Archivos
Se observan varios archivos con una concentración excesiva de líneas de código (patrones *God File* y *God Component*):

- **`server/index.js`:** **3,320 líneas** en un solo archivo monolítico. Aglutina migraciones DDL, lógica de control, controladores de autenticación, serialización de backups, compresión de buffers, subida de archivos y entrega de la SPA en producción.
- **`src/components/StaffList.jsx`:** **2,212 líneas**.
- **`src/components/ConsultarDocentes.jsx`:** **1,968 líneas**.
- **`src/components/PublicRegistration.jsx`:** **1,877 líneas**.
- **`src/components/ProgramacionAcademica.jsx`:** **1,387 líneas**.
- **`src/services/excelExporter.js`:** **830 líneas**.

### 2. Resiliencia de la Interfaz y Manejo de Errores
- **ErrorBoundary Implementado:** Se implementó y vinculó el componente [src/components/ErrorBoundary.jsx](file:///c:/Users/User/Desktop/2LIBARDOS/talento_humano_upel/src/components/ErrorBoundary.jsx) en [src/main.jsx](file:///c:/Users/User/Desktop/2LIBARDOS/talento_humano_upel/src/main.jsx), encapsulando la raíz de la aplicación. Ante cualquier fallo imprevisto de renderizado, el sistema despliega una interfaz institucional con mensaje amigable, botones de recuperación ("Recargar y Continuar", "Regresar al Inicio") y panel de diagnóstico técnico sin dejar la pantalla en blanco.
- **Nomenclatura Mixta:** Coexisten identificadores en inglés y español en el modelo de datos (`titulosPregrado`, `department`, `docente_cedula`, `replicateAcademicPeriod`). Se recomienda estandarizar progresivamente en futuras iteraciones.

### 3. Mecanismo de Auto-Saneamiento del Esquema (Schema Self-Healing)
El backend implementa una función de inicio (`syncDatabaseSchema()`) altamente defensiva:
- **Campos de Asignaturas:** Verifica y agrega automáticamente las columnas `seccion VARCHAR(50)`, `cupos VARCHAR(50)` e `inscritos INT` a la tabla `docentes_materias`.
- **Creación Segura de Tablas:** Ejecuta sentencias `CREATE TABLE IF NOT EXISTS` para:
  - `materias_catalogo`: Poblada automáticamente con las 233 asignaturas de `src/cursos.json`.
  - `autorizaciones`: Lista de docentes pre-autorizados por jefatura.
  - `periodos_academicos`: Control de estados `ACTIVO`, `PLANIFICACION` y `CERRADO`.
  - `cargas_historicas`: Archivo histórico de kardex por período.
  - `audit_logs`: Trazabilidad institucional con IP y agente de usuario.
- **Normalización Departamental:** Estandariza de forma automática en base de datos los nombres a los 4 departamentos oficiales UPEL (*Matemática*, *Pedagogía*, *Ciencias Sociales*, *Agroindustrial*).

---

## 6. Auditoría de Seguridad y Matriz de Hallazgos

| ID | Hallazgo | Severidad | Ubicación | Impacto y Plan de Mitigación |
| :--- | :--- | :---: | :--- | :--- |
| **V-01** | **Contraseñas Maestras de Contingencia** | **ALTA** | `server/index.js` (Líneas 635-655) | Claves fijas de rescate (`admin`, `informatica`, `docente`, `123456`) existentes para soporte. **Mitigación:** Deshabilitar estas condiciones en entornos de producción pública e imponer hashing criptográfico obligatorio con `bcrypt`. |
| **V-02** | **Protección de Rutas Mutativas** | **MEDIA-ALTA** | `server/index.js` | Rutas críticas de escritura dependen del rol enviado en la sesión o payload. **Mitigación:** Activar el middleware `requireAuth` con verificación de firmas JWT para todas las peticiones `POST`, `PUT` y `DELETE`. |
| **V-03** | **Atribución de Auditoría en Cliente** | **MEDIA** | `server/index.js` | El nombre del operador en `audit_logs` proviene de `req.body.auditor`. **Mitigación:** Obtener la identidad del usuario exclusivamente a partir del token JWT validado en el servidor (`req.user`). |
| **V-04** | **Tráfico de Red sin Cifrar en Android** | **BAJA-MEDIA** | `AndroidManifest.xml` | El atributo `android:usesCleartextTraffic="true"` permite tráfico HTTP sin cifrar. **Mitigación:** Desplegar certificados SSL/TLS (HTTPS) para el dominio oficial del servidor. |
| **V-05** | **Archivos Pesados y Temporales en Git** | **BAJA** | Raíz del proyecto | Presencia de binarios (`cloudflared.exe`) y archivos temporales de Office (`~$*.xlsx`). **Mitigación:** Asegurar que `.gitignore` excluya binarios ejecutables y archivos temporales. |

---

## 7. Resultados de la Comprobación de Consultas a Base de Datos en Vivo

Se ejecutó una auditoría exhaustiva en modo de solo lectura sobre el motor MySQL activo (`upel_talento_humano` en puerto 3306):

| Endpoint Evaluado | Método | Estado | Registros Leídos | Observaciones de Rendimiento y Contenido |
| :--- | :---: | :---: | :---: | :--- |
| `/api/health` | GET | ✅ **OK** | 1 | Servidor activo, latencia de 9ms (`UPEL SIGOA Core`). |
| `/api/docentes` | GET | ✅ **OK** | **127 docentes** | **280 materias asignadas**. Verificación exitosa de `seccion`, `cupos` e `inscritos` en el 100% de los registros. |
| `/api/docentes?periodo=2026-I` | GET | ✅ **OK** | **127 docentes** | Filtro de nómina por lapso académico funcional (16ms). |
| `/api/periodos` | GET | ✅ **OK** | **2 períodos** | Períodos registrados: `2026-II` (PLANIFICACIÓN) y `2026-I` (CERRADO). |
| `/api/historico-periodos` | GET | ✅ **OK** | **1 período** | Período archivado en historial: `2026-I`. |
| `/api/docentes/:cedula/historial` | GET | ✅ **OK** | **1 registro** | Kardex docente histórico probado satisfactoriamente con `V-10157451`. |
| `/api/users` | GET | ✅ **OK** | **7 usuarios** | Cuentas institucionales con roles `ADMIN`, `JEFE` y `AUDITOR`. |
| `/api/audit` | GET | ✅ **OK** | **162 eventos** | Bitácora de seguridad cronológica leída en 7ms. |
| `/api/backup/stats` | GET | ✅ **OK** | **6 tablas** | Conteo rápido de registros en 17ms: 127 docentes, 280 materias, 233 catálogo, 7 usuarios. |
| `/api/backup` | GET | ✅ **OK** | **6 tablas** | Extracción íntegra de respaldo relacional en JSON. |
| `/api/periodos/:nombre/necesidades`| GET | ✅ **OK** | **4 dptos** | Consolidado departamental de horas y profesores por especialidad. |
| `/api/materias-catalogo` | GET | ✅ **OK** | **233 materias** | Catálogo oficial curricular ordenado alfabéticamente. |
| `/api/periodos/:nombre/huerfanas` | GET | ✅ **OK** | **125 materias** | Detección preventiva de materias sin docente asignado. |
| `/api/autorizaciones` | GET | ✅ **OK** | **0 registros** | Tabla activa disponible para autorizaciones de jefatura. |

---

## 8. Recomendaciones Técnicas y Plan de Acción

### Fase 1: Hardening de Seguridad Inmediata
1. **Activar Verificación JWT en el Servidor:** Implementar middleware estricto para validar firma y expiración en todas las operaciones que modifiquen datos.
2. **Eliminar Credenciales Maestras:** Reemplazar las comparaciones en texto plano por verificación criptográfica estándar (`bcrypt.compare`).
3. **Atribución Segura de Auditoría:** Inyectar el operador directamente desde `req.user.username` en `logAction()`.

### Fase 2: Modularización Arquitectónica del Backend
Descomponer el archivo monolítico `server/index.js` en una estructura modular por capas:
```
server/
├── config/             # Conexión a BD, variables de entorno y SMTP
│   ├── db.js
│   └── env.js
├── middlewares/        # Autenticación JWT, control de roles y rate limiters
│   ├── authMiddleware.js
│   └── rateLimiter.js
├── routes/             # Enrutadores limpios de Express
│   ├── docentesRoutes.js
│   ├── periodosRoutes.js
│   ├── authRoutes.js
│   └── backupRoutes.js
├── controllers/        # Lógica de negocio y consultas transaccionales
│   ├── docentesController.js
│   └── periodosController.js
└── index.js            # Punto de entrada conciso (ensamblador de middlewares y rutas)
```

### Fase 3: Descomposición y Reutilización en el Frontend
1. **Creación de Hook Compartido:** Diseñar `useDocentes.js` para unificar la obtención de nómina, ordenamiento y filtrado entre `StaffList.jsx` y `ConsultarDocentes.jsx`.
2. **Componente de Resiliencia:** Implementar `src/components/ErrorBoundary.jsx` con captura de excepciones (`componentDidCatch`) para prevenir pantallas en blanco ante fallos de renderizado.

### Fase 4: DevOps y Portabilidad
1. **Limpieza de Control de Versiones:** Mantener el archivo `.gitignore` optimizado para omitir ejecutables y archivos temporales.
2. **Centralización de Variables de Entorno en Cliente:** Estandarizar las conexiones de red mediante `import.meta.env.VITE_API_URL` para que el empaquetado de Android y la versión web apunten a los servidores oficiales sin depender de puertos locales hardcodeados.
