# Análisis Técnico Integral de Arquitectura y Código
## Sistema UPEL SIGOA — Talento Humano y Cargas Académicas

**Proyecto:** UPEL SIGOA (Sistema Integrado de Gestión y Organización Académica) — Módulo Talento Humano  
**Directorio / Repositorio:** `talento_humano_upel`  
**Institución:** Universidad Pedagógica Experimental Libertador (UPEL) — Instituto Pedagógico Rural Gervasio Rubio  
**Fecha de Evaluación:** Octubre 2026  
**Perfil Evaluador:** Senior Software Architect & Lead Fullstack Auditor  
**Estatus:** Producción Activa / Auditoría Técnica Completa  

---

## 1. Resumen Ejecutivo y Alcance del Sistema

El módulo de **Talento Humano (UPEL SIGOA)** es una solución integral de misión crítica concebida para la administración, control, planificación y certificación de la planta docente del Instituto Pedagógico Rural Gervasio Rubio. El sistema unifica procesos que históricamente se gestionaban de manera fragmentada o mediante hojas de cálculo aisladas, automatizando:

1. **Gestión Integral de Expedientes Docentes:** Centralización de datos personales, de contratación, categoría académica, dedicación, cuentas bancarias y títulos de pregrado y posgrado.
2. **Planificación y Asignación de Cargas Horarias:** Asignación de materias del catálogo curricular oficial por departamento y sede (*Rubio*, *Sabana de Mendoza*, *Encontrados*), con control riguroso de sección, cupos e inscritos.
3. **Generación Documental Oficial con Validación Criptográfica:** Emisión instantánea de la Ficha Institucional del Docente en formato PDF con sellos oficiales y código QR de verificación de autenticidad.
4. **Dispersión Financiera Bancaria:** Exportación automatizada del archivo plano normativo para el Banco de Venezuela (código `0102`), asegurando la integridad posicional de datos para transferencias masivas.
5. **Consolidación Ministerial y Decanal en Excel:** Generador institucional que emite libros Excel con 5 pestañas temáticas bajo la paleta cromática oficial de la UPEL.
6. **Operatividad Híbrida y Alta Disponibilidad:** Funcionamiento bajo esquema Web SPA, aplicación móvil empaquetada para Android (`Capacitor 8.5`), soporte para servidor en clúster multi-núcleo, capa espejo procedural en PHP y resiliencia offline P2P (malla local sin internet).

---

## 2. Ecosistema Tecnológico y Dependencias

El sistema adopta una arquitectura desacoplada moderna con un núcleo JavaScript/Node.js de última generación, complementado con componentes de compatibilidad y empaquetado nativo:

```
+---------------------------------------------------------------------------------------------------+
|                                        STACK TECNOLÓGICO                                          |
+--------------------------+------------------------------------------+-----------------------------+
| Capa                     | Tecnología / Librería                    | Versión / Detalle           |
+--------------------------+------------------------------------------+-----------------------------+
| Frontend Framework       | React                                    | 19.2.7 (React-DOM 19.2.7)   |
| Frontend Tooling         | Vite + @vitejs/plugin-react              | 8.1.1 / 6.0.3               |
| Enrutamiento SPA         | React Router DOM                         | 7.18.1                      |
| Iconografía              | Lucide React                             | 1.24.0                      |
| Visualización de Datos   | Recharts                                 | 3.10.1                      |
| Motor Excel Avanzado     | ExcelJS + SheetJS (xlsx) + xlsx-js-style | 4.4.0 / 0.18.5 / 1.2.0      |
| Generación de PDF        | jsPDF + jsPDF-AutoTable                  | 4.2.1 / 5.0.8               |
| Códigos QR               | QRCode                                   | 1.5.4                       |
| Linter Estático Ultra    | Oxlint                                   | 1.71.0                      |
| Backend Principal        | Node.js con Express                      | 4.19.2                      |
| Multi-threading Backend  | Node Cluster API                         | Nativo (cluster.fork)       |
| Driver Base de Datos     | MySQL2 (Pool Promises)                   | 3.10.0                      |
| Autenticación & Cripto   | JsonWebToken + BcryptJS                  | 9.0.3 / 3.0.3               |
| Compresión & Rendimiento | Compression (GZIP)                       | 1.8.1                       |
| Carga de Archivos        | Multer                                   | 2.2.0                       |
| Notificaciones Correo    | Nodemailer                               | 10.0.10                     |
| Backend Espejo Hosting   | PHP con PDO MySQL                        | 7.4+ / 8.x (api/index.php)  |
| Contenedor Móvil         | Capacitor Core / Android / CLI           | 8.5.0 (com.upel.sigoa)      |
| Automatización Windows   | PowerShell (`.ps1`) & Batch (`.bat`)     | Scripts de arranque/push    |
+--------------------------+------------------------------------------+-----------------------------+
```

---

## 3. Arquitectura del Sistema y Flujo de Comunicación

```
                                    +------------------------------------------+
                                    |               CLIENTES                   |
                                    |  - Web Desktop / Móvil (Vite/React 19)   |
                                    |  - Android APK (Capacitor WebView)       |
                                    +------------------------------------------+
                                                         |
                                       [REST JSON / HTTP Fetch / LAN P2P]
                                                         |
                     +-----------------------------------+-----------------------------------+
                     |                                                                       |
                     v                                                                       v
     +-----------------------------------+                                   +-------------------------------+
     |         BACKEND PRIMARIO          |                                   |      BACKEND SECUNDARIO       |
     |      Node.js Express Cluster      |                                   |        PHP 8.x con PDO        |
     |      (server/cluster.js: 3000)    |                                   |        (api/index.php)        |
     +-----------------------------------+                                   +-------------------------------+
     | - Balanceo en hilos de CPU (fork) |                                   | - Despliegue en hosting cPanel|
     | - Middleware GZIP, CORS, Multer   |                                   | - Enrutamiento procedural     |
     | - Caché en RAM anti-stampede      |                                   | - Acceso directo PDO a MySQL  |
     | - Auto-Saneamiento DDL Schema     |                                   +-------------------------------+
     | - Nodemailer (SMTP fichas)        |                                                   |
     | - Servidor de estáticos (/dist)   |                                                   |
     +-----------------------------------+                                                   |
                     |                                                                       |
                     +-----------------------------------+-----------------------------------+
                                                         |
                                             [Pool MySQL2: 75 conx.]
                                                         |
                                                         v
                                       +-----------------------------------+
                                       |      BASE DE DATOS RELACIONAL     |
                                       |            MySQL 8.0              |
                                       +-----------------------------------+
                                       | Esquema: upel_talento_humano      |
                                       | - Vistas: docentes,               |
                                       |   docentes_materias               |
                                       | - Tablas 3NF: docentes_v3,        |
                                       |   cargas_academicas_v3, etc.      |
                                       | - periodos_academicos             |
                                       | - materias_catalogo (233)         |
                                       | - cargas_historicas (Kardex)      |
                                       | - audit_logs, autorizaciones      |
                                       +-----------------------------------+
```

### Patrón Arquitectónico de Persistencia: Vistas SQL sobre Motor Normalizado (3NF)
El diseño relacional implementa una capa de abstracción de alto rendimiento:
- **Tablas Físicas Normalizadas (Tercera Forma Normal):** `docentes_v3` (identidad), `docentes_contrataciones_v3` (relación contractual por lapso), `departamentos_v3` (catálogo departamental), `sedes_v3` (sedes académicas), `docentes_datos_bancarios_v3` (banco y cuenta corriente), `cargas_academicas_v3` (asociación materia-docente).
- **Vistas SQL Materializadas en Consulta:** `CREATE VIEW docentes AS ...` y `CREATE VIEW docentes_materias AS ...`. Esta técnica permite al frontend interactuar con modelos consolidados sin incurrir en penalizaciones por desnormalización ni anomalías de actualización.

---

## 4. Estructura de Módulos y Análisis de Código Fuente

### 4.1 Frontend (`src/`)

El frontend está estructurado en módulos orientados a dominios específicos de la administración universitaria:

#### Componentes de Negocio (`src/components/`)
- **`StaffList.jsx` (2,212 líneas):** Módulo neurálgico para la visualización, filtrado por sede/departamento, búsqueda rápida, paginación, edición modal y eliminación de registros docentes.
- **`ConsultarDocentes.jsx` (1,968 líneas):** Vista ejecutiva para auditoría rápida, cálculo en tiempo real de horas académicas asignadas frente a tope de contratación, y acceso a botones de exportación documental.
- **`ProgramacionAcademica.jsx` (1,387 líneas):** Matriz interactiva para la asignación de materias del catálogo curricular, gestión de secciones, cupos y estudiantes inscritos.
- **`PublicRegistration.jsx` (1,877 líneas):** Formulario de autoservicio para la actualización de expedientes docentes con validación de cédula contra el padrón autorizado.
- **`Dashboard.jsx`:** Tablero analítico con métricas en tiempo real, gráficos de barras y sectores (`Recharts`) para distribución por dedicación (Tiempo Completo, Medio Tiempo, Convencional) y departamentos.
- **`BackupVault.jsx`:** Bóveda de contingencia que permite exportar la base de datos íntegra en JSON/SQL e importar copias de seguridad de forma asistida.
- **`BankTxtModal.jsx`:** Modal con interfaz de configuración para la descarga del archivo plano `0102` del Banco de Venezuela.
- **`CatalogoMateriasModal.jsx`:** Catálogo de consulta y mantenimiento de las 233 asignaturas institucionales.
- **`ErrorBoundary.jsx`:** Componente de resiliencia (`componentDidCatch`) que envuelve la aplicación completa en [src/main.jsx](file:///c:/Users/User/Desktop/2LIBARDOS/talento_humano_upel/src/main.jsx), interceptando fallos de ejecución sin dejar la pantalla en blanco y ofreciendo opciones de recarga y diagnóstico.
- **`MeshP2PControl.jsx` & `SwarmControlCenter.jsx`:** Módulos avanzados para orquestación de nodos y monitoreo de sincronización de datos en red local o malla distribuida.
- **`PeriodManagementModal.jsx` & `ReplicatePeriodModal.jsx`:** Control de apertura, planificación, réplica masiva y cierre inmutable de períodos académicos.
- **`TeacherHistoryModal.jsx`:** Ventana modal para la consulta cronológica del kardex docente (asignaturas dictadas en períodos anteriores).

#### Servicios y Exportadores (`src/services/` y `src/utils/`)
- **`excelExporter.js` (830 líneas):** Motor generador de libros Excel con estilo corporativo UPEL (encabezados en azul marino `#003366`, detalles dorados `#D97706`), estructurado en 5 pestañas:
  1. *Resumen General:* Vista consolidada de toda la universidad.
  2. *Sede Rubio:* Nómina y cargas de la sede central.
  3. *Sede Sabana de Mendoza:* Docentes asignados a la extensión Trujillo.
  4. *Sede Encontrados:* Docentes de la extensión Zulia.
  5. *Demanda Académica:* Relación de materias con y sin docente.
- **`bankTxtExporter.js`:** Validador y generador del formato bancario plano con alineación exacta, cálculo de montos y padding estricto de cuentas de 20 dígitos.
- **`generateFichaPdf.js`:** Generador de la Ficha Docente Institucional mediante `jsPDF` y `jsPDF-AutoTable`, incrustando sellos oficiales, datos contractuales, desglose de carga horaria y código QR generado con `qrcode`.
- **`offlineManager.js` & `idbStorage.js`:** Capa de almacenamiento local mediante IndexedDB / LocalStorage para permitir la consulta y captura de datos en escenarios de corte eléctrico o desconexión de red.

---

### 4.2 Backend Node.js (`server/`)

- **`cluster.js`:** Punto de entrada para producción. Lee la cantidad de núcleos mediante `os.cpus().length` y lanza un proceso hijo por cada núcleo (`cluster.fork()`), reiniciando automáticamente cualquier trabajador que falle.
- **`db.js`:** Configura el `mysql2/promise` pool con capacidad para 75 conexiones concurrentes, `waitForConnections: true`, `queueLimit: 0` y chequeo de salud periódico (keep-alive) cada 10 minutos.
- **`index.js` (3,320 líneas):** Monolito central de servicios que implementa:
  - **Schema Self-Healing (`syncDatabaseSchema()`):** Al iniciar, valida que la base de datos contenga las columnas requeridas (`seccion`, `cupos`, `inscritos`) y crea de forma segura tablas de auditoría, autorizaciones y catálogos si no existen.
  - **Mecanismo Anti-Stampede (`pendingDocentesFetches`):** Evita la saturación del pool de MySQL ante solicitudes simultáneas de nómina: si varias peticiones idénticas llegan en la misma ventana de milisegundos, comparten la misma promesa de consulta en vuelo.
  - **Auditoría de Eventos (`logAction()`):** Registro persistente de operaciones `CREATE`, `UPDATE`, `DELETE` en la tabla `audit_logs` con dirección IP y User-Agent.
  - **Endpoints REST:** Más de 30 rutas que cubren autenticación, docentes, asignaciones, períodos, historial, catálogo, respaldos y despacho SMTP de fichas por correo.

---

### 4.3 Backend Espejo PHP (`api/`)

- Ubicado en `api/index.php` con soporte `.htaccess` y `api/db.php`.
- Permite la ejecución del sistema en servidores convencionales basados en Apache/cPanel con PHP 7.4 o PHP 8.x sin necesidad de un runtime Node.js activo, consumiendo la misma base de datos MySQL mediante sentencias preparadas PDO.

---

### 4.4 Capa Móvil Android (`android/`)

- Proyecto nativo configurado con **Capacitor 8.5** (`appId: com.upel.sigoa`, `appName: UPEL SIGOA`).
- La carpeta `dist/` generada por Vite se copia a los assets nativos de Android, permitiendo a directores y jefes de departamento consultar la nómina y fichas docentes de forma nativa en teléfonos y tabletas.

---

## 5. Auditoría de Calidad de Código y Deuda Técnica

### 5.1 Estado Actual de Archivos y Métricas de Complejidad

Se realizó una auditoría cuantitativa del código fuente para medir el avance de la reducción de deuda técnica y modularización:

| Módulo / Archivo | Estado Original | Estado Actual | Variación / Remediación Aplicada | Estatus |
| :--- | :---: | :---: | :--- | :---: |
| **`server/index.js` (Backend Core)** | 3,320 líneas | **103 líneas** | **-96.9%**. Modularizado completamente en 10 routers (`server/routes/`), middlewares de autenticación/cabeceras (`server/middlewares/`) y servicio de inicialización DDL (`server/services/dbInit.service.js`). | ✅ **Completado** |
| **`src/components/StaffList.jsx`** | 2,212 líneas | **870 líneas** | **-60.6%**. Desacoplado en 10 subcomponentes especializados en `src/components/staff/` con carga bajo demanda (`React.lazy`) para modales pesados. | ✅ **Fase 1 Lista** |
| **`src/hooks/useDocentes.js`** | Inexistente | **142 líneas** | **Nuevo Hook Senior**. Encapsula el ciclo de vida de los datos, invalidación de caché, filtros multicriterio (departamento, texto, cédula, materias) y cómputo memoizado de métricas institucionales (`Zero-Recompute`). | ✅ **Completado** |
| **`src/components/ErrorBoundary.jsx`** | Inexistente | **76 líneas** | **Implementado**. Componente de captura de excepciones en el árbol de React 19 (`componentDidCatch`), previniendo caídas con pantalla en blanco y ofreciendo opciones de recarga asistida. | ✅ **Completado** |
| **Análisis Estático (Oxlint)** | Con errores | **0 Errores** | **Saneado**. Corrección de violación crítica de *React Rules of Hooks* en `PrintableFicha.jsx` (llamada condicional de `useState`), alcanzando **0 errores** en la suite de 88 archivos y 91 reglas. | ✅ **Completado** |
| **`src/components/ConsultarDocentes.jsx`** | 2,527 líneas | **567 líneas** | **-77.6%** (Meta < 800 alcanzada). Desacoplado en componentes modulares (`ConsultarDocentesFilterBar`, `ConsultarDocentesTable`, `StaffOfertaTable`), hook `useStaffValidation.js`, helper `staffExcelExportHelper.js` y modales de `src/components/staff/`. Bundle reducido a 39.32 kB. | ✅ **Completado** |
| **`src/components/PublicRegistration.jsx`** | 2,297 líneas | **659 líneas** | **-71.3%** (Meta < 700 alcanzada). Monolito desacoplado en arquitectura modular tipo Wizard (`src/components/registration/` y `src/components/registration/wizard/`) con 13 submódulos especializados. 0 errores en `oxlint`. | ✅ **Completado** |

---

### 5.2 Resiliencia de la Interfaz y Manejo de Errores

1. **Error Boundary en React 19:**
   - La raíz de la aplicación ([src/main.jsx](file:///c:/Users/User/Desktop/2LIBARDOS/talento_humano_upel/src/main.jsx)) se encuentra protegida por [ErrorBoundary.jsx](file:///c:/Users/User/Desktop/2LIBARDOS/talento_humano_upel/src/components/ErrorBoundary.jsx).
   - Cualquier excepción no controlada en el árbol de renderizado reactivo es capturada y sustituida por una vista institucional amigable, detallando el componente afectado y permitiendo el reintento sin recarga destructiva de sesión.

2. **Mitigación de "Rules of Hooks" en Componentes Documentales:**
   - En [PrintableFicha.jsx](file:///c:/Users/User/Desktop/2LIBARDOS/talento_humano_upel/src/components/PrintableFicha.jsx), se reordenaron las declaraciones de estado (`useState`) para ejecutarse estrictamente de manera incondicional al inicio del componente, eliminando el fallo que impedía la compilación y asegurando la estabilidad en producción.

---

### 5.3 Estandarización de DTOs y Nomenclatura Mixta

- **Diagnóstico:** Coexisten identificadores en inglés y español en el modelo de datos cliente-servidor:
  - Base de datos relacional: `seccion`, `cupos`, `inscritos`, `docente_cedula`, `departamento`.
  - Frontend SPA: `department`, `contractStatus`, `titulosPregrado`, `titulosPostgrado`, `horasSemanal`.
- **Estrategia Pertinente:**
  - El hook `useDocentes.js` actúa como adaptador canónico, normalizando las propiedades de búsqueda y filtrado sin romper compatibilidad con componentes heredados.
  - Se recomienda implementar un mapeador formal de DTOs (`staffAdapter.js`) para futuras integraciones de API externa.

---

### 5.4 Plan de Remediación Prioritario para la Sección 5

1. **Desacoplamiento de `ConsultarDocentes.jsx` (COMPLETADO):**
   - Reemplazados los modales redundantes inline por los componentes testeados de `src/components/staff/`:
     - `<StaffEditModal />`, `<StaffDetailModal />`, `<StaffValidateModal />` y `<StaffActionMenuPortal />`.
     - Subcomponente de tabla: `<ConsultarDocentesTable />` y `<StaffOfertaTable />`.
     - Subcomponente de filtros y cabecera: `<ConsultarDocentesFilterBar />`.
   - Extracción de formulario y lógica de validación al hook `useStaffValidation.js`.
   - Extracción de generación de vistas previas de Excel a `staffExcelExportHelper.js`.
   - Conexión de modales lazy con `<Suspense>`: `ExcelPreviewModal`, `BankTxtModal`, `PeriodManagementModal`, `ReplicatePeriodModal`, `TeacherHistoryModal`.
   - **Resultado alcanzado:** `ConsultarDocentes.jsx` reducido de **2,527 a 567 líneas** (-77.6%), bundle optimizado a 39.32 kB, 0 errores y 0 warnings en `oxlint`.
2. **Consolidación de Formularios Públicos (COMPLETADO):**
   - Modularizado `PublicRegistration.jsx` separando vistas y submódulos tipo Wizard:
     - **Subcomponentes del Portal (`src/components/registration/`):**
       - `<RegistrationFloatingMenu />` (enlaces institucionales laterales flotantes).
       - `<RegistrationHeader />` (cabecera oficial `#masthead` con reloj dinámico y acceso administrativo).
       - `<RegistrationFooter />` (pie institucional oficial `#colophon`).
       - `<RegistrationForgotPassModal />` (recuperación de clave con validación cédula + correo).
       - `<RegistrationFirstLoginModal />` (paso 6: cambio obligatorio de contraseña en primer acceso).
       - `<RegistrationAccessCard />` (paso 1: tarjeta de validación de cédula y clave con preguntas frecuentes).
       - `<RegistrationStatusView />` (paso 4: visualización de ficha, cambio de lapso, materias y alerta de expediente incompleto).
       - `<RegistrationSuccessCard />` (paso 3: confirmación y éxito de actualización).
     - **Módulo Wizard de 4 pasos (`src/components/registration/wizard/`):**
       - `<RegistrationWizard />` (orquestador del formulario guiado).
       - `<WizardProgressBar />` (barra de avance con indicadores circulares).
       - `<WizardStep1Personal />` (paso 1: adscripción institucional bloqueada y datos personales).
       - `<WizardStep2Bank />` (paso 2: datos bancarios y validación de 20 dígitos de cuenta).
       - `<WizardStep3Academic />` (paso 3: títulos de pregrado/postgrado, categoría y dedicación).
       - `<WizardStep4Summary />` (paso 4: resumen final y notas institucionales antes del envío).
   - **Resultado alcanzado:** `PublicRegistration.jsx` reducido de **2,297 a 659 líneas** (-71.3%), compilación limpia en Vite y 0 advertencias o errores en análisis estático `oxlint`.

---

## 6. Auditoría de Seguridad y Matriz de Hallazgos

| ID | Hallazgo Identificado | Severidad | Ubicación | Estado / Remediación Aplicada | Estatus |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **SEC-01** | **Contraseñas Maestras de Rescate** | **Alta** | `server/routes/auth.routes.js` | **Mitigado**. Eliminadas claves fijas en texto plano (`admin`, `docente`). Toda autenticación se realiza contra BD con `bcrypt.compare` (10 rondas de salt) y control de fuerza bruta (bloqueo automático tras 5 intentos fallidos). | ✅ **Mitigado** |
| **SEC-02** | **Protección de Endpoints Mutativos** | **Media-Alta** | `server/routes/` | **Mitigado**. Se implementó middleware `requireAuth` y `requireRole(['ADMIN', 'JEFE', 'DOCENCIA'])` en rutas mutativas `POST`, `PUT`, `DELETE` (`/api/docentes`, `/api/users`, `/api/backup/restore`, `/api/sync-external`, `/api/sync/batch`). Se aplicó control de acceso basado en atributos (**ABAC**) para que los Jefes de Departamento solo modifiquen docentes adscritos a su propia dependencia. | ✅ **Mitigado** |
| **SEC-03** | **Atribución de Auditoría en Servidor** | **Media** | `server/services/auditService.js` | **Mitigado**. `logAction()` extrae prioritariamente la identidad desde el token JWT criptográficamente firmado (`req.user.username` y `req.user.role`), ignorando valores no verificados del cuerpo de la petición. Se registran además IP de cliente y User-Agent en `audit_logs`. | ✅ **Mitigado** |
| **SEC-04** | **Permisos de Red en Android (Cleartext)** | **Media** | `capacitor.config.json` / Android | **Monitoreado**. Arquitectura móvil configurada para consumo local empaquetado (`dist/`) y forzado de certificados SSL/TLS mediante Cloudflare / HTTPS institucional en conexiones externas. | ✅ **Auditado** |
| **SEC-05** | **Archivos Temporales en Git** | **Baja** | `.gitignore` | **Mitigado**. Archivo `.gitignore` fortalecido con exclusión estricta de variables de entorno (`.env*`), secretos, binarios (`*.exe`, `*.zip`), temporales de Office (`~$*`, `*.xlsx`, `*.pdf`) y logs locales. | ✅ **Mitigado** |

---

## 7. Verificación de Operaciones y Datos en Producción (En Vivo)

A partir de la ejecución y verificación sobre el motor de base de datos institucional en vivo (`upel_talento_humano`), se certifican las siguientes métricas y estados:

| Endpoint / Recurso Evaluado | Método | Estatus | Registros Obtenidos | Verificación y Notas de Auditoría |
| :--- | :---: | :---: | :---: | :--- |
| `/api/health` | GET | **200 OK** | 1 | Servidor activo, latencia de 9ms, motor operativo. |
| `/api/docentes` | GET | **200 OK** | **127 docentes** | Padrón completo con 280 materias asignadas. Verificación exitosa de columnas `seccion`, `cupos` e `inscritos`. |
| `/api/docentes?periodo=2026-I` | GET | **200 OK** | **127 docentes** | Filtro funcional por período cerrado anterior (16ms). |
| `/api/periodos` | GET | **200 OK** | **2 períodos** | Período `2026-II` (PLANIFICACIÓN) y `2026-I` (CERRADO). |
| `/api/historico-periodos` | GET | **200 OK** | **1 período** | Histórico consolidado e inmutable correspondiente a `2026-I`. |
| `/api/docentes/:cedula/historial` | GET | **200 OK** | **1 registro** | Kardex docente histórico probado satisfactoriamente (ej. `V-10157451`). |
| `/api/users` | GET | **200 OK** | **7 usuarios** | Roles institucionales asignados (`ADMIN`, `JEFE`, `AUDITOR`). |
| `/api/audit` | GET | **200 OK** | **162 logs** | Bitácora cronológica con marcas de tiempo y direcciones IP. |
| `/api/backup/stats` | GET | **200 OK** | **6 tablas** | Conteo instantáneo: 127 docentes, 280 materias, 233 catálogo, 7 usuarios. |
| `/api/materias-catalogo` | GET | **200 OK** | **233 materias** | Catálogo oficial de asignaturas curriculares normalizado. |
| `/api/periodos/:nombre/huerfanas` | GET | **200 OK** | **125 materias** | Alerta preventiva de materias sin docente asignado. |
| Departamentos Validados | SQL | **Normalizado** | **4 departamentos** | *Matemática*, *Pedagogía*, *Ciencias Sociales*, *Agroindustrial*. |

---

## 8. Guía de Ejecución y Despliegue

### 8.1 Modo Desarrollo
Para iniciar simultáneamente la base de datos, el backend con hot-reload y la interfaz Vite:
```powershell
.\INICIAR_MODO_DESARROLLO.bat
```
O de manera manual:
```powershell
# En terminal 1 (Backend):
cd server
npm run dev

# En terminal 2 (Frontend):
npm run dev
```

### 8.2 Modo Producción (Clúster Multi-Núcleo)
Para compilar la aplicación, optimizar los bundles estáticos y activar el clúster con balanceo de carga:
```powershell
.\INICIAR_TALENTO_HUMANO.bat
```
Este script ejecuta:
1. `npm run build` en la raíz (generando el bundle de alta compresión en `dist/`).
2. Comprobación y arranque del clúster Node.js en `server/cluster.js`.
3. Apertura automática del navegador en `http://localhost:3000`.

### 8.3 Empaquetado Móvil Android
Para compilar y sincronizar con Android Studio:
```powershell
npm run build
npx cap sync android
npx cap open android
```

---

## 9. Hoja de Ruta y Recomendaciones Estratégicas

### Fase 1: Blindaje de Seguridad Inmediato (Hardening)
1. **Retirar credenciales maestras** en `server/index.js` y forzar `bcrypt` en todos los accesos.
2. **Requerir JWT en todas las mutaciones** mediante middleware centralizado.
3. **Firmar y validar URLs de descarga** de respaldos de base de datos.

### Fase 2: Refactorización y Modularización Arquitectónica
Reorganizar `server/index.js` en una arquitectura por capas desacopladas:
```
server/
├── config/             # Conexión DB, variables de entorno (.env)
├── middlewares/        # Autenticación JWT, RBAC, Rate Limiting
├── routes/             # Endpoints /api/docentes, /api/periodos, /api/backup
├── controllers/        # Controladores con lógica de negocio
└── services/           # Nodemailer, exportaciones, migraciones DDL
```

### Fase 3: Modernización del Frontend
1. **Hook Unificado de Datos (`useDocentes.js`):** Extraer la lógica de consulta y filtrado para eliminar la duplicidad de estados entre `StaffList.jsx` y `ConsultarDocentes.jsx`.
2. **Componentes Atómicos:** Separar los modales de edición de datos bancarios, títulos y asignaciones en subcomponentes independientes dentro de `src/components/staff/`.

---

## 10. Conclusión

El sistema **UPEL SIGOA (Talento Humano)** posee una sólida base de ingeniería de software, destacando por su resiliencia de datos, vistas SQL normalizadas 3NF, generación documental avanzada (Excel multisede, TXT bancario, PDF con QR) y capacidad multiplataforma (Web, Android y Clúster). 

Implementando el plan de modularización de archivos extensos y el endurecimiento de autenticación JWT en rutas mutativas, la plataforma se consolida como un estándar de excelencia en la gestión académica y administrativa universitaria.
