CREATE DATABASE IF NOT EXISTS upel_talento_humano;
USE upel_talento_humano;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role ENUM('ADMIN', 'JEFE', 'AUDITOR') NOT NULL,
  department VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS autorizaciones (
  cedula VARCHAR(20) PRIMARY KEY,
  department VARCHAR(100) NOT NULL,
  nombresApellidos VARCHAR(150)
);

CREATE TABLE IF NOT EXISTS docentes (
  cedula VARCHAR(20) PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  status VARCHAR(30) DEFAULT 'Por Revisar',
  fechaNac VARCHAR(20),
  rif VARCHAR(20),
  correo VARCHAR(150),
  direccion VARCHAR(255),
  telefonos VARCHAR(50),
  banco VARCHAR(100),
  cuentaBancaria VARCHAR(50),
  tipoCuenta VARCHAR(30),
  titulosPregrado VARCHAR(255),
  titulosPostgrado VARCHAR(255),
  categoriaDocente VARCHAR(50),
  dedicacion VARCHAR(50),
  periodoAcademico VARCHAR(50),
  semanas INT,
  fechaDesde VARCHAR(20),
  fechaHasta VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS docentes_materias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  docente_cedula VARCHAR(20),
  nombre VARCHAR(150) NOT NULL,
  horasSemanal INT DEFAULT 0,
  horasLapso INT DEFAULT 0,
  FOREIGN KEY (docente_cedula) REFERENCES docentes(cedula) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materias_catalogo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL UNIQUE
);

-- Insertar el admin por defecto si no existe
INSERT IGNORE INTO usuarios (username, password, name, role, department) 
VALUES ('admin', 'admin123', 'Administrador Principal', 'ADMIN', 'Todos');

-- Índices de optimización de consultas (Performance)
CREATE INDEX IF NOT EXISTS idx_docentes_department ON docentes(department);
CREATE INDEX IF NOT EXISTS idx_docentes_status ON docentes(status);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON usuarios(username);
CREATE INDEX IF NOT EXISTS idx_docentes_materias_cedula ON docentes_materias(docente_cedula);
