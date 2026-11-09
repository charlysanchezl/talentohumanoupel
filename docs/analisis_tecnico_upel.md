# Análisis Técnico y Arquitectura de Software
**Proyecto:** UPEL SIGOA — Sistema Integrado de Gestión y Organización Académica (Talento Humano)  
**Institución:** Universidad Pedagógica Experimental Libertador (UPEL) — Instituto Pedagógico Rural "Gervasio Rubio"  
**Archivo:** `analisis_tecnico_upel.md`  
**Fecha:** Octubre 2026  
**Ecosistema:** Web Desktop / Responsive Móvil / Aplicación Nativa Android (Capacitor)  

---

## 1. Resumen Ejecutivo

El sistema **UPEL SIGOA (Talento Humano)** es una solución integral diseñada para la gestión, planificación horaria, control administrativo y emisión de expedientes del personal docente y directivo de la UPEL.

El proyecto implementa una **arquitectura distribuida, resiliente y de alto rendimiento**, orientada a garantizar disponibilidad continua incluso ante fluctuaciones de red o cortes de conectividad local (operación offline e hibridación P2P).

---

## 2. Pila Tecnológica (Tech Stack)

### Frontend
* **Core:** React 19 + JavaScript ES2022.
* **Empaquetador y Servidor Dev:** Vite 8 con soporte HMR ultrarrápido.
* **Enrutamiento:** React Router DOM v7 con rutas protegidas por roles institucionales (`ADMIN`, `JEFE`, `AUDITOR`, `DOCENCIA`).
* **Iconografía e Interfaz:** Lucide React, CSS3 Modular con variables temáticas institucionales UPEL y efectos *Glassmorphism*.
* **Generación Documental del Lado del Cliente:**
  * `exceljs`, `xlsx`, `xlsx-js-style` para exportaciones formateadas con bordes, colores y celdas combinadas.
  * `jspdf` y `jspdf-autotable` para expedientes y fichas docentes imprimibles oficiales con marcas de agua.
  * `qrcode` para validación criptográfica de autenticidad en documentos físicos.
* **Persistencia Offline y P2P:**
  * IndexedDB (`idbStorage.js`) para catálogos masivos mayores a 5 MB.
  * LocalStorage sincronizado para estado optimista y cola de transacciones.
  * Motor de malla P2P (`meshP2PEngine.js` / WebRTC / BroadcastChannel) para contingencias locales.

### Backend y Servidores
* **Backend Primario (Node.js):**
  * Express 4.19 estructurado en arquitectura modular por rutas (`server/routes/*`).
  * Balanceador multi-núcleo mediante **Node Cluster** (`server/cluster.js`), distribuyendo la carga de peticiones concurrentes entre los CPUs del host.
  * Pool de conexiones optimizado con `mysql2/promise` (cálculo dinámico de conexiones, keep-alive y control de concurrencia).
  * Manejo de subida de archivos pesados vía `multer` con soporte para medios de hasta 100 MB.
  * Módulo de seguridad con `bcryptjs`, limitadores de tasa (*rate limiters*) por IP y bitácora de auditoría en tiempo real.
* **Backend Espejo (PHP PDO):**
  * API secundaria en PHP (`api/index.php` y `api/db.php`) para compatibilidad directa con servidores Apache / cPanel compartidos sin Node.js.

### Base de Datos
* **Motor:** MySQL 8 / MariaDB (Esquema: `upel_talento_humano` / `talento_humano_upel`).
* **Estructura Relacional Híbrida (3NF + Vistas de Alto Rendimiento):**
  * Esquema normalizado en Tercera Forma Normal (`docentes_v3`, `docentes_contrataciones_v3`, `cargas_academicas_v3`, `departamentos_v3`, `sedes_v3`, `materias_catalogo_v3`).
  * Vistas consolidadas SQL (`docentes` y `docentes_materias`) e interceptor SQL inteligente (`sql3NFInterceptor.js`) que garantiza compatibilidad transparente.

---

## 3. Autenticación, Credenciales y Gestión de Claves Docentes

### Ubicación en Base de Datos (MySQL)
Las credenciales del personal docente residen en:
* **Base de datos:** `upel_talento_humano`
* **Tabla principal:** `docentes`
* **Columna de clave:** `clave VARCHAR(100)`
* **Identificador clave:** `cedula VARCHAR(20)` (Primary Key)

### Mecanismo de Acceso y Clave por Defecto
1. **Primer Ingreso:**
   * Al registrar un docente o importarlo desde nómina, el campo `clave` permanece inicialmente en `NULL`.
   * En tiempo de ejecución, el sistema calcula la contraseña predeterminada tomando los **últimos 4 dígitos de la cédula** (`cedula.replace(/\D/g, '').slice(-4)`).
2. **Personalización Segura:**
   * En el primer inicio de sesión, el docente debe registrar su clave personal.
   * La clave se cifra con **Bcrypt** (costo 10) y se almacena en `docentes.clave`.
3. **Restablecimiento de Contraseña:**
   * Al usar la opción de recuperación de clave, el backend ejecuta `UPDATE docentes SET clave = NULL WHERE cedula = ?`.
   * Esto reactiva el acceso por defecto mediante los últimos 4 dígitos de la cédula para que el docente pueda reconfigurarla.
4. **Usuarios Administrativos:**
   * Los administradores, auditores y jefes de departamento gestionan sus credenciales en la tabla `usuarios` (campo `password`, también hasheado con Bcrypt).

---

## 4. Módulo de Carga y Asignación de Materias (`StaffValidateModal.jsx`)

El formulario de asignación académica y validación de oferta docente (`StaffValidateModal.jsx`) fue rediseñado para optimizar la ergonomía y claridad operativa:

```
+-----------------------------------------------------------------------------------------+
| [Header] Validación y Carga Académica: [Nombre del Docente] - C.I: V-XXXXXXXX           |
+-----------------------------------------------------------------------------------------+
| [Datos Resumen]                                                                         |
|  - Personales y Fiscales (RIF, Teléfono, Correo, Dirección)                            |
|  - Datos Bancarios (Banco, Tipo de Cuenta, Número Enmascarado por Rol)                  |
|  - Perfil Académico (Pregrado, Postgrado, Categoría, Especialidad)                      |
+-----------------------------------------------------------------------------------------+
| [Vigencia Semestral]                                                                    |
|  - Período Académico (Selector de lapso con bloqueo si está en Planificación o Cerrado) |
|  - Semanas Base (15 sem) | Fecha Inicio | Fecha Fin (Control Institucional Fijo)        |
+-----------------------------------------------------------------------------------------+
| [Asignación de Materias]                                                                |
|  +-----------------------------------------------------------------------------------+  |
|  | Tarjeta Materia #1               [Secc: A] [4 h/sem]            [ Botón Eliminar ] |  |
|  +-----------------------------------------------------------------------------------+  |
|  | [Unidad Curricular / Asignatura (Select)] | [Especialidad que atiende (Select)]   |  |
|  | +-----------------------------------------+ +-----------------------------------+ |  |
|  | | Sección | Cohorte | Cupos | Inscritos   | | H. Semanales (resaltado) | H. Lapso | |  |
|  | +-----------------------------------------+ +-----------------------------------+ |  |
|  +-----------------------------------------------------------------------------------+  |
|  [ + Añadir Asignatura ]                                                                |
+-----------------------------------------------------------------------------------------+
| [Footer] Total Materias: X | Total H. Sem: Y h | Total H. Lapso: Z h | [Guardar Ficha]  |
+-----------------------------------------------------------------------------------------+
```

### Principales Características del Formulario:
* **Separación de Cabecera y Controles:** El botón de eliminación de materia se encuentra en la barra superior de cada tarjeta, eliminando cualquier solapamiento con los selectores.
* **Sub-bloques Funcionales:** División explícita entre datos de inscripción (Sección, Cohorte, Cupos, Inscritos) y la métrica de carga lectiva (Horas Semanales y Horas Lapso).
* **Bloqueo Inteligente por Calendario:** Si el lapso seleccionado está en estado `PLANIFICACION` o `CERRADO`, el botón de validación se desactiva y se alertan las directrices institucionales.

---

## 5. Módulo Multimedia: Flyer Institucional y Soporte de Reels

El componente [`InstitutionalFlyerModal.jsx`](file:///C:/Users/User/Desktop/2LIBARDOS/talento_humano_upel/src/components/InstitutionalFlyerModal.jsx) y las rutas de backend (`server/routes/config.routes.js`) integran un sistema de cartelera y anuncios institucionales:

### Capacidades Implementadas:
1. **Doble Modalidad (Imagen fija o Reel de Video):**
   * Admite imágenes en alta resolución (`.jpg`, `.png`, `.webp`).
   * Admite **Reels de Video** (`.mp4`, `.webm`, `.mov`, `.ogg`) de hasta **100 MB**.
   * Optimizado tanto para formato vertical (9:16 estilo Reel / TikTok) como horizontal (16:9).
2. **Reproducción Reactiva:**
   * En modo visualización despliega un reproductor HTML5 con `autoPlay`, `loop`, `controls` y `playsInline`.
   * Incluye distintivo dinámico en la esquina superior izquierda: `FLYER ACTIVADO` o `REEL PUBLICADO`.
3. **Panel de Gestión para Administradores:**
   * Carga de archivos mediante *drag & drop* o selector de archivos.
   * Vista previa interactiva en vivo que detecta el tipo de archivo antes de confirmar.
   * Modificación de título, subtítulo institucional, interruptor de activación general y apertura automática al iniciar sesión.
   * Persistencia en `server/flyer_config.json` con propagación en caliente a todos los clientes.

---

## 6. Seguridad y Auditoría

1. **Cifrado Fuerte:** Uso de `bcrypt` con factor de coste 10 para todas las contraseñas de docentes y usuarios del sistema.
2. **Protección contra Fuerza Bruta:** Bloqueo automático por IP y cuenta durante 5 minutos al acumular 5 intentos fallidos consecutivos en `/api/login`.
3. **Rate Limiting Granular:** Protección anti-DDoS y limitación de peticiones en endpoints sensibles (cambio de clave, recuperación, validación).
4. **Trazabilidad Institucional:** Cada operación crítica (inicio de sesión, validación de carga, alteración de datos) se registra de forma inmutable en la tabla `audit_logs` con IP, fecha, rol, usuario y descripción de la acción.
5. **Máscara de Seguridad Bancaria:** Enmascaramiento de cuentas bancarias según el nivel de privilegios del rol que consulta.

---

## 7. Conclusiones y Estado del Sistema

El sistema **UPEL SIGOA** combina solidez relacional en base de datos con una experiencia visual moderna, fluida y organizada. Las recientes adaptaciones en la organización del formulario de materias y la integración de contenido audiovisual mediante Reels consolidan una plataforma robusta, segura y alineada con las necesidades operativas de la UPEL.
