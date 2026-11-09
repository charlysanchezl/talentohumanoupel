CREATE DATABASE IF NOT EXISTS upel_talento_humano CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE upel_talento_humano;

-- =========================================================================
-- 1. CATÁLOGOS MAESTROS INSTITUCIONALES (3FN)
-- =========================================================================

CREATE TABLE IF NOT EXISTS departamentos_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  codigo VARCHAR(20) DEFAULT NULL UNIQUE,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO departamentos_v3 (id, nombre, codigo, activo) VALUES
  (1, 'Matemática', 'MAT', 1),
  (2, 'Ciencias Sociales', 'SOC', 1),
  (3, 'Agroindustrial', 'AGRO', 1),
  (4, 'Pedagogía', 'PED', 1);

CREATE TABLE IF NOT EXISTS sedes_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO sedes_v3 (id, nombre, activo) VALUES
  (1, 'Rubio', 1),
  (2, 'Encontrados', 1),
  (3, 'Sabana de Mendoza', 1);

CREATE TABLE IF NOT EXISTS especialidades_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bancos_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_sudeban CHAR(4) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO bancos_v3 (id, codigo_sudeban, nombre, activo) VALUES
  (1, '0102', 'Banco de Venezuela', 1),
  (2, '0175', 'Banco Digital de los Trabajadores', 1);

CREATE TABLE IF NOT EXISTS periodos_academicos_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  estado ENUM('ACTIVO', 'PLANIFICACION', 'CERRADO') NOT NULL DEFAULT 'PLANIFICACION',
  semanas TINYINT UNSIGNED NOT NULL DEFAULT 15,
  fecha_inicio DATE DEFAULT NULL,
  fecha_fin DATE DEFAULT NULL,
  observaciones VARCHAR(255) DEFAULT '',
  creado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_periodo_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materias_catalogo_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE,
  departamento_id INT UNSIGNED DEFAULT NULL,
  horas_semanales_referencial TINYINT UNSIGNED NOT NULL DEFAULT 4,
  INDEX idx_materia_nombre (nombre),
  CONSTRAINT fk_materia_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 2. ENTIDADES NORMALIZADAS DEL DOCENTE (1FN, 2FN, 3FN PURO)
-- =========================================================================

CREATE TABLE IF NOT EXISTS docentes_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL DEFAULT '',
  apellidos VARCHAR(100) NOT NULL DEFAULT '',
  fecha_nacimiento DATE DEFAULT NULL,
  rif VARCHAR(20) DEFAULT NULL,
  correo_personal VARCHAR(150) DEFAULT NULL,
  correo_institucional VARCHAR(150) DEFAULT NULL,
  telefonos VARCHAR(50) DEFAULT NULL,
  direccion VARCHAR(255) DEFAULT NULL,
  clave_portal_hash VARCHAR(255) DEFAULT NULL,
  creado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_docentes_apellidos_nombres (apellidos, nombres),
  INDEX idx_docentes_correo (correo_personal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS docentes_formacion_academica_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  docente_id INT UNSIGNED DEFAULT NULL UNIQUE,
  docente_cedula VARCHAR(20) NOT NULL UNIQUE,
  especialidad_id INT UNSIGNED DEFAULT NULL,
  titulos_pregrado VARCHAR(255) DEFAULT NULL,
  titulos_postgrado VARCHAR(255) DEFAULT NULL,
  doctorado VARCHAR(255) DEFAULT NULL,
  categoria_docente ENUM('Instructor','Asistente','Agregado','Asociado','Titular') NOT NULL DEFAULT 'Instructor',
  dedicacion ENUM('Tiempo Convencional','Medio Tiempo','Tiempo Completo','Dedicación Exclusiva') NOT NULL DEFAULT 'Tiempo Convencional',
  actualizado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_formacion_especialidad (especialidad_id),
  CONSTRAINT fk_formacion_docente_id FOREIGN KEY (docente_id) REFERENCES docentes_v3(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_formacion_docente FOREIGN KEY (docente_cedula) REFERENCES docentes_v3(cedula) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_formacion_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS docentes_datos_bancarios_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  docente_id INT UNSIGNED DEFAULT NULL,
  docente_cedula VARCHAR(20) NOT NULL,
  banco_id INT UNSIGNED DEFAULT 1,
  cuenta_bancaria VARCHAR(50) NOT NULL,
  tipo_cuenta ENUM('Ahorro','Corriente') NOT NULL DEFAULT 'Corriente',
  es_principal TINYINT(1) NOT NULL DEFAULT 1,
  UNIQUE KEY uq_docente_cuenta (docente_cedula, cuenta_bancaria),
  INDEX idx_bancos_docente_id (docente_id),
  INDEX idx_banco_cedula (docente_cedula),
  INDEX idx_banco_principal (docente_cedula, es_principal),
  CONSTRAINT fk_bancos_docente_id FOREIGN KEY (docente_id) REFERENCES docentes_v3(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bancos_docente FOREIGN KEY (docente_cedula) REFERENCES docentes_v3(cedula) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_datos_bancarios_banco FOREIGN KEY (banco_id) REFERENCES bancos_v3(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS docentes_contrataciones_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  docente_id INT UNSIGNED DEFAULT NULL,
  docente_cedula VARCHAR(20) NOT NULL,
  periodo_id INT UNSIGNED NOT NULL,
  departamento_id INT UNSIGNED NOT NULL,
  sede_id INT UNSIGNED NOT NULL,
  especialidad_id INT UNSIGNED DEFAULT NULL,
  status ENUM('Activo','Validado','Por Revisar','Inactivo','Jubilado') NOT NULL DEFAULT 'Por Revisar',
  semanas TINYINT UNSIGNED NOT NULL DEFAULT 15,
  fecha_desde DATE DEFAULT NULL,
  fecha_hasta DATE DEFAULT NULL,
  observaciones TEXT DEFAULT NULL,
  creado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_el DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_docente_periodo_depto (docente_cedula, periodo_id, departamento_id),
  INDEX idx_contrataciones_docente_id (docente_id),
  INDEX idx_contratacion_busqueda (periodo_id, departamento_id, status),
  INDEX idx_contratacion_cedula_id (docente_cedula, id),
  CONSTRAINT fk_contratacion_docente_id FOREIGN KEY (docente_id) REFERENCES docentes_v3(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_contratacion_docente FOREIGN KEY (docente_cedula) REFERENCES docentes_v3(cedula) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_contratacion_periodo FOREIGN KEY (periodo_id) REFERENCES periodos_academicos_v3(id) ON UPDATE CASCADE,
  CONSTRAINT fk_contratacion_departamento FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON UPDATE CASCADE,
  CONSTRAINT fk_contratacion_sede FOREIGN KEY (sede_id) REFERENCES sedes_v3(id) ON UPDATE CASCADE,
  CONSTRAINT fk_contratacion_especialidad FOREIGN KEY (especialidad_id) REFERENCES especialidades_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cargas_academicas_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  contratacion_id INT UNSIGNED NOT NULL,
  materia_id INT UNSIGNED NOT NULL,
  horas_semanal TINYINT UNSIGNED NOT NULL DEFAULT 0,
  horas_lapso SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  especialidad_destino_id INT UNSIGNED DEFAULT NULL,
  seccion VARCHAR(20) DEFAULT 'U',
  cupos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  inscritos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  cohorte VARCHAR(50) DEFAULT NULL,
  INDEX idx_carga_contratacion (contratacion_id),
  INDEX idx_carga_materia (materia_id),
  INDEX idx_carga_seccion (seccion),
  CONSTRAINT fk_carga_contratacion FOREIGN KEY (contratacion_id) REFERENCES docentes_contrataciones_v3(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_carga_materia FOREIGN KEY (materia_id) REFERENCES materias_catalogo_v3(id) ON UPDATE CASCADE,
  CONSTRAINT fk_carga_especialidad_v3 FOREIGN KEY (especialidad_destino_id) REFERENCES especialidades_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 3. CONTROL, SEGURIDAD Y KARDEX HISTÓRICO
-- =========================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('ADMIN', 'JEFE', 'AUDITOR', 'DOCENCIA') NOT NULL,
  department VARCHAR(100) NOT NULL,
  departamento_id INT UNSIGNED DEFAULT NULL,
  correo VARCHAR(150),
  INDEX idx_usuarios_correo (correo),
  INDEX idx_usuarios_role (role),
  CONSTRAINT fk_usuarios_depto_v3 FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS autorizaciones (
  cedula VARCHAR(20) PRIMARY KEY,
  department VARCHAR(100) NOT NULL,
  departamento_id INT UNSIGNED DEFAULT NULL,
  nombresApellidos VARCHAR(150),
  CONSTRAINT fk_autorizaciones_depto_v3 FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS materias_catalogo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS periodos_academicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  estado ENUM('ACTIVO', 'PLANIFICACION', 'CERRADO') NOT NULL DEFAULT 'PLANIFICACION',
  semanas INT DEFAULT 15,
  fechaDesde VARCHAR(20) DEFAULT '',
  fechaHasta VARCHAR(20) DEFAULT '',
  observaciones VARCHAR(255) DEFAULT '',
  fechaCreacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fechaActivacion DATETIME NULL,
  fechaCierre DATETIME NULL,
  INDEX idx_periodo_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cargas_historicas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  docente_id INT UNSIGNED DEFAULT NULL,
  cedula_docente VARCHAR(20) NOT NULL,
  periodoAcademico VARCHAR(50) NOT NULL,
  periodo_id INT UNSIGNED DEFAULT NULL,
  department VARCHAR(100) NOT NULL,
  departamento_id INT UNSIGNED DEFAULT NULL,
  status VARCHAR(30) DEFAULT 'Por Revisar',
  semanas INT DEFAULT 15,
  fechaDesde VARCHAR(20),
  fechaHasta VARCHAR(20),
  materias TEXT,
  totalHorasSemanal INT DEFAULT 0,
  totalHorasLapso INT DEFAULT 0,
  fechaRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_hist_docente_id (docente_id),
  INDEX idx_hist_periodo (periodoAcademico),
  INDEX idx_hist_cedula_search (cedula_docente),
  UNIQUE KEY uk_docente_periodo (cedula_docente, periodoAcademico),
  CONSTRAINT fk_hist_docente_id FOREIGN KEY (docente_id) REFERENCES docentes_v3(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_hist_periodo_v3 FOREIGN KEY (periodo_id) REFERENCES periodos_academicos_v3(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_hist_depto_v3 FOREIGN KEY (departamento_id) REFERENCES departamentos_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cargas_historicas_materias_v3 (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  carga_historica_id INT NOT NULL,
  materia_id INT UNSIGNED DEFAULT NULL,
  especialidad_destino_id INT UNSIGNED DEFAULT NULL,
  horas_semanal TINYINT UNSIGNED NOT NULL DEFAULT 0,
  horas_lapso SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  seccion VARCHAR(20) DEFAULT '',
  cupos SMALLINT UNSIGNED DEFAULT 0,
  inscritos SMALLINT UNSIGNED DEFAULT 0,
  cohorte VARCHAR(50) DEFAULT NULL,
  INDEX idx_hist_materia_id (carga_historica_id),
  INDEX idx_hist_mat_cat (materia_id),
  INDEX idx_hist_esp_dest (especialidad_destino_id),
  CONSTRAINT fk_hist_materias_rel FOREIGN KEY (carga_historica_id) REFERENCES cargas_historicas(id) ON DELETE CASCADE,
  CONSTRAINT fk_hist_mat_catalogo FOREIGN KEY (materia_id) REFERENCES materias_catalogo_v3(id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_hist_esp_catalogo FOREIGN KEY (especialidad_destino_id) REFERENCES especialidades_v3(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(100),
  user_role VARCHAR(50),
  action VARCHAR(255),
  details TEXT,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(255) DEFAULT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_timestamp (timestamp),
  INDEX idx_audit_logs_action (action),
  INDEX idx_audit_user (user_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 4. VISTAS CQRS DE COMPATIBILIDAD Y LECTURA RÁPIDA (docentes y docentes_materias)
-- =========================================================================

CREATE OR REPLACE VIEW docentes AS
SELECT 
  d.id AS id,
  d.cedula AS cedula,
  d.nombres AS nombres,
  d.apellidos AS apellidos,
  IFNULL(dep.nombre, 'Matemática') AS department,
  IFNULL(c.status, 'Por Revisar') AS status,
  IFNULL(DATE_FORMAT(d.fecha_nacimiento, '%Y-%m-%d'), '') AS fechaNac,
  IFNULL(d.rif, '') AS rif,
  IFNULL(d.correo_personal, '') AS correo,
  IFNULL(d.correo_institucional, '') AS correoInstitucional,
  IFNULL(d.direccion, '') AS direccion,
  IFNULL(d.telefonos, '') AS telefonos,
  IFNULL(bcat.nombre, '') AS banco,
  IFNULL(b.cuenta_bancaria, '') AS cuentaBancaria,
  IFNULL(b.tipo_cuenta, 'Ahorro') AS tipoCuenta,
  IFNULL(fa.titulos_pregrado, '') AS titulosPregrado,
  IFNULL(fa.titulos_postgrado, '') AS titulosPostgrado,
  IFNULL(fa.doctorado, '') AS doctorado,
  IFNULL(fa.categoria_docente, 'Instructor') AS categoriaDocente,
  IFNULL(fa.dedicacion, 'Tiempo Convencional') AS dedicacion,
  IFNULL(p.nombre, '2026-II') AS periodoAcademico,
  IFNULL(c.semanas, IFNULL(p.semanas, 15)) AS semanas,
  IFNULL(DATE_FORMAT(COALESCE(c.fecha_desde, p.fecha_inicio), '%Y-%m-%d'), '') AS fechaDesde,
  IFNULL(DATE_FORMAT(COALESCE(c.fecha_hasta, p.fecha_fin), '%Y-%m-%d'), '') AS fechaHasta,
  IFNULL(s.nombre, 'Rubio') AS sedeCentro,
  IFNULL(esp_c.nombre, IFNULL(esp_fa.nombre, '')) AS especialidad,
  d.clave_portal_hash AS clave
FROM docentes_v3 d
LEFT JOIN docentes_formacion_academica_v3 fa ON d.id = fa.docente_id
LEFT JOIN especialidades_v3 esp_fa ON fa.especialidad_id = esp_fa.id
LEFT JOIN (
  SELECT c1.*
  FROM docentes_contrataciones_v3 c1
  INNER JOIN (
    SELECT docente_id, MAX(id) AS max_id
    FROM docentes_contrataciones_v3
    GROUP BY docente_id
  ) c2 ON c1.id = c2.max_id
) c ON d.id = c.docente_id
LEFT JOIN especialidades_v3 esp_c ON c.especialidad_id = esp_c.id
LEFT JOIN periodos_academicos_v3 p ON c.periodo_id = p.id
LEFT JOIN departamentos_v3 dep ON c.departamento_id = dep.id
LEFT JOIN sedes_v3 s ON c.sede_id = s.id
LEFT JOIN (
  SELECT b1.*
  FROM docentes_datos_bancarios_v3 b1
  INNER JOIN (
    SELECT docente_id, MAX(id) AS max_id
    FROM docentes_datos_bancarios_v3
    WHERE es_principal = 1
    GROUP BY docente_id
  ) b2 ON b1.id = b2.max_id
) b ON d.id = b.docente_id
LEFT JOIN bancos_v3 bcat ON b.banco_id = bcat.id;

CREATE OR REPLACE VIEW docentes_materias AS
SELECT 
  ca.id AS id,
  c.docente_cedula AS docente_cedula,
  m.nombre AS nombre,
  ca.horas_semanal AS horasSemanal,
  ca.horas_lapso AS horasLapso,
  IFNULL(esp.nombre, '') AS especialidadDestino,
  ca.seccion AS seccion,
  ca.cupos AS cupos,
  ca.inscritos AS inscritos,
  ca.cohorte AS cohorte,
  p.nombre AS periodoAcademico
FROM cargas_academicas_v3 ca
INNER JOIN docentes_contrataciones_v3 c ON ca.contratacion_id = c.id
INNER JOIN materias_catalogo_v3 m ON ca.materia_id = m.id
LEFT JOIN especialidades_v3 esp ON ca.especialidad_destino_id = esp.id
LEFT JOIN periodos_academicos_v3 p ON c.periodo_id = p.id;


-- Seed de Materias del Catálogo UPEL
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA ADOLESCENCIA Y LA ADULTEZ.');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA EDAD ESCOLAR (6 A 12 AÑOS)');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA PRIMERA INFANCIA (0 A 6 AÑOS)');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ABORDAJE PEDAGÓGICO DEL LENGUAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ACTIVIDAD FÍSICA PARA EL ADULTO MAYOR');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ACTIVIDAD FÍSICA, DEPORTE Y RECREACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ADAPTACIONES CURRICULARES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ADQUISICIÓN DE LA LECTURA Y LA ESCRITURA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ADQUISICIÓN DE UNA SEGUNDA LENGUA EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('AGROINDUSTRIAS COMUNITARIAS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ANÁLISIS DEL DISCURSO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ANÁLISIS DEL TEXTO Y LA REPRESENTACIÓN TEATRAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ANÁLISIS FONÉTICO Y FONOLÓGICO DEL INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ANATOMÍA Y FISIOLOGÍA HUMANA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('APRENDIZAJE AUTÓNOMO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ARTE Y EDUCACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ATENCIÓN A NIÑOS Y JÓVENES CON DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ATENCIÓN EN ESPACIOS DE FAMILIA Y COMUNIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ATENCIÓN INTEGRAL DEL INFANTE DE 0 A 6 AÑOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('AULA CULTURAL INTERACTIVA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('AULA MUSICAL INTERACTIVA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('BASES CIENTÍFICAS DE LA ACTIVIDAD FÍSICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('BIOÉTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CALENDARIO FESTIVO VENEZOLANO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CAMBIOS ACTUALES DE LA LENGUA ESPAÑOLA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CIENCIA, TECNOLOGÍA Y SOCIEDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CIENCIAS INTEGRADAS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CIENCIAS NATURALES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('COMPETENCIAS GERENCIALES EN EL CONTEXTO EDUCATIVO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('COMPRENSIÓN AUDITIVA DEL INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('COMPRENSIÓN DE TEXTOS ORALES Y ESCRITOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('COMPRENSIÓN Y PRODUCCIÓN DE TEXTOS EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CONSOLIDACIÓN DE LA COMUNICACIÓN ESCRITA EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CONSOLIDACIÓN DE LA COMUNICACIÓN ORAL EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CORRIENTES LITERARIAS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CULTURA DEL MUNDO ANGLOPARLANTE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CULTURA REGIONAL Y LITERATURA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('CULTURA Y DISCURSO LITERARIO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DANZA TRADICIONAL VENEZOLANA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DESARROLLO CURRICULAR');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DESARROLLO DE HABILIDADES PARA LA ESCUCHA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DESARROLLO DE LA COMUNICACIÓN EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DESARROLLO DE PROCESOS COGNITIVOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DESARROLLO DE PROCESOS COGNITIVOS DE LAS PERSONAS EN SITUACIÓN DE DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DESARROLLO INFANTIL I MATERNAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DESARROLLO INFANTIL II PREESCOLAR');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIDÁCTICA DE LA CANCIÓN INFANTIL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIDÁCTICA DE LA EDUCACIÓN PREESCOLAR');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIDÁCTICA DE LA INFORMÁTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIDÁCTICA DEL INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIDÁCTICA DEL INGLÉS PARA PÚBLICOS ESPECÍFICOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIDÁCTICA DEL TEATRO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIDÁCTICA GENERAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DINÁMICA DEL ESPACIO GEOGRÁFICO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DISCAPACIDAD VISUAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DISCAPACIDAD Y DIFERENCIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DISEÑO INSTRUCCIONAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('DIVERSIDAD CULTURAL Y LINGÜÍSTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ECONOMÍA CAMPESINA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ECOPEDAGOGÍA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN AMBIENTAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN BIOÉTICA Y DERECHOS HUMANOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN ESPECIAL Y SALUD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN ESTÉTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN FÍSICA EN ESPACIOS NO CONVENCIONALES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN FÍSICA Y RECREACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN INCLUSIVA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN INTERCULTURAL EN EL NIVEL INICIAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN PARA LA CIUDADANÍA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN PARA LA PARTICIPACIÓN COMUNITARIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN PARA LA PAZ');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN PARA LAS ARTES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN RURAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN Y DERECHOS HUMANOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EDUCACIÓN Y ESCENARIOS CONVENCIONALES Y NO CONVENCIONALES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EL CIRCO Y PEDAGOGÍA: PAYASOS Y MANIPULACIÓN DE OBJETOS CIRCENSES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EL JUEGO Y LA CREATIVIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EL TÍTERE Y LA PEDAGOGÍA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ENSEÑANZA DE LA LENGUA DE SEÑAS VENEZOLANA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ENSEÑANZA DE LA LITERATURA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ESPAÑOL DE VENEZUELA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ESTRATEGIAS CONVERSACIONALES EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ESTUDIO DEL DISCURSO LITERARIO EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ESTUDIOS LINGÜÍSTICOS Y LITERARIOS INTERCULTURALES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ETAPAS Y DESARROLLO EMOCIONAL INFANTIL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EVALUACIÓN DE LA SITUACIÓN DE DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EVALUACIÓN DE LOS PROCESOS DE ENSEÑANZA Y APRENDIZAJE DEL INGLÉS COMO LENGUA EXTRANJERA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EVALUACIÓN DEL APRENDIZAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EXPRESIÓN CORPORAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('EXPRESIÓN ORAL Y ESCRITA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('FONÉTICA Y FONOLOGÍA EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('FORMACIÓN E INSERCIÓN LABORAL DE PERSONAS CON DISCAPACIDAD.');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('FORMACIÓN PERSONAL DEL DOCENTE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('FUNDAMENTOS DE EDUCACIÓN FÍSICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('FUNDAMENTOS DE LA ECONOMÍA AGRÍCOLA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('FUNDAMENTOS PARA LA ENSEÑANZA DE LA LECTURA Y LA ESCRITURA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('FUNDAMENTOS SOCIOLÓGICOS DE LA EDUCACIÓN RURAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GÉNEROS TEXTUALES ACADÉMICOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GERENCIA Y LEGISLACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GESTIÓN COMUNITARIA I');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GESTIÓN COMUNITARIA II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GESTIÓN CURRICULAR');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GESTIÓN EN ESCENARIOS ALTERNATIVOS DE APRENDIZAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GRAMÁTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('GRAMÁTICA DEL INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('HISTORIA DEL TEATRO I');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('HISTORIA DEL TEATRO II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INGLÉS PARA NIÑOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTERDISCIPLINARIEDAD EN LA ENSEÑANZA APRENDIZAJE DE LA CIENCIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTERPRETACIÓN Y CREATIVIDAD MUSICAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTRODUCCIÓN A LA COMUNICACIÓN ESCRITA EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTRODUCCIÓN A LA COMUNICACIÓN ORAL EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTRODUCCIÓN A LA LECTURA Y ESCRITURA EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTRODUCCIÓN A LOS ESTUDIOS DE LA LENGUA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTRODUCCIÓN AL ESTUDIO DE LA LENGUA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INTRODUCCIÓN AL ESTUDIO DEL DISCURSO LITERARIO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INVESTIGACIÓN I');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INVESTIGACIÓN II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INVESTIGACIÓN III');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('INVESTIGACIÓN IV');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('JUEGOS DE MÚSICA Y EXPRESIÓN CORPORAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('KINESIOLOGÍA EN LA EDUCACIÓN FÍSICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LA TEATRALIDAD EN LAS MANIFESTACIONES ARTÍSTICO – TRADICIONALES VENEZOLANAS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LA TEORÍA LITERARIA Y SU RECEPCIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LATÍN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LECTURA Y ESCRITURA EN EDUCACIÓN INICIAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LEGISLACIÓN DE LA EDUCACIÓN ESPECIAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LEGISLACIÓN EDUCATIVA AGRARIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LEGISTACION COMPARADA EN CONTEXTOS INTERCULTURALES');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LENGUA DE SEÑAS VENEZOLANA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LENGUA DE SEÑAS VENEZOLANA INSTRUMENTAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LENGUA Y CULTURA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LENGUA, LITERATURA Y SOCIEDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LENGUAJE Y PENSAMIENTO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LÉXICO SEMÁNTICA Y SEMIÓTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LIDERAZGO MAGISTERIAL Y ORATORIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LINGÜÍSTICA APLICADA A LA ENSEÑANZA DE LA LENGUA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LINGÜÍSTICA DEL CORPUS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LINGÜÍSTICA GENERAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LITERATURA JUVENIL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LITERATURA LATINOAMERICANA Y CARIBEÑA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LITERATURA VENEZOLANA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LITERATURA Y ARTE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('LÚDICA Y MOTRICIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MANIFESTACIONES ESCÉNICAS VENEZOLANAS CONTEMPORÁNEAS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MANTENIMIENTO DE INSTITUCIONES EDUCATIVAS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MAQUILLAJE TEATRAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MEDIO FÍSICO Y DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MEDIOS EXPRESIVO DE LA ACTUACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MÉTODOS DE ANÁLISIS LITERARIOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MOMENTOS DE LA LITERATURA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('MUSICOLOGÍA Y ETNOMUSICOLOGÍA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('NEUROCIENCIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('NEUROCIENCIA Y EDUCACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('NEUROMÚSICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ORALIDAD Y CORPUS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ORIENTACIÓN EDUCATIVA Y DIVERSIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('ORIENTACIÓN PARA LA ATENCIÓN DE PERSONAS EN SITUACIÓN DE DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PEDAGOGÍA DE LA ACTUACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PEDAGOGÍA DE LA DIRECCIÓN TEATRAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PEDAGOGÍA DE LA MÚSICA II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PERSPECTIVA DE LA SITUACIÓN DE DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PERSPECTIVA EDUCATIVA DE LA DISCAPACIDAD MOTORA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PERSPECTIVAS DE ANÁLISIS LITERARIO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PLANIFICACIÓN DE LA ENSEÑANZA Y DEL APRENDIZAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PLANIFICACIÓN POR PROYECTO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PLANIFICACIÓN PROSPECTIVA EN LA EDUCACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRÁCTICA MUSICAL I');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRÁCTICA MUSICAL II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRÁCTICA PROFESIONAL I');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRÁCTICA PROFESIONAL II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRÁCTICA PROFESIONAL III');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRÁCTICA PROFESIONAL IV');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PREPARACIÓN FÍSICA BÁSICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PREVENCIÓN DE LA SITUACIÓN DE DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PREVENCIÓN Y GESTIÓN DE RIESGO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PROBLEMÁTICA SOCIAL Y APRENDIZAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRODUCCIÓN DE EVENTOS ARTÍSTICOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PRODUCCIÓN Y PUESTA EN ESCENA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PROGRAMACIÓN DIDÁCTICA CRÍTICO CONSTRUCTIVA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PROGRAMACIÓN II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PROMOCIÓN DE LA LECTURA EN EL AULA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PROYECTOS EDUCATIVOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PSICOLOGÍA DE LA CREACIÓN DRAMÁTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PSICOLOGÍA DEL APRENDIZAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('PSICOLOGÍA EVOLUTIVA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('RECREACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('RECURSOS DIDÁCTICOS PARA LA EDUCACIÓN INICIAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('RECURSOS PARA EL APRENDIZAJE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('REPERTORIO TRADICIONAL VENEZOLANO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('RITMO Y EXPRESIÓN CORPORAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SALUD INTEGRAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SALUD PREVENTIVA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SEMINARIO DE INMERSIÓN TOTAL EN INGLÉS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SEMINARIO DE INVESTIGACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SEMINARIO DE LECTURA Y ESCRITURA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SEMINARIO DE POLÍTICAS EDUCATIVAS DEL MUNDO ANGLOPARLANTE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SEMINARIO DE TEATRO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SEMINARIO DE TÉCNICAS DE TRADUCCIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SISTEMA BRAILLE');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SISTEMAS AUMENTATIVOS DE COMUNICACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SOCIEDAD Y EDUCACIÓN');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('SOFTWARE EN EDUCACIÓN MUSICAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER BÁSICO RURAL I');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER DE CREACIÓN LITERARIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER DE EXPRESIÓN ARTÍSTICA INTEGRAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER DE JUEGOS ESCÉNICOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER DE MAQUETAS Y MODELOS TRIDIMENSIONALES CON FINES DIDÁCTICOS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER DE TEATRO INFANTIL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER DE TEATRO LATINOAMERICANO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TALLER DE TEATRO VENEZOLANO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TÉCNICAS Y ESTRATEGIAS DE LA ENSEÑANZA DEL INGLÉS EN LÍNEA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TECNOLOGÍA TEATRAL');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TECNOLOGÍAS E INNOVACIONES EDUCATIVAS');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TENDENCIAS ACTUALES Y FUTURAS PARA LA ATENCIÓN DE LA PERSONA EN SITUACIÓN DE DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TENDENCIAS DE LA LINGÜÍSTICA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TEORÍA LITERARIA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TEORÍA Y PRÁCTICA DE LA MOTRICIDAD HUMANA');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TIC I');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TIC II');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TIC III');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TIC IV');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TOPÓNIMO E IDENTIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('TRANSICIÓN DE PREESCOLAR A PRIMER GRADO');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('VEJEZ Y DESARROLLO DE LA PERSONA EN SITUACIÓN DE DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('VISIÓN SOCIO ANTROPOLÓGICA DE LA DISCAPACIDAD');
INSERT IGNORE INTO materias_catalogo (nombre) VALUES ('VISIONES DE LA LITERATURA');
