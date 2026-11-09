# Informe Ejecutivo de Gestión y Auditoría del Sistema SIGOA
## Dirección y Coordinación de Talento Humano — UPEL Rubio

**Institución:** Universidad Pedagógica Experimental Libertador (UPEL) — Instituto Pedagógico Rural Gervasio Rubio  
**Destinatarios:** Dirección de Talento Humano / Jefaturas de Departamento / Coordinación Académica  
**Sistema Evaluado:** UPEL SIGOA — Módulo de Talento Humano y Cargas Académicas  
**Fecha de Emisión:** Octubre 2026  
**Documento Base:** `analisis_tecnico_talento_humano_upel.md`  

---

## 1. Resumen Ejecutivo (¿Qué es el Sistema y qué hace por Talento Humano?)

El sistema **UPEL SIGOA (Talento Humano)** es la herramienta tecnológica central de la institución para administrar el ciclo integral del personal docente. Su función principal es transformar la gestión tradicional manual o en hojas de cálculo dispersas en un flujo automatizado, auditable y centralizado.

### Capacidades Operativas Clave para Talento Humano:
1. **Gestión Integral de la Nómina Docente:** Registro y actualización de datos personales, académicos, de contratación y bancarios de todo el personal docente activo y contratado.
2. **Planificación y Carga Académica:** Control exacto de horas asignadas, secciones, cupos e inscritos por departamento y sede (Rubio, Sabana de Mendoza y Encontrados).
3. **Expediente y Ficha Docente con Validación QR:** Emisión instantánea de fichas institucionales en PDF con sellos oficiales y código QR de verificación de autenticidad para trámites administrativos y carpetas de personal.
4. **Dispersión y Pagos Bancarios (TXT Banco de Venezuela):** Generación automática del archivo plano normativo exigido por el Banco de Venezuela (código `0102`) para el abono de nómina y honorarios sin errores de digitación manual.
5. **Reportes Institucionales y Ministeriales en Excel:** Generación en un clic de libros con 5 pestañas organizadas por sedes y necesidades docentes para entrega directa a Decanato y entes ministeriales.
6. **Operatividad Continua (Modo Sin Internet):** Capacidad de seguir trabajando en computadoras y teléfonos móviles (Android) aun cuando falle el suministro eléctrico o la conectividad a internet en el campus, sincronizándose al restablecer la red.

---

## 2. Radiografía Actual de la Planta Docente y Datos en el Sistema

A partir de la auditoría directa en la base de datos institucional en vivo, el estado operativo actual es el siguiente:

| Métrica Institucional | Valor Registrado | Significado y Utilidad para Talento Humano |
| :--- | :---: | :--- |
| **Docentes Registrados** | **127 docentes** | Padrón completo de profesores con expedientes, categorías, dedicaciones y datos bancarios. |
| **Materias Asignadas** | **280 asignaciones** | Cargas horarias activas distribuidas en los 4 departamentos con sección, cupos y alumnos. |
| **Catálogo Curricular Maestro** | **233 materias** | Inventario oficial de asignaturas curriculares cargadas para evitar nombres erróneos o duplicados. |
| **Lapsos Académicos Gestionados** | **2 períodos** | Período `2026-II` en fase de **Planificación** y período `2026-I` en estatus **Cerrado/Histórico**. |
| **Histórico de Cargas (Kardex)** | **128 registros** | Registro inmutable de lo que impartió cada docente en lapsos anteriores para constancias de trabajo y ascensos. |
| **Departamentos Validados** | **4 departamentos** | *Matemática*, *Pedagogía*, *Ciencias Sociales* y *Agroindustrial*, estandarizados sin inconsistencias. |
| **Materias Pendientes por Asignar** | **125 materias** | Alerta temprana de asignaturas ofertadas que aún requieren asignación de profesor responsable. |
| **Usuarios con Acceso** | **7 cuentas** | Personal con perfiles de acceso autorizados (`ADMIN`, `JEFE`, `AUDITOR`). |
| **Eventos de Auditoría Registrados** | **162 acciones** | Historial de quién ha creado, modificado o eliminado información en el sistema. |

---

## 3. Impacto Operativo de los Aspectos Técnicos

Para el personal de Talento Humano, los componentes de ingeniería del software representan ventajas directas en el día a día:

| Componente Técnico | Explicación Sencilla | Beneficio Directo para Talento Humano |
| :--- | :--- | :--- |
| **Vistas SQL Normalizadas (3NF)** | La base de datos separa la información personal, contratos y bancos, pero la une al instante al consultar. | Evita duplicar datos de profesores. Si un docente cambia su número de cuenta, se actualiza en todo el sistema sin rehacer contratos ni cargas. |
| **Mecanismo Anti-Stampede & Cluster** | El servidor distribuye el trabajo entre todos los núcleos del procesador y evita colapsos por peticiones simultáneas. | En períodos de alta demanda (cierre de semestre o carga masiva de notas/contrataciones), el sistema no se congela ni se "cae". |
| **Auto-Saneamiento de Base de Datos** | El sistema revisa su propia estructura al arrancar y corrige tablas faltantes o columnas sin intervención técnica. | No se detiene la oficina por fallas técnicas menores o actualizaciones de estructura; el sistema se autocorrige. |
| **Almacenamiento Local Offline** | La aplicación guarda temporalmente los cambios en el navegador o dispositivo móvil. | Los analistas pueden continuar llenando fichas o revisando cargas horarias aunque se caiga el servicio de internet en la oficina. |
| **Exportador Nativo Excel & PDF** | Procesamiento de documentos directamente en el navegador del usuario. | Las fichas con fotos, sellos y códigos QR, así como las nóminas en Excel, se descargan en segundos sin recargar el servidor. |

---

## 4. Hallazgos Críticos de Seguridad y Confidencialidad (Protección de Datos)

Talento Humano custodia los datos más sensibles de la universidad: cédulas, teléfonos, cuentas bancarias, montos de nómina y evaluaciones. La auditoría identificó los siguientes puntos de atención prioritaria:

### 1. Control Estricto de Acceso y Contraseñas
- **Situación:** Existen claves maestras de contingencia en el código fuente para soporte técnico.
- **Riesgo:** Un usuario no autorizado podría acceder a modificar cargas o visualizar cuentas bancarias.
- **Acción Inmediata:** Desactivar claves maestras fijas y exigir que cada jefatura y analista use contraseña individual encriptada.

### 2. Trazabilidad Fidedigna de Operaciones (Bitácora de Auditoría)
- **Situación:** En algunas pantallas, el nombre de quien ejecuta una acción es enviado por el navegador.
- **Riesgo:** Dificultad para deslindar responsabilidades si alguien modifica la asignación de horas de un profesor.
- **Acción Inmediata:** Que el sistema tome automáticamente la identidad verificada de la sesión para registrar en la bitácora: quién, qué día y a qué hora asignó o modificó una materia o docente.

### 3. Resguardo de Copias de Seguridad (Bóveda de Respaldos)
- **Situación:** El sistema cuenta con un módulo de descarga de respaldos completos en formato JSON y SQL.
- **Riesgo:** Si un respaldo cae en manos indebidas, se exponen datos personales y bancarios de todo el personal.
- **Acción Inmediata:** Restringir la función de respaldo únicamente al Director de Talento Humano y al Administrador de Tecnología, almacenando las copias en unidades cifradas institucionales.

---

## 5. Plan de Acción Recomendado para la Dirección de Talento Humano

Para consolidar la operatividad institucional del sistema de cara a los próximos lapsos académicos:

```
[PASO 1: SEGURIDAD] ──> [PASO 2: ASIGNACIÓN] ──> [PASO 3: NÓMINA TXT] ──> [PASO 4: RESPALDO]
  Validar usuarios        Cubrir las 125          Generar y validar       Custodiar copia
  y cerrar accesos        materias huérfanas      archivo Banco de        oficial de datos
    de contingencia          en 2026-II               Venezuela               del semestre
```

1. **Revisión de Usuarios y Roles Institucionales:**
   - Auditar las 7 cuentas activas en `/api/users` para asegurar que solo los jefes de departamento y analistas vigentes tengan permisos de edición.
2. **Atención a la Demanda Docente Pendiente (Lapso 2026-II):**
   - Utilizar el reporte de **"Materias Huérfanas"** (actualmente 125 asignaturas sin profesor) para coordinar con las jefaturas la contratación o reasignación oportuna antes del inicio de clases.
3. **Estandarización de Archivos Bancarios:**
   - Realizar una prueba piloto de carga del archivo `.txt` con el Banco de Venezuela antes de la fecha límite de pago para certificar que ningún número de cuenta presente errores de longitud o formato.
4. **Custodia Periódica de Respaldos Digitales:**
   - Establecer una rutina quincenal donde la Dirección de Talento Humano descargue un respaldo institucional de la base de datos desde la bóveda integrada y lo guarde en custodia externa.

---

## 6. Conclusión y Dictamen

El sistema **UPEL SIGOA (Talento Humano)** cuenta con una base sólida, moderna y completamente operativa que resuelve de manera integral los retos de gestión de personal, asignación de carga académica, generación de expedientes y pagos bancarios de la UPEL Rubio. 

Implementando el endurecimiento de seguridad y la asignación oportuna de las cargas pendientes en el lapso 2026-II, el departamento garantizará una administración transparente, ágil y protegida para toda la comunidad docente.
