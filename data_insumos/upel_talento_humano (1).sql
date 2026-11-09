-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 16-10-2026 a las 14:02:17
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `upel_talento_humano`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `user_role` varchar(50) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_name`, `user_role`, `action`, `details`, `timestamp`, `ip_address`, `user_agent`) VALUES
(1, 'yudith', 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', '2026-08-10 20:27:36', NULL, NULL),
(2, 'yudith', 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', '2026-08-10 20:28:58', NULL, NULL),
(3, 'yudith', 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', '2026-08-10 20:31:37', NULL, NULL),
(4, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-9145601, Estado: Activo, Materias asignadas: 1', '2026-08-11 20:02:31', NULL, NULL),
(5, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-08-11 20:07:36', NULL, NULL),
(6, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-10157451, Estado: Activo, Materias asignadas: 2', '2026-08-16 15:03:47', NULL, NULL),
(7, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-08-16 16:55:29', NULL, NULL),
(8, 'yudith', 'ADMIN', 'Creó/Actualizó Docente', 'Cédula: V-17493024, Nombre: JOSE GREGORIO HERNANDEZ, Dpto: MATEMÁTICA', '2026-08-25 10:30:22', NULL, NULL),
(9, 'yudith', 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', '2026-08-25 11:05:46', NULL, NULL),
(10, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-09-06 18:10:43', NULL, NULL),
(11, 'test.sync', 'ADMIN', 'Sincronización Offline en Lote', 'Se procesaron 1 cambios exitosos de 1 encolados.', '2026-09-08 12:12:55', NULL, NULL),
(12, 'test.sync', 'ADMIN', 'Eliminó Docente', 'Cédula: V-OFFLINE-01, Nombre: PROFESOR OFFLINE PRUEBA, Dpto: MATEMÁTICA', '2026-09-08 12:12:55', NULL, NULL),
(13, 'yudith', 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', '2026-09-08 12:21:58', NULL, NULL),
(14, 'Administrador', 'ADMIN', 'Generación de Respaldo SQL', 'Descargado backup .sql con 6 tablas.', '2026-09-08 12:27:08', NULL, NULL),
(15, 'TestRunner', 'ADMIN', 'Generación de Respaldo SQL', 'Descargado backup .sql con 6 tablas.', '2026-09-08 12:32:49', NULL, NULL),
(16, 'yudith', 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', '2026-09-08 12:33:32', NULL, NULL),
(17, 'Administrador', 'ADMIN', 'Generación de Respaldo SQL', 'Descargado backup .sql con 6 tablas.', '2026-09-08 12:33:43', NULL, NULL),
(18, 'yudith', 'ADMIN', 'Descargó Respaldo (Backup)', 'Base de datos completa descargada', '2026-09-08 12:38:43', NULL, NULL),
(19, 'Unidad de Informatica', 'ADMIN', 'Generación de Respaldo SQL', 'Descargado backup .sql con 6 tablas.', '2026-09-09 13:54:30', NULL, NULL),
(20, 'yudith', 'ADMIN', 'Creó/Actualizó Docente', 'Cédula: V-14776205, Nombre: ERIKA MARTINEZ FERNANDEZ , Dpto: AGROINDUSTRIAL', '2026-09-09 14:03:00', NULL, NULL),
(21, 'Sistema Offline', 'AUDITOR', 'Sincronización Offline en Lote', 'Se procesaron 0 cambios exitosos de 2 encolados.', '2026-09-13 16:52:45', NULL, NULL),
(22, 'Sistema Offline', 'AUDITOR', 'Sincronización Offline en Lote', 'Se procesaron 0 cambios exitosos de 3 encolados.', '2026-09-14 18:51:51', NULL, NULL),
(23, 'Sistema Offline', 'AUDITOR', 'Sincronización Offline en Lote', 'Se procesaron 0 cambios exitosos de 1 encolados.', '2026-09-15 20:45:43', NULL, NULL),
(24, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-09-21 08:49:15', NULL, NULL),
(25, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-09-21 09:24:34', NULL, NULL),
(26, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 3', '2026-09-21 09:32:16', NULL, NULL),
(27, 'lorena.alvarez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-5102820, Estado: Activo, Materias asignadas: 1', '2026-09-23 10:00:11', NULL, NULL),
(28, 'lorena.alvarez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-5102820, Estado: Activo, Materias asignadas: 1', '2026-09-23 10:08:43', NULL, NULL),
(29, 'Sistema Offline', 'AUDITOR', 'Sincronización Offline en Lote', 'Se procesaron 1 cambios exitosos de 1 encolados.', '2026-09-23 12:26:09', NULL, NULL),
(30, 'andry.bonilla', 'JEFE', 'Creó/Actualizó Docente', 'Cédula: V-13230490, Nombre: Yudith Elvira Peña Vera, Dpto: Matemática, Pedagogía', '2026-09-24 09:00:55', NULL, NULL),
(31, 'andry.bonilla', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 3', '2026-09-24 09:02:00', NULL, NULL),
(32, 'andry.bonilla', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-17961246, Estado: Activo, Materias asignadas: 1', '2026-09-24 09:09:42', NULL, NULL),
(33, 'andry.bonilla', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-24785261, Estado: Activo, Materias asignadas: 2', '2026-09-24 09:32:10', NULL, NULL),
(34, 'carlos.gamez', 'JEFE', 'Creó/Actualizó Docente', 'Cédula: V-24785261, Nombre:  ENDER DURAN, Dpto: Pedagogía, Matemática', '2026-09-24 09:33:51', NULL, NULL),
(35, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-24785261, Estado: Activo, Materias asignadas: 3', '2026-09-24 09:35:25', NULL, NULL),
(36, 'Unidad de Informatica', 'ADMIN', 'Generación de Respaldo SQL', 'Descargado backup .sql con 6 tablas.', '2026-09-27 12:31:47', NULL, NULL),
(37, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-09-27 14:40:50', NULL, NULL),
(38, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-9467304, Estado: Activo, Materias asignadas: 2', '2026-09-27 14:50:19', NULL, NULL),
(39, 'yudith', 'ADMIN', 'Actualizó Datos de Período', 'ID: 1', '2026-09-27 14:58:46', NULL, NULL),
(40, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-09-27 17:17:47', NULL, NULL),
(41, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 4', '2026-09-27 17:36:29', NULL, NULL),
(42, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 2', '2026-09-27 17:38:27', NULL, NULL),
(43, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-27 21:30:24', '127.0.0.1', 'node'),
(44, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-27 21:31:04', '127.0.0.1', 'node'),
(45, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-28 11:30:14', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(46, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-28 11:31:58', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(47, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-28 11:34:00', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(48, 'Administrador', 'ADMIN', 'MODIFICAR_CEDULA_DOCENTE', 'Corrección de cédula de docente ANTHONY FLÓREZ de V-27815131 a V-27815133', '2026-09-28 18:54:06', NULL, NULL),
(49, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 11:53:39', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(50, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 12:28:48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(51, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 12:43:21', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(52, 'yudith', 'ADMIN', 'Eliminó Docente', 'Cédula: V-9998, Nombre: NEW USER, Dpto: PEDAGOGÍA', '2026-09-30 12:55:54', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(53, 'yudith', 'ADMIN', 'Eliminó Docente', 'Cédula: V-9999, Nombre: TEST TEST, Dpto: PEDAGOGÍA', '2026-09-30 12:56:07', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(54, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 14:28:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(55, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 14:33:35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(56, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 15:14:38', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(57, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 15:26:26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(58, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 15:27:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(59, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 15:36:20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(60, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 15:41:56', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(61, 'upe ', 'SEGURIDAD', 'Alerta: Bloqueo por Fuerza Bruta', 'IP 127.0.0.1 bloqueada 5 minutos tras 5 intentos fallidos', '2026-09-30 15:51:25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(62, 'ing.yudithpeña', 'SEGURIDAD', 'Alerta: Bloqueo por Fuerza Bruta', 'IP 127.0.0.1 bloqueada 5 minutos tras 5 intentos fallidos', '2026-09-30 15:56:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(63, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 16:04:23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(64, 'dpto.pedagogia', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 16:07:28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(65, 'ing,yudithpeña', 'SEGURIDAD', 'Alerta: Bloqueo por Fuerza Bruta', 'IP 127.0.0.1 bloqueada 5 minutos tras 5 intentos fallidos', '2026-09-30 16:31:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(66, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 16:42:08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(67, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 16:55:54', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(68, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:29:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(69, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:30:33', '127.0.0.1', 'node'),
(70, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:30:33', '127.0.0.1', 'node'),
(71, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:30:33', '127.0.0.1', 'node'),
(72, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:30:33', '127.0.0.1', 'node'),
(73, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:37:26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(74, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:41:54', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(75, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:43:42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(76, 'ing.yudithpeña', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:50:45', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(77, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 17:51:19', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(78, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 18:11:17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(79, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 18:37:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(80, 'yudith', 'ADMIN', 'Creó/Actualizó Docente', 'Cédula: V-19540281, Nombre: CHARLY ROCKMELL SANCHEZ LOPEZ, Dpto: Matemática', '2026-09-30 19:42:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(81, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 19:44:24', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(82, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 19:55:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(83, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 19:56:53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(84, 'Sistema Offline', 'AUDITOR', 'Sincronización Offline en Lote', 'Se procesaron 0 cambios exitosos de 1 encolados.', '2026-09-30 20:01:15', NULL, NULL),
(85, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 20:01:32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(86, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 20:31:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(87, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 20:49:31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(88, 'dpto.matematica', 'JEFE', 'Creó/Actualizó Docente', 'Cédula: V-17877028, Nombre: Silvia QUEVEDO, Dpto: Matemática', '2026-09-30 21:18:43', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(89, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 21:29:15', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(90, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 21:30:35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(91, 'subdireccion.docencia', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 21:31:46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(92, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-09-30 21:40:24', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(93, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 06:09:00', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(94, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 06:39:07', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(95, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 07:52:51', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(96, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 07:53:37', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(97, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 08:29:51', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(98, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 11:29:20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(99, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 11:33:25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(100, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 11:39:10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(101, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-01 11:53:46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(102, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 11:10:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(103, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 11:54:17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(104, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 18:47:09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(105, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 19:05:32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(106, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 19:09:50', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(107, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 19:24:08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(108, 'admin', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 19:30:53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(109, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 19:33:10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(110, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 20:04:31', '127.0.0.1', ''),
(111, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 20:10:42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(112, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 20:19:19', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(113, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 20:49:23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(114, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-02 21:40:19', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(115, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-03 05:47:40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(116, 'Sistema Automático', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Culminación oficial según calendario (fecha fin: 2026-10-02)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-03 06:54:46', NULL, NULL),
(117, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-03 07:09:46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(118, 'dpto.matematica', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-03 07:32:40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(119, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-03 09:25:53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(120, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-03 09:27:16', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(121, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-03 11:58:39', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(122, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:16:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(123, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:21:05', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(124, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:21:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(125, 'dpto.sociales', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:23:18', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(126, 'dpto.agroindustrial', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:23:48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(127, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:25:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(128, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:27:02', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(129, 'carlos.gamez', 'JEFE', 'Planificó Carga Anticipada', 'Cédula: V-5283350, Período Planificado: 2026-I (Histórico), Materias asignadas: 3', '2026-10-04 16:45:48', NULL, NULL),
(130, 'carlos.gamez', 'JEFE', 'Planificó Carga Anticipada', 'Cédula: V-5283350, Período Planificado: 2026-I (Histórico), Materias asignadas: 3', '2026-10-04 16:45:48', NULL, NULL),
(131, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 16:49:59', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(132, 'yudith', 'ADMIN', 'Generación de Respaldo SQL', 'Descargado backup .sql con 6 tablas.', '2026-10-04 16:53:16', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(133, 'yudith', 'ADMIN', 'Creó/Actualizó Docente', 'Cédula: 19925459, Nombre: RANDY SAMCNEZ, Dpto: Matemática', '2026-10-04 17:19:30', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(134, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 17:20:54', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(135, 'carlos.gamez', 'JEFE', 'Creó/Actualizó Docente', 'Cédula: 19925469, Nombre: RANDY SANCHEZ, Dpto: Matemática', '2026-10-04 17:21:17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(136, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-04 17:23:05', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(137, 'yudith', 'ADMIN', 'Eliminó Docente', 'Cédula: V-19925459, Nombre: RANDY SAMCNEZ, Dpto: Matemática', '2026-10-04 17:23:35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(138, 'yudith', 'ADMIN', 'Eliminó Docente', 'Cédula: V-19925469, Nombre: RANDY SANCHEZ, Dpto: Matemática', '2026-10-04 17:23:38', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(139, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-05 08:54:26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(140, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 13:15:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(141, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 13:56:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(142, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 14:20:51', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(143, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 14:57:15', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(144, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 15:10:26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(145, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 15:10:38', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(146, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 15:21:21', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(147, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 20:43:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(148, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 20:46:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(149, 'Sistema Automático', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Culminación oficial según calendario (fecha fin: 2026-10-02)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-06 20:56:58', NULL, NULL),
(150, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-06 21:10:15', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(151, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-07 06:53:54', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(152, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-07 10:28:46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(153, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-07 10:29:03', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(154, 'dpto.pedagogia', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-07 10:40:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0'),
(155, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-07 11:43:20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(156, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-07 11:45:31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(157, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-08 07:40:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(158, 'carlos.gamez', 'JEFE', 'Planificó Carga Anticipada', 'Cédula: V-13230490, Período Planificado: 2026-I (Histórico), Materias asignadas: 2', '2026-10-08 07:42:07', NULL, NULL),
(159, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-08 08:01:44', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(160, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-08 09:01:50', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(161, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-08 13:39:14', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(162, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-08 18:30:08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(163, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 07:33:45', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(164, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 07:53:10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(165, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 08:21:13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(166, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 08:25:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(167, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 08:46:19', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(168, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 08:58:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(169, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 09:06:12', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(170, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 12:37:11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(171, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 12:43:44', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(172, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 12:50:05', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(173, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 13:06:13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(174, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 13:20:31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(175, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 13:39:08', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(176, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 13:43:28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(177, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 13:49:13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(178, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 13:59:21', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(179, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 14:43:03', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(180, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 14:43:56', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(181, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 15:04:03', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(182, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 15:38:40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(183, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 15:39:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(184, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 15:40:01', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(185, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 16:06:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(186, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 16:08:01', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(187, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 16:12:23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(188, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 16:16:40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(189, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 16:35:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(190, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 16:47:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(191, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 17:06:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(192, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 17:09:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(193, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-09 17:56:48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(194, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 08:35:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(195, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 08:37:36', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(196, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 09:09:48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(197, 'yudith', 'ADMIN', 'Planificó Carga Anticipada', 'Cédula: V-19540281, Período Planificado: 2026-I (Histórico), Materias asignadas: 2', '2026-10-10 09:11:15', NULL, NULL),
(198, 'yudith', 'ADMIN', 'Planificó Carga Anticipada', 'Cédula: V-19540281, Período Planificado: 2026-I (Histórico), Materias asignadas: 2', '2026-10-10 09:25:53', NULL, NULL),
(199, 'yudith', 'ADMIN', 'Planificó Carga Anticipada', 'Cédula: V-19540281, Período Planificado: 2026-I (Histórico), Materias asignadas: 2', '2026-10-10 09:26:45', NULL, NULL),
(200, 'yudith', 'ADMIN', 'Planificó Carga Anticipada', 'Cédula: V-647952, Período Planificado: 2026-I (Histórico), Materias asignadas: 2', '2026-10-10 09:52:11', NULL, NULL),
(201, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-10 10:08:15', NULL, NULL),
(202, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 10:08:38', NULL, NULL),
(203, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-10 10:11:15', NULL, NULL),
(204, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-10-10 10:15:45', NULL, NULL),
(205, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-647952, Estado: Activo, Materias asignadas: 2', '2026-10-10 10:17:10', NULL, NULL),
(206, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-10 10:22:16', NULL, NULL),
(207, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-10 13:05:44', NULL, NULL),
(208, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 13:39:02', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(209, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 13:51:02', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(210, 'yudith', 'ADMIN', 'Respaldo Preventivo Automático (Snap-Before-Change)', 'Generado respaldo íntegro auto_pre_activacion_prev_a_2026-II_2026-10-10T17-51-12.sql antes de activar el período 2026-II.', '2026-10-10 13:51:13', NULL, NULL),
(211, 'yudith', 'ADMIN', 'Activación de Período Académico', 'Culminó período previo e inició oficialmente el período 2026-II. Cargas promovidas: 0. Siguiente lapso en planificación: 2027-I', '2026-10-10 13:51:39', NULL, NULL),
(212, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 13:53:20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(213, 'carlos.gamez', 'JEFE', 'Replicó Período Académico', 'De 2026-I -> A 2026-II. Docentes preparados: 508 (Departamento: Matemática)', '2026-10-10 13:55:14', NULL, NULL),
(214, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 14:03:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(215, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-II ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 14:04:00', NULL, NULL),
(216, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 14:14:53', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(217, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 14:15:33', NULL, NULL),
(218, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 17:19:42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(219, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 17:30:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(220, 'yudith', 'ADMIN', 'Reprogramó Lapso Académico Activo', 'Período: 2026-I, Semanas: 15, Fechas: 2026-05-21 al 2026-10-05, Motivo: Período en curso oficial del sistema', '2026-10-10 17:58:49', NULL, NULL),
(221, 'Sistema Automático (Calendario)', 'SISTEMA', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre automático institucional por culminación de fecha calendario (2026-10-05)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 17:58:51', NULL, NULL),
(222, 'Sistema Automático (Calendario)', 'SISTEMA', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre automático institucional por culminación de fecha calendario (2026-10-05)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 17:58:52', NULL, NULL),
(223, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-10 18:00:04', NULL, NULL),
(224, 'Sistema Automático (Calendario)', 'SISTEMA', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre automático institucional por culminación de fecha calendario (2026-10-05)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 18:00:07', NULL, NULL),
(225, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-10 18:00:18', NULL, NULL),
(226, 'Sistema Automático (Calendario)', 'SISTEMA', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre automático institucional por culminación de fecha calendario (2026-10-05)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 18:00:20', NULL, NULL),
(227, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 18:43:20', NULL, NULL);
INSERT INTO `audit_logs` (`id`, `user_name`, `user_role`, `action`, `details`, `timestamp`, `ip_address`, `user_agent`) VALUES
(228, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 18:46:42', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(229, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 18:54:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(230, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-10 18:54:59', NULL, NULL),
(231, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-10 18:55:14', NULL, NULL),
(232, 'subdireccion.docencia', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 19:01:10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(233, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 19:19:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(234, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-10 20:31:32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(235, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-11 08:13:18', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(236, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-11 08:25:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(237, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-11 09:06:39', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(238, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-11 09:11:51', NULL, NULL),
(239, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 09:46:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(240, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 10:06:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(241, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-10-11 10:09:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(242, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-11 10:27:17', NULL, NULL),
(243, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-11 10:28:19', NULL, NULL),
(244, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 10:28:54', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(245, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 11:18:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(246, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 2', '2026-10-11 11:21:47', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(247, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 2', '2026-10-11 11:46:01', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(248, 'V-19540281', 'DOCENTE', 'Cambio de Clave en Portal', 'El docente actualizó su contraseña de acceso personal.', '2026-10-11 11:48:51', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(249, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-11 11:59:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(250, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-647952, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:21:06', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(251, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:22:32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(252, 'admin', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:34:41', '127.0.0.1', 'node'),
(253, 'admin', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:37:25', '127.0.0.1', 'node'),
(254, 'admin', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:39:36', '127.0.0.1', 'node'),
(255, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-647952, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:43:12', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(256, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-4074672, Estado: Activo, Materias asignadas: 3', '2026-10-11 12:44:20', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(257, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:45:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(258, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 12:46:34', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(259, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-11 14:12:42', NULL, NULL),
(260, 'Sistema Offline', 'AUDITOR', 'Sincronización Offline en Lote', 'Se procesaron 1 cambios exitosos de 1 encolados.', '2026-10-11 14:27:04', NULL, NULL),
(261, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-11 14:40:31', NULL, NULL),
(262, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 14:42:04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(263, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-11 14:48:42', NULL, NULL),
(264, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-11 15:21:35', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(265, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-11 15:41:34', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(266, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-11 15:41:55', NULL, NULL),
(267, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-11 15:42:31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(268, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-11 15:44:12', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(269, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-11 15:44:20', NULL, NULL),
(270, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 07:50:18', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(271, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 07:50:24', NULL, NULL),
(272, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-12 07:51:17', NULL, NULL),
(273, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 08:39:59', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(274, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 08:40:56', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(275, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 08:59:13', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(276, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 09:00:04', NULL, NULL),
(277, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-12 09:00:13', NULL, NULL),
(278, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 09:35:54', NULL, NULL),
(279, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-12 09:36:28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(280, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-12 09:36:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(281, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 09:49:45', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(282, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-12 09:50:09', NULL, NULL),
(283, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 10:55:11', NULL, NULL),
(284, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-12 10:55:18', NULL, NULL),
(285, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 17:36:04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(286, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 17:42:36', NULL, NULL),
(287, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-27815133, Estado: Activo, Materias asignadas: 2', '2026-10-12 17:58:48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(288, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 18:02:09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(289, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-12 18:02:45', NULL, NULL),
(290, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 20:07:51', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(291, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 20:10:25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(292, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 20:13:19', NULL, NULL),
(293, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 20:16:02', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(294, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-12 20:32:42', NULL, NULL),
(295, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 20:40:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(296, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 21:19:43', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(297, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 21:20:35', NULL, NULL),
(298, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-12 21:22:17', NULL, NULL),
(299, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-12 21:24:57', NULL, NULL),
(300, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 21:25:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(301, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-5283350, Estado: Activo, Materias asignadas: 3', '2026-10-12 21:27:02', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(302, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-15438777, Estado: Activo, Materias asignadas: 2', '2026-10-12 21:29:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(303, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-15438777, Estado: Activo, Materias asignadas: 2', '2026-10-12 21:29:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(304, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-15438777, Estado: Activo, Materias asignadas: 2', '2026-10-12 21:30:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(305, 'V-19540281', 'DOCENTE', 'Actualizó Ficha en Portal', 'El docente completó o actualizó sus datos personales y bancarios en el portal.', '2026-10-12 21:41:56', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(306, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-12 21:46:11', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36'),
(307, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-13 14:49:54', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(308, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-13 15:11:14', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(309, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-13 16:05:07', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(310, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-13 16:06:24', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(311, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-14 06:44:01', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(312, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-14 06:44:22', NULL, NULL),
(313, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-14 09:14:41', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(314, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-14 09:17:17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(315, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-14 09:18:09', NULL, NULL),
(316, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-14 09:18:23', NULL, NULL),
(317, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-14 09:18:45', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(318, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-14 09:19:30', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(319, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-14 09:19:37', NULL, NULL),
(320, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-14 09:19:46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(321, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-14 09:20:23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(322, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-14 10:56:48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(323, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-15 18:07:31', NULL, NULL),
(324, 'yudith', 'ADMIN', 'Respaldo Preventivo Automático (Snap-Before-Change)', 'Generado respaldo íntegro auto_pre_activacion_prev_a_2026-II_2026-10-15T22-08-07.sql antes de activar el período 2026-II.', '2026-10-15 18:08:07', NULL, NULL),
(325, 'yudith', 'ADMIN', 'Activación de Período Académico', 'Culminó período previo e inició oficialmente el período 2026-II. Cargas promovidas: 0. Siguiente lapso en planificación: 2027-I', '2026-10-15 18:08:08', NULL, NULL),
(326, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-15 18:10:28', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(327, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-15 18:11:48', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(328, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 18:20:47', NULL, NULL),
(329, 'yudith', 'ADMIN', 'Replicó Carga a Período en Planificación', 'De 2026-I -> A 2026-II. Docentes preparados: 127 (Departamento: Todos)', '2026-10-15 18:27:54', NULL, NULL),
(330, 'yudith', 'ADMIN', 'Respaldo Preventivo Automático (Snap-Before-Change)', 'Generado respaldo íntegro auto_pre_activacion_2026-I_a_2026-II_2026-10-15T22-29-31.sql antes de activar el período 2026-II.', '2026-10-15 18:29:31', NULL, NULL),
(331, 'yudith', 'ADMIN', 'Activación de Período Académico', 'Culminó período 2026-I e inició oficialmente el período 2026-II. Cargas promovidas: 127. Siguiente lapso en planificación: 2027-I', '2026-10-15 18:29:33', NULL, NULL),
(332, 'admin', 'ADMIN', 'Actualizó Datos de Período', 'Período: 2026-I, Semanas: 15, Fechas: 2026-05-21 al 2026-11-30, Motivo: Periodo 2026-I en curso (prueba de guardado)', '2026-10-15 18:29:46', NULL, NULL),
(333, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 18:33:15', NULL, NULL),
(334, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-II ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 18:37:03', NULL, NULL),
(335, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-15 18:39:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(336, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 18:44:55', NULL, NULL),
(337, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-15 18:45:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(338, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-II ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 18:45:45', NULL, NULL),
(339, 'yudith', 'ADMIN', 'Reprogramó Lapso Académico Activo', 'Período: 2026-II, Semanas: 15, Fechas: 2026-11-03 al 2027-02-26, Motivo: Período reactivado institucionalmente como oficial en curso', '2026-10-15 18:46:39', NULL, NULL),
(340, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-15 18:53:10', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(341, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-15 18:55:23', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(342, 'yudith', 'ADMIN', 'Reprogramó Lapso Académico Activo', 'Período: 2026-II, Semanas: 15, Fechas: 2026-11-03 al 2027-02-24, Motivo: Período reactivado institucionalmente como oficial en curso', '2026-10-15 19:02:57', NULL, NULL),
(343, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-15 19:05:33', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(344, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-15 19:07:04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(345, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-15 19:09:02', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(346, 'admin', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-17961246, Estado: Activo, Materias asignadas: 1', '2026-10-15 19:09:16', '127.0.0.1', ''),
(347, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-15 19:12:46', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(348, 'yudith', 'ADMIN', 'Reprogramó Lapso Académico Activo', 'Período: 2026-II, Semanas: 15, Fechas: 2026-11-03 al 2027-02-22, Motivo: Período reactivado institucionalmente como oficial en curso', '2026-10-15 19:19:51', NULL, NULL),
(349, 'yudith', 'ADMIN', 'Reprogramó Lapso Académico Activo', 'Período: 2026-II, Semanas: 15, Fechas: 2026-11-03 al 2027-02-20, Motivo: Período reactivado institucionalmente como oficial en curso', '2026-10-15 19:59:11', NULL, NULL),
(350, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-10-15 20:32:06', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(351, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-10-15 20:34:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(352, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 20:39:33', NULL, NULL),
(353, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-10-15 20:40:52', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(354, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-10-15 20:41:58', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(355, 'yudith', 'ADMIN', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre oficial institucional por culminación de calendario). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-15 20:43:00', NULL, NULL),
(356, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-II ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 20:43:10', NULL, NULL),
(357, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-17961246, Estado: Activo, Materias asignadas: 1', '2026-10-15 20:48:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(358, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-17961246, Estado: Activo, Materias asignadas: 1', '2026-10-15 20:49:27', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(359, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-17961246, Estado: Activo, Materias asignadas: 0', '2026-10-15 20:51:31', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(360, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-15 21:47:22', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(361, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-13230490, Estado: Activo, Materias asignadas: 2', '2026-10-15 21:49:25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(362, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-15 21:54:32', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(363, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-15 22:15:17', NULL, NULL),
(364, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-15 22:19:17', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(365, 'yudith', 'ADMIN', 'Reprogramó Lapso Académico Activo', 'Período: 2026-I, Semanas: 15, Fechas: 2026-05-21 al 2026-10-03, Motivo: Período reactivado institucionalmente como oficial en curso', '2026-10-16 06:34:44', NULL, NULL),
(366, 'Sistema Automático (Calendario)', 'SISTEMA', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre automático institucional por culminación de fecha calendario (2026-10-03)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-16 06:34:48', NULL, NULL),
(367, 'Sistema Automático (Calendario)', 'SISTEMA', 'Cierre Institucional de Lapso Académico', 'El período 2026-I ha sido cerrado (Cierre automático institucional por culminación de fecha calendario (2026-10-03)). 100% de la carga académica y asignaturas resguardadas en histórico.', '2026-10-16 06:34:49', NULL, NULL),
(368, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-I ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-16 06:36:52', NULL, NULL),
(369, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-11105527, Estado: Activo, Materias asignadas: 2', '2026-10-16 06:37:26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(370, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-647952, Estado: Activo, Materias asignadas: 2', '2026-10-16 06:39:57', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(371, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-4074672, Estado: Activo, Materias asignadas: 3', '2026-10-16 06:40:06', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(372, 'yudith', 'ADMIN', 'Respaldo Preventivo Automático (Snap-Before-Change)', 'Generado respaldo íntegro auto_pre_activacion_2026-I_a_2027-I_2026-10-16T10-41-19.sql antes de activar el período 2027-I.', '2026-10-16 06:41:20', NULL, NULL),
(373, 'yudith', 'ADMIN', 'Activación de Período Académico', 'Culminó período 2026-I e inició oficialmente el período 2027-I. Cargas promovidas: 0. Siguiente lapso en planificación: 2027-II', '2026-10-16 06:41:21', NULL, NULL),
(374, 'yudith', 'ADMIN', 'Reactivación de Período Académico', 'El período 2026-II ha sido reabierto y reactivado oficialmente (Reactivación solicitada por usuario). Toda la carga y materias se mantuvieron intactas.', '2026-10-16 06:42:18', NULL, NULL),
(375, 'yudith', 'ADMIN', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-16 06:44:26', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(376, 'carlos.gamez', 'JEFE', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-16 06:47:34', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(377, 'carlos.gamez', 'JEFE', 'Actualizó Validación/Carga', 'Cédula: V-19540281, Estado: Activo, Materias asignadas: 2', '2026-10-16 06:47:55', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(378, 'V-19540281', 'DOCENTE', 'Cambio de Clave en Portal', 'El docente actualizó su contraseña de acceso personal.', '2026-10-16 06:48:40', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(379, 'talentohumano', 'AUDITOR', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-16 06:56:04', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(380, 'yudith', 'ADMIN', 'Inicio de Sesión Exitoso', 'Acceso autenticado en el sistema', '2026-10-16 07:04:25', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36'),
(381, 'yudith', 'ADMIN', 'Sincronización Offline en Lote', 'Se procesaron 1 cambios exitosos de 1 encolados.', '2026-10-16 07:54:09', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `autorizaciones`
--

CREATE TABLE `autorizaciones` (
  `cedula` varchar(20) NOT NULL,
  `department` varchar(100) NOT NULL,
  `nombresApellidos` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargas_academicas_v3`
--

CREATE TABLE `cargas_academicas_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `contratacion_id` int(10) UNSIGNED NOT NULL,
  `materia_id` int(10) UNSIGNED NOT NULL,
  `horas_semanal` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `horas_lapso` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `especialidad_destino` varchar(100) DEFAULT NULL,
  `seccion` varchar(20) DEFAULT 'U',
  `cupos` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `inscritos` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `cohorte` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cargas_academicas_v3`
--

INSERT INTO `cargas_academicas_v3` (`id`, `contratacion_id`, `materia_id`, `horas_semanal`, `horas_lapso`, `especialidad_destino`, `seccion`, `cupos`, `inscritos`, `cohorte`) VALUES
(5361, 80, 105, 4, 60, 'Educación Física', '09', 8, 5, NULL),
(5362, 80, 106, 4, 60, 'Educación Inicial', '90', 5, 4, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargas_historicas`
--

CREATE TABLE `cargas_historicas` (
  `id` int(11) NOT NULL,
  `cedula_docente` varchar(20) NOT NULL,
  `periodoAcademico` varchar(50) NOT NULL,
  `department` varchar(100) NOT NULL,
  `status` varchar(30) DEFAULT 'Por Revisar',
  `semanas` int(11) DEFAULT 15,
  `fechaDesde` varchar(20) DEFAULT NULL,
  `fechaHasta` varchar(20) DEFAULT NULL,
  `materias` text DEFAULT NULL,
  `totalHorasSemanal` int(11) DEFAULT 0,
  `totalHorasLapso` int(11) DEFAULT 0,
  `fechaRegistro` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cargas_historicas`
--

INSERT INTO `cargas_historicas` (`id`, `cedula_docente`, `periodoAcademico`, `department`, `status`, `semanas`, `fechaDesde`, `fechaHasta`, `materias`, `totalHorasSemanal`, `totalHorasLapso`, `fechaRegistro`) VALUES
(1, 'V-19540281', '2026-I', 'Matemática', 'Activo', 15, '2026-05-21', '2026-10-03', '[{\"id\":5348,\"docente_cedula\":\"V-19540281\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"09\",\"cupos\":8,\"inscritos\":5,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-I\"},{\"id\":5349,\"docente_cedula\":\"V-19540281\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"90\",\"cupos\":5,\"inscritos\":4,\"cohorte\":\"2026\",\"periodoAcademico\":\"2026-I\"}]', 8, 120, '2026-10-15 22:19:17'),
(2, 'V-13230490', '2026-I', 'Matemática', 'Activo', 15, '2026-05-21', '2026-10-03', '[{\"id\":5346,\"docente_cedula\":\"V-13230490\",\"nombre\":\"TIC IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Matemática\",\"seccion\":\"10\",\"cupos\":20,\"inscritos\":10,\"cohorte\":\"2026\",\"periodoAcademico\":\"2026-II\"},{\"id\":5347,\"docente_cedula\":\"V-13230490\",\"nombre\":\"TIC IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Artes Escénicas\",\"seccion\":\"10\",\"cupos\":10,\"inscritos\":10,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 120, '2026-10-15 20:41:58'),
(4, 'V-11105527', '2026-I', 'Matemática', 'Activo', 15, '2026-05-21', '2026-11-30', '[{\"id\":5350,\"docente_cedula\":\"V-11105527\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"10\",\"cupos\":10,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-I\"},{\"id\":5351,\"docente_cedula\":\"V-11105527\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"7\",\"cupos\":12,\"inscritos\":4,\"cohorte\":null,\"periodoAcademico\":\"2026-I\"}]', 8, 120, '2026-10-16 06:37:26'),
(5, 'V-5102820', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":4988,\"docente_cedula\":\"V-5102820\",\"nombre\":\"DESARROLLO CURRICULAR\",\"horasSemanal\":0,\"horasLapso\":0,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"\",\"cupos\":0,\"inscritos\":0,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5020,\"docente_cedula\":\"V-5102820\",\"nombre\":\"EDUCACIÓN AMBIENTAL\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"54\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-23 10:08:43'),
(8, 'V-17961246', '2026-I', 'Pedagogía', 'Activo', 15, '2026-05-21', '2026-10-03', '[]', 0, 0, '2026-09-24 09:09:42'),
(9, 'V-24785261', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":4993,\"docente_cedula\":\"V-24785261\",\"nombre\":\"PRÁCTICA PROFESIONAL III\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":4994,\"docente_cedula\":\"V-24785261\",\"nombre\":\"DIDÁCTICA GENERAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":4995,\"docente_cedula\":\"V-24785261\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5149,\"docente_cedula\":\"V-24785261\",\"nombre\":\"PRÁCTICA PROFESIONAL III\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"53\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5150,\"docente_cedula\":\"V-24785261\",\"nombre\":\"DIDÁCTICA GENERAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":24,\"inscritos\":21,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5151,\"docente_cedula\":\"V-24785261\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":14,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":12,\"inscritos\":12,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 28, 374, '2026-09-24 09:35:25'),
(11, 'V-4074672', '2026-I', 'Pedagogía', 'Activo', 15, '2026-05-21', '2026-11-30', '[{\"id\":5354,\"docente_cedula\":\"V-4074672\",\"nombre\":\"PRÁCTICA MUSICAL I\",\"horasSemanal\":12,\"horasLapso\":180,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"U\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-I\"},{\"id\":5355,\"docente_cedula\":\"V-4074672\",\"nombre\":\"PRÁCTICA MUSICAL II\",\"horasSemanal\":8,\"horasLapso\":120,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"U\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-I\"},{\"id\":5356,\"docente_cedula\":\"V-4074672\",\"nombre\":\"MUSICOLOGÍA Y ETNOMUSICOLOGÍA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"7\",\"cupos\":15,\"inscritos\":7,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-I\"}]', 24, 360, '2026-10-16 06:40:06'),
(12, 'V-9145601', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":4985,\"docente_cedula\":\"V-9145601\",\"nombre\":\"\",\"horasSemanal\":0,\"horasLapso\":0,\"especialidadDestino\":\"\",\"seccion\":\"\",\"cupos\":0,\"inscritos\":0,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5001,\"docente_cedula\":\"V-9145601\",\"nombre\":\"ECONOMÍA CAMPESINA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":20,\"inscritos\":19,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5002,\"docente_cedula\":\"V-9145601\",\"nombre\":\"ECONOMÍA CAMPESINA\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"53\",\"cupos\":20,\"inscritos\":15,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(13, 'V-10157451', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5281,\"docente_cedula\":\"V-10157451\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":null,\"seccion\":\"U\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 60, '2026-09-27 12:37:25'),
(20, 'V-10481795', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":4996,\"docente_cedula\":\"V-10481795\",\"nombre\":\"TALLER BÁSICO RURAL I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":4997,\"docente_cedula\":\"V-10481795\",\"nombre\":\"AGROINDUSTRIAS COMUNITARIAS\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":10,\"inscritos\":4,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":4998,\"docente_cedula\":\"V-10481795\",\"nombre\":\"FUNDAMENTOS SOCIOLÓGICOS DE LA EDUCACIÓN RURAL\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 12, 132, '2026-09-27 12:37:25'),
(21, 'V-11106384', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":4999,\"docente_cedula\":\"V-11106384\",\"nombre\":\"GESTIÓN COMUNITARIA II\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"55\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5000,\"docente_cedula\":\"V-11106384\",\"nombre\":\"MANTENIMIENTO DE INSTITUCIONES EDUCATIVAS\",\"horasSemanal\":2,\"horasLapso\":5,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"54\",\"cupos\":10,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 5, 50, '2026-09-27 12:37:25'),
(22, 'V-10683546', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5003,\"docente_cedula\":\"V-10683546\",\"nombre\":\"AGROINDUSTRIAS COMUNITARIAS\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":7,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(23, 'V-18791204', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5004,\"docente_cedula\":\"V-18791204\",\"nombre\":\"EDUCACIÓN RURAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"2\",\"cupos\":15,\"inscritos\":6,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5005,\"docente_cedula\":\"V-18791204\",\"nombre\":\"EDUCACIÓN RURAL\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"70\",\"cupos\":15,\"inscritos\":8,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(24, 'V-25361458', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5006,\"docente_cedula\":\"V-25361458\",\"nombre\":\"ECONOMÍA CAMPESINA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"53\",\"cupos\":20,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5007,\"docente_cedula\":\"V-25361458\",\"nombre\":\"FUNDAMENTOS DE LA ECONOMÍA AGRÍCOLA\",\"horasSemanal\":2,\"horasLapso\":6,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 6, 66, '2026-09-27 12:37:25'),
(25, 'V-14776205', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5008,\"docente_cedula\":\"V-14776205\",\"nombre\":\"EDUCACIÓN PARA LA PARTICIPACIÓN COMUNITARIA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":24,\"inscritos\":17,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5009,\"docente_cedula\":\"V-14776205\",\"nombre\":\"EDUCACIÓN PARA LA PARTICIPACIÓN COMUNITARIA\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":14,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(26, 'V-19519008', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5010,\"docente_cedula\":\"V-19519008\",\"nombre\":\"ECONOMÍA CAMPESINA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":15,\"inscritos\":12,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5011,\"docente_cedula\":\"V-19519008\",\"nombre\":\"GESTIÓN COMUNITARIA I\",\"horasSemanal\":2,\"horasLapso\":6,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"70\",\"cupos\":15,\"inscritos\":14,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 6, 66, '2026-09-27 12:37:25'),
(27, 'V-15854429', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5012,\"docente_cedula\":\"V-15854429\",\"nombre\":\"FUNDAMENTOS DE LA ECONOMÍA AGRÍCOLA\",\"horasSemanal\":2,\"horasLapso\":2,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":10,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 2, 2, '2026-09-27 12:37:25'),
(28, 'V-11227590', '2026-I', 'Agroindustrial', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5013,\"docente_cedula\":\"V-11227590\",\"nombre\":\"LEGISLACIÓN EDUCATIVA AGRARIA\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5014,\"docente_cedula\":\"V-11227590\",\"nombre\":\"GERENCIA Y LEGISLACIÓN\",\"horasSemanal\":4,\"horasLapso\":7,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"3\",\"cupos\":10,\"inscritos\":3,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 7, 52, '2026-09-27 12:37:25'),
(29, 'V-14459970', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5015,\"docente_cedula\":\"V-14459970\",\"nombre\":\"LEGISTACION COMPARADA EN CONTEXTOS INTERCULTURALES\",\"horasSemanal\":2,\"horasLapso\":2,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":24,\"inscritos\":20,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 2, 2, '2026-09-27 12:37:25'),
(30, 'V-15194091', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5016,\"docente_cedula\":\"V-15194091\",\"nombre\":\"EDUCACIÓN INTERCULTURAL EN EL NIVEL INICIAL\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"1\",\"cupos\":25,\"inscritos\":8,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5017,\"docente_cedula\":\"V-15194091\",\"nombre\":\"EDUCACIÓN PARA LA CIUDADANÍA\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"6\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 5, 75, '2026-09-27 12:37:25'),
(31, 'V-15194092', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5018,\"docente_cedula\":\"V-15194092\",\"nombre\":\"ATENCIÓN EN ESPACIOS DE FAMILIA Y COMUNIDAD\",\"horasSemanal\":4,\"horasLapso\":9,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"6\",\"cupos\":35,\"inscritos\":15,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 9, '2026-09-27 12:37:25'),
(32, 'V-5664717', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5019,\"docente_cedula\":\"V-5664717\",\"nombre\":\"ATENCIÓN EN ESPACIOS DE FAMILIA Y COMUNIDAD\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"28\",\"cupos\":35,\"inscritos\":13,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(33, 'V-16280709', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5021,\"docente_cedula\":\"V-16280709\",\"nombre\":\"LEGISTACION COMPARADA EN CONTEXTOS INTERCULTURALES\",\"horasSemanal\":2,\"horasLapso\":2,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":11,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 2, 2, '2026-09-27 12:37:25'),
(34, 'V-15881390', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5022,\"docente_cedula\":\"V-15881390\",\"nombre\":\"ECOPEDAGOGÍA\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"25\",\"cupos\":35,\"inscritos\":2,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5023,\"docente_cedula\":\"V-15881390\",\"nombre\":\"EDUCACIÓN AMBIENTAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 7, 105, '2026-09-27 12:37:25'),
(35, 'V-15881391', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5024,\"docente_cedula\":\"V-15881391\",\"nombre\":\"EDUCACIÓN AMBIENTAL\",\"horasSemanal\":4,\"horasLapso\":11,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"6\",\"cupos\":25,\"inscritos\":3,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 11, '2026-09-27 12:37:25'),
(36, 'V-10175284', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5025,\"docente_cedula\":\"V-10175284\",\"nombre\":\"EDUCACIÓN AMBIENTAL\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"73\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(37, 'V-17690526', '2026-I', 'Ciencias Sociales', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5026,\"docente_cedula\":\"V-17690526\",\"nombre\":\"DINÁMICA DEL ESPACIO GEOGRÁFICO\",\"horasSemanal\":2,\"horasLapso\":2,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"80\",\"cupos\":10,\"inscritos\":9,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 2, 2, '2026-09-27 12:37:25'),
(38, 'V-12580917', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5027,\"docente_cedula\":\"V-12580917\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"80\",\"cupos\":10,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5028,\"docente_cedula\":\"V-12580917\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"80\",\"cupos\":10,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(39, 'V-27815133', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5312,\"docente_cedula\":\"V-27815133\",\"nombre\":\"RECREACIÓN\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"6\",\"cupos\":25,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5313,\"docente_cedula\":\"V-27815133\",\"nombre\":\"FUNDAMENTOS DE EDUCACIÓN FÍSICA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"16\",\"cupos\":40,\"inscritos\":38,\"cohorte\":\"2026\",\"periodoAcademico\":\"2026-II\"}]', 6, 90, '2026-10-12 17:58:48'),
(40, 'V-26988792', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5031,\"docente_cedula\":\"V-26988792\",\"nombre\":\"PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"4\",\"cupos\":25,\"inscritos\":13,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(41, 'V-17493851', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5032,\"docente_cedula\":\"V-17493851\",\"nombre\":\"TIC IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"90\",\"cupos\":5,\"inscritos\":3,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5033,\"docente_cedula\":\"V-17493851\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"11\",\"cupos\":20,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 72, '2026-09-27 12:37:25'),
(42, 'V-5283350', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5314,\"docente_cedula\":\"V-5283350\",\"nombre\":\"RECREACIÓN\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"2\",\"cupos\":10,\"inscritos\":5,\"cohorte\":\"2021\",\"periodoAcademico\":\"2026-II\"},{\"id\":5315,\"docente_cedula\":\"V-5283350\",\"nombre\":\"RECREACIÓN\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"1\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2021\",\"periodoAcademico\":\"2026-II\"},{\"id\":5316,\"docente_cedula\":\"V-5283350\",\"nombre\":\"RECREACIÓN\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"90\",\"cupos\":5,\"inscritos\":3,\"cohorte\":\"2021\",\"periodoAcademico\":\"2026-II\"}]', 6, 90, '2026-10-12 21:27:02'),
(43, 'V-18378499', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5037,\"docente_cedula\":\"V-18378499\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":15,\"inscritos\":11,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5068,\"docente_cedula\":\"V-18378499\",\"nombre\":\"RECREACIÓN\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"54\",\"cupos\":10,\"inscritos\":8,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5069,\"docente_cedula\":\"V-18378499\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":20,\"inscritos\":20,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5070,\"docente_cedula\":\"V-18378499\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":10,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"53\",\"cupos\":20,\"inscritos\":16,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 14, 160, '2026-09-27 12:37:25'),
(44, 'V-5730272', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5038,\"docente_cedula\":\"V-5730272\",\"nombre\":\"RECREACIÓN\",\"horasSemanal\":2,\"horasLapso\":6,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"73\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 2, 6, '2026-09-27 12:37:25'),
(45, 'V-5445501', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5039,\"docente_cedula\":\"V-5445501\",\"nombre\":\"TALLER BÁSICO RURAL I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5040,\"docente_cedula\":\"V-5445501\",\"nombre\":\"CIENCIAS INTEGRADAS\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"70\",\"cupos\":16,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(46, 'V-24784953', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5041,\"docente_cedula\":\"V-24784953\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"27\",\"cupos\":12,\"inscritos\":9,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5042,\"docente_cedula\":\"V-24784953\",\"nombre\":\"KINESIOLOGÍA EN LA EDUCACIÓN FÍSICA\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"28\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5043,\"docente_cedula\":\"V-24784953\",\"nombre\":\"FUNDAMENTOS DE EDUCACIÓN FÍSICA\",\"horasSemanal\":4,\"horasLapso\":18,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"31\",\"cupos\":26,\"inscritos\":26,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 10, 108, '2026-09-27 12:37:25'),
(47, 'V-12517701', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5044,\"docente_cedula\":\"V-12517701\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"8\",\"cupos\":12,\"inscritos\":7,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5045,\"docente_cedula\":\"V-12517701\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"9\",\"cupos\":20,\"inscritos\":19,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(48, 'V-26788603', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5046,\"docente_cedula\":\"V-26788603\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"25\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5047,\"docente_cedula\":\"V-26788603\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"27\",\"cupos\":10,\"inscritos\":2,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(49, 'V-26675072', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5048,\"docente_cedula\":\"V-26675072\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"27\",\"cupos\":25,\"inscritos\":8,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5049,\"docente_cedula\":\"V-26675072\",\"nombre\":\"RITMO Y EXPRESIÓN CORPORAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"27\",\"cupos\":25,\"inscritos\":8,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5050,\"docente_cedula\":\"V-26675072\",\"nombre\":\"EDUCACIÓN FÍSICA Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"29\",\"cupos\":25,\"inscritos\":9,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5051,\"docente_cedula\":\"V-26675072\",\"nombre\":\"LÚDICA Y MOTRICIDAD\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"30\",\"cupos\":25,\"inscritos\":4,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5052,\"docente_cedula\":\"V-26675072\",\"nombre\":\"PREPARACIÓN FÍSICA BÁSICA\",\"horasSemanal\":2,\"horasLapso\":16,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"31\",\"cupos\":26,\"inscritos\":26,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5094,\"docente_cedula\":\"V-26675072\",\"nombre\":\"RITMO Y EXPRESIÓN CORPORAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"100\",\"cupos\":10,\"inscritos\":8,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5095,\"docente_cedula\":\"V-26675072\",\"nombre\":\"RITMO Y EXPRESIÓN CORPORAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"4\",\"cupos\":25,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5096,\"docente_cedula\":\"V-26675072\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"90\",\"cupos\":8,\"inscritos\":4,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5097,\"docente_cedula\":\"V-26675072\",\"nombre\":\"RITMO Y EXPRESIÓN CORPORAL\",\"horasSemanal\":4,\"horasLapso\":16,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"91\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 32, 422, '2026-09-27 12:37:25'),
(50, 'V-16420045', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5053,\"docente_cedula\":\"V-16420045\",\"nombre\":\"ACTIVIDAD FÍSICA PARA EL ADULTO MAYOR\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"1\",\"cupos\":25,\"inscritos\":10,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5054,\"docente_cedula\":\"V-16420045\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":7,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"90\",\"cupos\":25,\"inscritos\":4,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 7, 52, '2026-09-27 12:37:25'),
(51, 'V-13303740', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5055,\"docente_cedula\":\"V-13303740\",\"nombre\":\"SALUD PREVENTIVA\",\"horasSemanal\":3,\"horasLapso\":3,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"25\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 3, 3, '2026-09-27 12:37:25'),
(52, 'V-13999784', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5056,\"docente_cedula\":\"V-13999784\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"8\",\"cupos\":25,\"inscritos\":8,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5057,\"docente_cedula\":\"V-13999784\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"8\",\"cupos\":15,\"inscritos\":12,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(53, 'V-19540028', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5058,\"docente_cedula\":\"V-19540028\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"4\",\"cupos\":25,\"inscritos\":13,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5059,\"docente_cedula\":\"V-19540028\",\"nombre\":\"EDUCACIÓN FÍSICA Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"8\",\"cupos\":30,\"inscritos\":14,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 72, '2026-09-27 12:37:25'),
(54, 'V-15438777', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5321,\"docente_cedula\":\"V-15438777\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"4\",\"cupos\":25,\"inscritos\":17,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5322,\"docente_cedula\":\"V-15438777\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"7\",\"cupos\":30,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 120, '2026-10-12 21:30:33'),
(55, 'V-17493024', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5064,\"docente_cedula\":\"V-17493024\",\"nombre\":\"TEORÍA Y PRÁCTICA DE LA MOTRICIDAD HUMANA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"10\",\"cupos\":30,\"inscritos\":24,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5065,\"docente_cedula\":\"V-17493024\",\"nombre\":\"TEORÍA Y PRÁCTICA DE LA MOTRICIDAD HUMANA\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"12\",\"cupos\":30,\"inscritos\":12,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(56, 'V-9146291', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5066,\"docente_cedula\":\"V-9146291\",\"nombre\":\"GESTIÓN EN ESCENARIOS ALTERNATIVOS DE APRENDIZAJE\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"5\",\"cupos\":6,\"inscritos\":5,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5067,\"docente_cedula\":\"V-9146291\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":7,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"4\",\"cupos\":10,\"inscritos\":10,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 7, 52, '2026-09-27 12:37:25'),
(57, 'V-18228922', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5071,\"docente_cedula\":\"V-18228922\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"4\",\"cupos\":15,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5072,\"docente_cedula\":\"V-18228922\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"2\",\"cupos\":15,\"inscritos\":15,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 72, '2026-09-27 12:37:25'),
(58, 'V-14217854', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5073,\"docente_cedula\":\"V-14217854\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"14\",\"cupos\":25,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5074,\"docente_cedula\":\"V-14217854\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"15\",\"cupos\":20,\"inscritos\":15,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(59, 'V-27815121', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5075,\"docente_cedula\":\"V-27815121\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"7\",\"cupos\":25,\"inscritos\":4,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5076,\"docente_cedula\":\"V-27815121\",\"nombre\":\"FUNDAMENTOS DE EDUCACIÓN FÍSICA\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"14\",\"cupos\":40,\"inscritos\":33,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(60, 'V-7899241', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5077,\"docente_cedula\":\"V-7899241\",\"nombre\":\"TIC IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"73\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5078,\"docente_cedula\":\"V-7899241\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":15,\"inscritos\":7,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(61, 'V-9467304', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5257,\"docente_cedula\":\"V-9467304\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5258,\"docente_cedula\":\"V-9467304\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"\",\"cupos\":0,\"inscritos\":0,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 120, '2026-09-27 14:50:19'),
(62, 'V-19034337', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5079,\"docente_cedula\":\"V-19034337\",\"nombre\":\"EDUCACIÓN FÍSICA EN ESPACIOS NO CONVENCIONALES\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"1\",\"cupos\":25,\"inscritos\":9,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5080,\"docente_cedula\":\"V-19034337\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":7,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"7\",\"cupos\":8,\"inscritos\":2,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 7, 52, '2026-09-27 12:37:25'),
(63, 'V-24745310', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5081,\"docente_cedula\":\"V-24745310\",\"nombre\":\"DIDÁCTICA DE LA INFORMÁTICA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"27\",\"cupos\":12,\"inscritos\":8,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5082,\"docente_cedula\":\"V-24745310\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"27\",\"cupos\":25,\"inscritos\":15,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5083,\"docente_cedula\":\"V-24745310\",\"nombre\":\"DESARROLLO INFANTIL II PREESCOLAR\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"29\",\"cupos\":35,\"inscritos\":6,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 12, 132, '2026-09-27 12:37:25'),
(64, 'V-14932020', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5084,\"docente_cedula\":\"V-14932020\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"80\",\"cupos\":10,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(65, 'V-12517032', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5085,\"docente_cedula\":\"V-12517032\",\"nombre\":\"DISEÑO INSTRUCCIONAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"27\",\"cupos\":12,\"inscritos\":7,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5086,\"docente_cedula\":\"V-12517032\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"29\",\"cupos\":30,\"inscritos\":22,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5087,\"docente_cedula\":\"V-12517032\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"30\",\"cupos\":15,\"inscritos\":14,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5088,\"docente_cedula\":\"V-12517032\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":16,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"31\",\"cupos\":26,\"inscritos\":26,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 16, 196, '2026-09-27 12:37:25'),
(66, 'V-19541018', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5089,\"docente_cedula\":\"V-19541018\",\"nombre\":\"SALUD PREVENTIVA\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":5,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5090,\"docente_cedula\":\"V-19541018\",\"nombre\":\"INTERDISCIPLINARIEDAD EN LA ENSEÑANZA APRENDIZAJE DE LA CIENCIA\",\"horasSemanal\":3,\"horasLapso\":6,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"1\",\"cupos\":25,\"inscritos\":12,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 6, 51, '2026-09-27 12:37:25'),
(67, 'V-18010032', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5091,\"docente_cedula\":\"V-18010032\",\"nombre\":\"PREVENCIÓN Y GESTIÓN DE RIESGO\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"6\",\"cupos\":25,\"inscritos\":4,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5092,\"docente_cedula\":\"V-18010032\",\"nombre\":\"CIENCIAS NATURALES\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"8\",\"cupos\":30,\"inscritos\":13,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5093,\"docente_cedula\":\"V-18010032\",\"nombre\":\"ANATOMÍA Y FISIOLOGÍA HUMANA\",\"horasSemanal\":4,\"horasLapso\":10,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"16\",\"cupos\":48,\"inscritos\":48,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 10, 100, '2026-09-27 12:37:25'),
(68, 'V-18959604', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5098,\"docente_cedula\":\"V-18959604\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"16\",\"cupos\":20,\"inscritos\":18,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5099,\"docente_cedula\":\"V-18959604\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"17\",\"cupos\":15,\"inscritos\":14,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(69, 'V-17877028', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5100,\"docente_cedula\":\"V-17877028\",\"nombre\":\"CIENCIA, TECNOLOGÍA Y SOCIEDAD\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Matemática\",\"seccion\":\"7\",\"cupos\":15,\"inscritos\":10,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5101,\"docente_cedula\":\"V-17877028\",\"nombre\":\"TIC I\",\"horasSemanal\":4,\"horasLapso\":6,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"18\",\"cupos\":20,\"inscritos\":15,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 6, 36, '2026-09-27 12:37:25'),
(70, 'V-15001066', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5102,\"docente_cedula\":\"V-15001066\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"6\",\"cupos\":15,\"inscritos\":12,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(71, 'V-17491868', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5103,\"docente_cedula\":\"V-17491868\",\"nombre\":\"BASES CIENTÍFICAS DE LA ACTIVIDAD FÍSICA\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"3\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5104,\"docente_cedula\":\"V-17491868\",\"nombre\":\"ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"91\",\"cupos\":25,\"inscritos\":2,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5105,\"docente_cedula\":\"V-17491868\",\"nombre\":\"PREPARACIÓN FÍSICA BÁSICA\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"14\",\"cupos\":42,\"inscritos\":42,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5106,\"docente_cedula\":\"V-17491868\",\"nombre\":\"PREPARACIÓN FÍSICA BÁSICA\",\"horasSemanal\":2,\"horasLapso\":10,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"16\",\"cupos\":45,\"inscritos\":42,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 10, 130, '2026-09-27 12:37:25'),
(72, 'V-15989092', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5107,\"docente_cedula\":\"V-15989092\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"25\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5108,\"docente_cedula\":\"V-15989092\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"27\",\"cupos\":15,\"inscritos\":10,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5109,\"docente_cedula\":\"V-15989092\",\"nombre\":\"TECNOLOGÍAS E INNOVACIONES EDUCATIVAS\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"27\",\"cupos\":12,\"inscritos\":8,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5110,\"docente_cedula\":\"V-15989092\",\"nombre\":\"PROGRAMACIÓN II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"28\",\"cupos\":12,\"inscritos\":3,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5111,\"docente_cedula\":\"V-15989092\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"26\",\"cupos\":12,\"inscritos\":3,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5112,\"docente_cedula\":\"V-15989092\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"28\",\"cupos\":12,\"inscritos\":4,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5113,\"docente_cedula\":\"V-15989092\",\"nombre\":\"TIC II\",\"horasSemanal\":4,\"horasLapso\":44,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"29\",\"cupos\":25,\"inscritos\":9,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 26, 374, '2026-09-27 12:37:25'),
(73, 'V-13302649', '2026-I', 'Matemática', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5114,\"docente_cedula\":\"V-13302649\",\"nombre\":\"PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"100\",\"cupos\":10,\"inscritos\":8,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5115,\"docente_cedula\":\"V-13302649\",\"nombre\":\"PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"91\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(74, 'V-9469345', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5117,\"docente_cedula\":\"V-9469345\",\"nombre\":\"ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"2\",\"cupos\":25,\"inscritos\":4,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5118,\"docente_cedula\":\"V-9469345\",\"nombre\":\"ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE\",\"horasSemanal\":2,\"horasLapso\":4,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"6\",\"cupos\":8,\"inscritos\":3,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 34, '2026-09-27 12:37:25'),
(75, 'V-23742852', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5119,\"docente_cedula\":\"V-23742852\",\"nombre\":\"ORIENTACIÓN EDUCATIVA Y DIVERSIDAD\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"73\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5120,\"docente_cedula\":\"V-23742852\",\"nombre\":\"EVALUACIÓN DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":15,\"inscritos\":12,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(76, 'V-16960486', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5121,\"docente_cedula\":\"V-16960486\",\"nombre\":\"DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":7,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 8, '2026-09-27 12:37:25'),
(77, 'V-16885441', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5122,\"docente_cedula\":\"V-16885441\",\"nombre\":\"FUNDAMENTOS SOCIOLÓGICOS DE LA EDUCACIÓN RURAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":11,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5123,\"docente_cedula\":\"V-16885441\",\"nombre\":\"PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":9,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5124,\"docente_cedula\":\"V-16885441\",\"nombre\":\"SOCIEDAD Y EDUCACIÓN\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"70\",\"cupos\":16,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 12, 132, '2026-09-27 12:37:25');
INSERT INTO `cargas_historicas` (`id`, `cedula_docente`, `periodoAcademico`, `department`, `status`, `semanas`, `fechaDesde`, `fechaHasta`, `materias`, `totalHorasSemanal`, `totalHorasLapso`, `fechaRegistro`) VALUES
(78, 'V-25463412', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5125,\"docente_cedula\":\"V-25463412\",\"nombre\":\"PRÁCTICA PROFESIONAL IV\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"25\",\"cupos\":15,\"inscritos\":3,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5126,\"docente_cedula\":\"V-25463412\",\"nombre\":\"ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"26\",\"cupos\":35,\"inscritos\":2,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5127,\"docente_cedula\":\"V-25463412\",\"nombre\":\"DIDÁCTICA DE LA EDUCACIÓN PREESCOLAR\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"27\",\"cupos\":35,\"inscritos\":12,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5128,\"docente_cedula\":\"V-25463412\",\"nombre\":\"TRANSICIÓN DE PREESCOLAR  A PRIMER GRADO\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"27\",\"cupos\":35,\"inscritos\":6,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5129,\"docente_cedula\":\"V-25463412\",\"nombre\":\"DIDÁCTICA DE LA CANCIÓN INFANTIL\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"28\",\"cupos\":35,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5130,\"docente_cedula\":\"V-25463412\",\"nombre\":\"ATENCIÓN INTEGRAL DEL INFANTE DE 0 A 6 AÑOS\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"28\",\"cupos\":35,\"inscritos\":12,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5131,\"docente_cedula\":\"V-25463412\",\"nombre\":\"ETAPAS Y DESARROLLO EMOCIONAL INFANTIL\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"29\",\"cupos\":35,\"inscritos\":7,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5132,\"docente_cedula\":\"V-25463412\",\"nombre\":\"DESARROLLO INFANTIL I MATERNAL\",\"horasSemanal\":4,\"horasLapso\":28,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"30\",\"cupos\":35,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 28, 388, '2026-09-27 12:37:25'),
(79, 'V-11111242', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5278,\"docente_cedula\":\"V-11111242\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Integral\",\"seccion\":\"U\",\"cupos\":25,\"inscritos\":20,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 60, '2026-09-27 12:37:25'),
(80, 'V-13303484', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5135,\"docente_cedula\":\"V-13303484\",\"nombre\":\"EDUCACIÓN Y DERECHOS HUMANOS\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":5,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5136,\"docente_cedula\":\"V-13303484\",\"nombre\":\"FORMACIÓN PERSONAL DEL DOCENTE\",\"horasSemanal\":2,\"horasLapso\":5,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"3\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 5, 50, '2026-09-27 12:37:25'),
(81, 'V-9006286', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5137,\"docente_cedula\":\"V-9006286\",\"nombre\":\"EVALUACIÓN DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":20,\"inscritos\":19,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5138,\"docente_cedula\":\"V-9006286\",\"nombre\":\"EVALUACIÓN DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"53\",\"cupos\":20,\"inscritos\":17,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(82, 'V-16420771', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5139,\"docente_cedula\":\"V-16420771\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"11\",\"cupos\":20,\"inscritos\":19,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(83, 'V-4989176', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5140,\"docente_cedula\":\"V-4989176\",\"nombre\":\"DIDÁCTICA GENERAL\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":11,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(84, 'V-16409642', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5141,\"docente_cedula\":\"V-16409642\",\"nombre\":\"FORMACIÓN PERSONAL DEL DOCENTE\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"26\",\"cupos\":35,\"inscritos\":3,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5142,\"docente_cedula\":\"V-16409642\",\"nombre\":\"NEUROCIENCIA Y EDUCACIÓN\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"26\",\"cupos\":35,\"inscritos\":4,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5143,\"docente_cedula\":\"V-16409642\",\"nombre\":\"EVALUACIÓN DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"27\",\"cupos\":10,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5144,\"docente_cedula\":\"V-16409642\",\"nombre\":\"ATENCIÓN A NIÑOS Y JÓVENES CON DISCAPACIDAD\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"27\",\"cupos\":25,\"inscritos\":15,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5145,\"docente_cedula\":\"V-16409642\",\"nombre\":\"PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"30\",\"cupos\":25,\"inscritos\":6,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5146,\"docente_cedula\":\"V-16409642\",\"nombre\":\"PRÁCTICA PROFESIONAL I\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"29\",\"cupos\":16,\"inscritos\":14,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5147,\"docente_cedula\":\"V-16409642\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"29\",\"cupos\":30,\"inscritos\":21,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5148,\"docente_cedula\":\"V-16409642\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":32,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"31\",\"cupos\":26,\"inscritos\":26,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 32, 452, '2026-09-27 12:37:25'),
(85, 'V-18374498', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5152,\"docente_cedula\":\"V-18374498\",\"nombre\":\"INVESTIGACIÓN IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"73\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5153,\"docente_cedula\":\"V-18374498\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":15,\"inscritos\":7,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5154,\"docente_cedula\":\"V-18374498\",\"nombre\":\"INVESTIGACIÓN II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":10,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5155,\"docente_cedula\":\"V-18374498\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":16,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"70\",\"cupos\":16,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 16, 196, '2026-09-27 12:37:25'),
(86, 'V-12526013', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5156,\"docente_cedula\":\"V-12526013\",\"nombre\":\"DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":5,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(87, 'V-9233889', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5157,\"docente_cedula\":\"V-9233889\",\"nombre\":\"EVALUACIÓN DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"80\",\"cupos\":10,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(88, 'V-5283288', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5158,\"docente_cedula\":\"V-5283288\",\"nombre\":\"EXPRESIÓN ORAL Y ESCRITA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"9\",\"cupos\":30,\"inscritos\":14,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5159,\"docente_cedula\":\"V-5283288\",\"nombre\":\"INTRODUCCIÓN AL ESTUDIO DE LA LENGUA\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"10\",\"cupos\":35,\"inscritos\":33,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(89, 'V-27601669', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5160,\"docente_cedula\":\"V-27601669\",\"nombre\":\"AULA CULTURAL INTERACTIVA\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"3\",\"cupos\":10,\"inscritos\":3,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(90, 'V-13283938', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5161,\"docente_cedula\":\"V-13283938\",\"nombre\":\"EDUCACIÓN BIOÉTICA Y DERECHOS HUMANOS\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"4\",\"cupos\":25,\"inscritos\":13,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5162,\"docente_cedula\":\"V-13283938\",\"nombre\":\"PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"10\",\"cupos\":30,\"inscritos\":29,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5163,\"docente_cedula\":\"V-13283938\",\"nombre\":\"PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"12\",\"cupos\":30,\"inscritos\":15,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5164,\"docente_cedula\":\"V-13283938\",\"nombre\":\"PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO\",\"horasSemanal\":4,\"horasLapso\":14,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"8\",\"cupos\":38,\"inscritos\":36,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 14, 164, '2026-09-27 12:37:25'),
(91, 'V-9952315', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5165,\"docente_cedula\":\"V-9952315\",\"nombre\":\"PEDAGOGÍA DE LA MÚSICA II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"80\",\"cupos\":10,\"inscritos\":9,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5166,\"docente_cedula\":\"V-9952315\",\"nombre\":\"PRÁCTICA MUSICAL I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"81\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5167,\"docente_cedula\":\"V-9952315\",\"nombre\":\"PRÁCTICA MUSICAL II\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"80\",\"cupos\":10,\"inscritos\":9,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 12, 132, '2026-09-27 12:37:25'),
(92, 'V-13145093', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5168,\"docente_cedula\":\"V-13145093\",\"nombre\":\"COMPETENCIAS GERENCIALES EN EL CONTEXTO EDUCATIVO\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"26\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5169,\"docente_cedula\":\"V-13145093\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":14,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"27\",\"cupos\":12,\"inscritos\":8,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 6, 44, '2026-09-27 12:37:25'),
(93, 'V-22726478', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5170,\"docente_cedula\":\"V-22726478\",\"nombre\":\"DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"25\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5171,\"docente_cedula\":\"V-22726478\",\"nombre\":\"DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS\",\"horasSemanal\":4,\"horasLapso\":12,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"28\",\"cupos\":35,\"inscritos\":6,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 8, 72, '2026-09-27 12:37:25'),
(94, 'V-14599710', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5172,\"docente_cedula\":\"V-14599710\",\"nombre\":\"INVESTIGACIÓN IV\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"54\",\"cupos\":10,\"inscritos\":8,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:25'),
(95, 'V-17912463', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5173,\"docente_cedula\":\"V-17912463\",\"nombre\":\"PLANIFICACIÓN POR PROYECTO\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":10,\"inscritos\":3,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5174,\"docente_cedula\":\"V-17912463\",\"nombre\":\"PRÁCTICA PROFESIONAL II\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":10,\"inscritos\":6,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5175,\"docente_cedula\":\"V-17912463\",\"nombre\":\"PRÁCTICA PROFESIONAL I\",\"horasSemanal\":6,\"horasLapso\":14,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":10,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 14, 134, '2026-09-27 12:37:25'),
(96, 'V-13582199', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5176,\"docente_cedula\":\"V-13582199\",\"nombre\":\"RECURSOS PARA EL APRENDIZAJE\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"55\",\"cupos\":10,\"inscritos\":4,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5177,\"docente_cedula\":\"V-13582199\",\"nombre\":\"PLANIFICACIÓN POR PROYECTO\",\"horasSemanal\":2,\"horasLapso\":5,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 5, 50, '2026-09-27 12:37:25'),
(97, 'V-13038785', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5178,\"docente_cedula\":\"V-13038785\",\"nombre\":\"RECURSOS DIDÁCTICOS PARA LA EDUCACIÓN INICIAL\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"30\",\"cupos\":35,\"inscritos\":15,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5179,\"docente_cedula\":\"V-13038785\",\"nombre\":\"PRÁCTICA PROFESIONAL IV\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"25\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5180,\"docente_cedula\":\"V-13038785\",\"nombre\":\"EVALUACIÓN DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"27\",\"cupos\":12,\"inscritos\":7,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5181,\"docente_cedula\":\"V-13038785\",\"nombre\":\"INTERDISCIPLINARIEDAD EN LA ENSEÑANZA APRENDIZAJE DE LA CIENCIA\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"25\",\"cupos\":35,\"inscritos\":3,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5182,\"docente_cedula\":\"V-13038785\",\"nombre\":\"CIENCIAS NATURALES\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"28\",\"cupos\":25,\"inscritos\":13,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5183,\"docente_cedula\":\"V-13038785\",\"nombre\":\"PRÁCTICA PROFESIONAL I\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"30\",\"cupos\":25,\"inscritos\":4,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5184,\"docente_cedula\":\"V-13038785\",\"nombre\":\"REPERTORIO TRADICIONAL VENEZOLANO\",\"horasSemanal\":2,\"horasLapso\":33,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"29\",\"cupos\":30,\"inscritos\":24,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 27, 408, '2026-09-27 12:37:25'),
(98, 'V-9462613', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5185,\"docente_cedula\":\"V-9462613\",\"nombre\":\"ORIENTACIÓN EDUCATIVA Y DIVERSIDAD\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"2\",\"cupos\":9,\"inscritos\":3,\"cohorte\":\"2021\",\"periodoAcademico\":\"2026-II\"},{\"id\":5186,\"docente_cedula\":\"V-9462613\",\"nombre\":\"ORIENTACIÓN EDUCATIVA Y DIVERSIDAD\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2021\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(99, 'V-4447061', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5187,\"docente_cedula\":\"V-4447061\",\"nombre\":\"CALENDARIO FESTIVO VENEZOLANO\",\"horasSemanal\":2,\"horasLapso\":2,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"3\",\"cupos\":10,\"inscritos\":3,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 2, 2, '2026-09-27 12:37:25'),
(100, 'V-16377845', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5188,\"docente_cedula\":\"V-16377845\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":20,\"inscritos\":20,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5189,\"docente_cedula\":\"V-16377845\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"53\",\"cupos\":20,\"inscritos\":16,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:25'),
(101, 'V-13821819', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5190,\"docente_cedula\":\"V-13821819\",\"nombre\":\"PRODUCCIÓN DE EVENTOS ARTÍSTICOS\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"3\",\"cupos\":10,\"inscritos\":6,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5191,\"docente_cedula\":\"V-13821819\",\"nombre\":\"EDUCACIÓN PARA LA PAZ\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"6\",\"cupos\":35,\"inscritos\":17,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5192,\"docente_cedula\":\"V-13821819\",\"nombre\":\"EDUCACIÓN PARA LA PAZ\",\"horasSemanal\":2,\"horasLapso\":6,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"7\",\"cupos\":35,\"inscritos\":20,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 6, 66, '2026-09-27 12:37:25'),
(102, 'V-11106623', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5193,\"docente_cedula\":\"V-11106623\",\"nombre\":\"SOFTWARE EN EDUCACIÓN MUSICAL\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"26\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(103, 'V-14217306', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5194,\"docente_cedula\":\"V-14217306\",\"nombre\":\"DESARROLLO DE PROCESOS COGNITIVOS\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"1\",\"cupos\":30,\"inscritos\":28,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5195,\"docente_cedula\":\"V-14217306\",\"nombre\":\"DESARROLLO DE PROCESOS COGNITIVOS\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Socioproductiva\",\"seccion\":\"2\",\"cupos\":15,\"inscritos\":7,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(104, 'V-23544042', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5197,\"docente_cedula\":\"V-23544042\",\"nombre\":\"AULA MUSICAL INTERACTIVA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"5\",\"cupos\":10,\"inscritos\":6,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5198,\"docente_cedula\":\"V-23544042\",\"nombre\":\"INTERPRETACIÓN Y CREATIVIDAD MUSICAL\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"5\",\"cupos\":10,\"inscritos\":5,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(105, 'V-26841404', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5199,\"docente_cedula\":\"V-26841404\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Informática\",\"seccion\":\"10\",\"cupos\":12,\"inscritos\":6,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5200,\"docente_cedula\":\"V-26841404\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"7\",\"cupos\":15,\"inscritos\":6,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(106, 'V-14688545', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5201,\"docente_cedula\":\"V-14688545\",\"nombre\":\"NEUROMÚSICA\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"2\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2021\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(107, 'V-19899866', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5202,\"docente_cedula\":\"V-19899866\",\"nombre\":\"PRÁCTICA PROFESIONAL IV\",\"horasSemanal\":6,\"horasLapso\":90,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"55\",\"cupos\":10,\"inscritos\":4,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5203,\"docente_cedula\":\"V-19899866\",\"nombre\":\"TIC IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"54\",\"cupos\":10,\"inscritos\":8,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5204,\"docente_cedula\":\"V-19899866\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":20,\"inscritos\":19,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5205,\"docente_cedula\":\"V-19899866\",\"nombre\":\"TIC III\",\"horasSemanal\":4,\"horasLapso\":18,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"53\",\"cupos\":20,\"inscritos\":17,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 18, 228, '2026-09-27 12:37:26'),
(108, 'V-11296708', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5206,\"docente_cedula\":\"V-11296708\",\"nombre\":\"FUNDAMENTOS PARA LA ENSEÑANZA DE LA LECTURA Y LA ESCRITURA\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"55\",\"cupos\":10,\"inscritos\":3,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5207,\"docente_cedula\":\"V-11296708\",\"nombre\":\"EXPRESIÓN ORAL Y ESCRITA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5208,\"docente_cedula\":\"V-11296708\",\"nombre\":\"SOCIEDAD Y EDUCACIÓN\",\"horasSemanal\":4,\"horasLapso\":11,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 11, 116, '2026-09-27 12:37:26'),
(109, 'V-17493215', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5209,\"docente_cedula\":\"V-17493215\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"4\",\"cupos\":15,\"inscritos\":10,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5210,\"docente_cedula\":\"V-17493215\",\"nombre\":\"DESARROLLO INFANTIL II PREESCOLAR\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"8\",\"cupos\":35,\"inscritos\":33,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(110, 'V-16122526', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5211,\"docente_cedula\":\"V-16122526\",\"nombre\":\"TIC IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"26\",\"cupos\":15,\"inscritos\":1,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5212,\"docente_cedula\":\"V-16122526\",\"nombre\":\"TIC IV\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"25\",\"cupos\":25,\"inscritos\":1,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"},{\"id\":5213,\"docente_cedula\":\"V-16122526\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"27\",\"cupos\":25,\"inscritos\":15,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5214,\"docente_cedula\":\"V-16122526\",\"nombre\":\"EDUCACIÓN INCLUSIVA\",\"horasSemanal\":4,\"horasLapso\":24,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"26\",\"cupos\":35,\"inscritos\":2,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"}]', 16, 204, '2026-09-27 12:37:26'),
(111, 'V-16230119', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5215,\"docente_cedula\":\"V-16230119\",\"nombre\":\"PEDAGOGÍA DE LA MÚSICA II\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"27\",\"cupos\":10,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(112, 'V-14546907', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5216,\"docente_cedula\":\"V-14546907\",\"nombre\":\"SOFTWARE EN EDUCACIÓN MUSICAL\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"1\",\"cupos\":10,\"inscritos\":2,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(113, 'V-5662168', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5217,\"docente_cedula\":\"V-5662168\",\"nombre\":\"EXPRESIÓN ORAL Y ESCRITA\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"7\",\"cupos\":15,\"inscritos\":7,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5218,\"docente_cedula\":\"V-5662168\",\"nombre\":\"EXPRESIÓN ORAL Y ESCRITA\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"8\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(114, 'V-17875742', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5219,\"docente_cedula\":\"V-17875742\",\"nombre\":\"DESARROLLO CURRICULAR\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"8\",\"cupos\":25,\"inscritos\":11,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5220,\"docente_cedula\":\"V-17875742\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"90\",\"cupos\":15,\"inscritos\":4,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(115, 'V-25166850', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5221,\"docente_cedula\":\"V-25166850\",\"nombre\":\"JUEGOS DE MÚSICA Y EXPRESIÓN CORPORAL\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"3\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5222,\"docente_cedula\":\"V-25166850\",\"nombre\":\"DIDÁCTICA DE LA CANCIÓN INFANTIL\",\"horasSemanal\":2,\"horasLapso\":4,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":5,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 34, '2026-09-27 12:37:26'),
(116, 'V-13304865', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5223,\"docente_cedula\":\"V-13304865\",\"nombre\":\"INVESTIGACIÓN II\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"7\",\"cupos\":15,\"inscritos\":13,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(117, 'V-12228218', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5224,\"docente_cedula\":\"V-12228218\",\"nombre\":\"LECTURA Y ESCRITURA EN EDUCACIÓN INICIAL\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":9,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(118, 'V-13037358', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5225,\"docente_cedula\":\"V-13037358\",\"nombre\":\"DESARROLLO DE PROCESOS COGNITIVOS\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"11\",\"cupos\":40,\"inscritos\":37,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5226,\"docente_cedula\":\"V-13037358\",\"nombre\":\"DESARROLLO DE PROCESOS COGNITIVOS\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"8\",\"cupos\":15,\"inscritos\":13,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(119, 'V-5740172', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5227,\"docente_cedula\":\"V-5740172\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"18\",\"cupos\":20,\"inscritos\":15,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(120, 'V-14598279', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5228,\"docente_cedula\":\"V-14598279\",\"nombre\":\"SALUD INTEGRAL\",\"horasSemanal\":3,\"horasLapso\":45,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"55\",\"cupos\":10,\"inscritos\":3,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5229,\"docente_cedula\":\"V-14598279\",\"nombre\":\"DESARROLLO CURRICULAR\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":24,\"inscritos\":20,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5230,\"docente_cedula\":\"V-14598279\",\"nombre\":\"PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO\",\"horasSemanal\":4,\"horasLapso\":11,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"50\",\"cupos\":10,\"inscritos\":3,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 11, 116, '2026-09-27 12:37:26'),
(121, 'V-15880572', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5231,\"docente_cedula\":\"V-15880572\",\"nombre\":\"INVESTIGACIÓN II\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"6\",\"cupos\":15,\"inscritos\":15,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5232,\"docente_cedula\":\"V-15880572\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"11\",\"cupos\":20,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(122, 'V-7783686', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5233,\"docente_cedula\":\"V-7783686\",\"nombre\":\"PLANIFICACIÓN DE LA ENSEÑANZA Y DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"72\",\"cupos\":10,\"inscritos\":2,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5234,\"docente_cedula\":\"V-7783686\",\"nombre\":\"DESARROLLO CURRICULAR\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":11,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5235,\"docente_cedula\":\"V-7783686\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":9,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"},{\"id\":5236,\"docente_cedula\":\"V-7783686\",\"nombre\":\"DESARROLLO DE PROCESOS COGNITIVOS\",\"horasSemanal\":4,\"horasLapso\":16,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"70\",\"cupos\":16,\"inscritos\":16,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 16, 196, '2026-09-27 12:37:26'),
(123, 'V-16232048', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5237,\"docente_cedula\":\"V-16232048\",\"nombre\":\"NEUROCIENCIA Y EDUCACIÓN\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"3\",\"cupos\":25,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(124, 'V-9174995', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5238,\"docente_cedula\":\"V-9174995\",\"nombre\":\"PRÁCTICA PROFESIONAL IV\",\"horasSemanal\":6,\"horasLapso\":6,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"53\",\"cupos\":15,\"inscritos\":1,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"}]', 6, 6, '2026-09-27 12:37:26'),
(125, 'V-6030961', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5239,\"docente_cedula\":\"V-6030961\",\"nombre\":\"EXPRESIÓN ORAL Y ESCRITA\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"71\",\"cupos\":15,\"inscritos\":9,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(126, 'V-9338461', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5240,\"docente_cedula\":\"V-9338461\",\"nombre\":\"INVESTIGACIÓN II\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Geografía e Historia\",\"seccion\":\"8\",\"cupos\":12,\"inscritos\":7,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(127, 'V-11109284', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5241,\"docente_cedula\":\"V-11109284\",\"nombre\":\"INVESTIGACIÓN III\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"4\",\"cupos\":20,\"inscritos\":19,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"},{\"id\":5242,\"docente_cedula\":\"V-11109284\",\"nombre\":\"INVESTIGACIÓN II\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"6\",\"cupos\":15,\"inscritos\":8,\"cohorte\":\"2025\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(128, 'V-9129456', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5243,\"docente_cedula\":\"V-9129456\",\"nombre\":\"PROBLEMÁTICA SOCIAL Y APRENDIZAJE\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"3\",\"cupos\":11,\"inscritos\":4,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"},{\"id\":5244,\"docente_cedula\":\"V-9129456\",\"nombre\":\"PROBLEMÁTICA SOCIAL Y APRENDIZAJE\",\"horasSemanal\":2,\"horasLapso\":4,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"6\",\"cupos\":25,\"inscritos\":3,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 4, 34, '2026-09-27 12:37:26'),
(129, 'V-647952', '2026-I', 'Pedagogía', 'Activo', 15, '2026-05-21', '2026-11-30', '[{\"id\":5352,\"docente_cedula\":\"V-647952\",\"nombre\":\"ORIENTACIÓN EDUCATIVA Y DIVERSIDAD\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Física\",\"seccion\":\"2\",\"cupos\":25,\"inscritos\":13,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-I\"},{\"id\":5353,\"docente_cedula\":\"V-647952\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Agropecuaria\",\"seccion\":\"9\",\"cupos\":25,\"inscritos\":10,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-I\"}]', 8, 120, '2026-10-16 06:39:57'),
(130, 'V-13821947', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5247,\"docente_cedula\":\"V-13821947\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"13\",\"cupos\":25,\"inscritos\":18,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(131, 'V-13304171', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5248,\"docente_cedula\":\"V-13304171\",\"nombre\":\"INVESTIGACIÓN I\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Socioproductiva\",\"seccion\":\"2\",\"cupos\":15,\"inscritos\":7,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(132, 'V-19898013', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5249,\"docente_cedula\":\"V-19898013\",\"nombre\":\"ORIENTACIÓN EDUCATIVA Y DIVERSIDAD\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"54\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"},{\"id\":5250,\"docente_cedula\":\"V-19898013\",\"nombre\":\"PSICOLOGÍA DEL APRENDIZAJE\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Educación Rural\",\"seccion\":\"52\",\"cupos\":10,\"inscritos\":1,\"cohorte\":\"2024\",\"periodoAcademico\":\"2026-II\"}]', 8, 68, '2026-09-27 12:37:26'),
(133, 'V-16421138', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5251,\"docente_cedula\":\"V-16421138\",\"nombre\":\"ENSEÑANZA DE LA LITERATURA\",\"horasSemanal\":3,\"horasLapso\":3,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"1\",\"cupos\":10,\"inscritos\":7,\"cohorte\":\"2019\",\"periodoAcademico\":\"2026-II\"}]', 3, 3, '2026-09-27 12:37:26'),
(134, 'V-9141418', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5252,\"docente_cedula\":\"V-9141418\",\"nombre\":\"REPERTORIO TRADICIONAL VENEZOLANO\",\"horasSemanal\":2,\"horasLapso\":30,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"10\",\"cupos\":37,\"inscritos\":36,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"},{\"id\":5253,\"docente_cedula\":\"V-9141418\",\"nombre\":\"REPERTORIO TRADICIONAL VENEZOLANO\",\"horasSemanal\":2,\"horasLapso\":4,\"especialidadDestino\":\"Educación Musical\",\"seccion\":\"8\",\"cupos\":15,\"inscritos\":11,\"cohorte\":null,\"periodoAcademico\":\"2026-II\"}]', 4, 34, '2026-09-27 12:37:26'),
(135, 'V-21002582', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5254,\"docente_cedula\":\"V-21002582\",\"nombre\":\"EDUCACIÓN PARA LAS ARTES\",\"horasSemanal\":4,\"horasLapso\":4,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"6\",\"cupos\":15,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 4, '2026-09-27 12:37:26'),
(136, 'V-17491840', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5255,\"docente_cedula\":\"V-17491840\",\"nombre\":\"ORIENTACIÓN EDUCATIVA Y DIVERSIDAD\",\"horasSemanal\":4,\"horasLapso\":8,\"especialidadDestino\":\"Matemática\",\"seccion\":\"6\",\"cupos\":10,\"inscritos\":2,\"cohorte\":\"2023\",\"periodoAcademico\":\"2026-II\"}]', 4, 8, '2026-09-27 12:37:26'),
(137, 'V-16959033', '2026-I', 'Pedagogía', 'Por Revisar', 15, '2026-05-21', '2026-10-03', '[{\"id\":5256,\"docente_cedula\":\"V-16959033\",\"nombre\":\"PROYECTOS EDUCATIVOS\",\"horasSemanal\":3,\"horasLapso\":3,\"especialidadDestino\":\"Educación Primaria\",\"seccion\":\"5\",\"cupos\":25,\"inscritos\":5,\"cohorte\":\"2022\",\"periodoAcademico\":\"2026-II\"}]', 3, 3, '2026-09-27 12:37:26'),
(272, 'V-99999999', '2026-I', 'Matemática', 'Activo', 15, '2026-05-21', '2026-10-03', '[{\"nombre\":\"CÁLCULO I\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Matemática\"},{\"nombre\":\"ÁLGEBRA LINEAL\",\"horasSemanal\":4,\"horasLapso\":60,\"especialidadDestino\":\"Matemática\"}]', 8, 120, '2026-10-06 17:27:04'),
(402, 'V-77777777', '2026-I', 'Matemática', 'Validado', 15, '2026-05-21', '2026-10-03', '[{\"nombre\":\"CÁLCULO I\",\"horasSemanal\":4,\"horasLapso\":60,\"seccion\":\"A\",\"cupos\":30,\"inscritos\":25}]', 4, 60, '2026-10-09 07:09:30'),
(531, 'V-11105527', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(533, 'V-13230490', '2026-II', 'Matemática', 'Activo', 15, '2026-11-03', '2027-02-20', '[{\"nombre\":\"TIC IV\",\"especialidadDestino\":\"Matemática\",\"seccion\":\"10\",\"cupos\":20,\"inscritos\":10,\"cohorte\":\"2026\",\"horasSemanal\":4,\"horasLapso\":60,\"periodoAcademico\":\"2026-II\"},{\"nombre\":\"TIC IV\",\"especialidadDestino\":\"Artes Escénicas\",\"seccion\":\"10\",\"cupos\":10,\"inscritos\":10,\"cohorte\":\"\",\"horasSemanal\":4,\"horasLapso\":60,\"periodoAcademico\":\"2026-II\"}]', 8, 120, '2026-10-15 21:49:25'),
(535, 'V-19540281', '2026-II', 'Matemática', 'Activo', 15, '2026-11-03', '2027-02-20', '[{\"nombre\":\"TIC II\",\"especialidadDestino\":\"Educación Física\",\"seccion\":\"09\",\"cupos\":8,\"inscritos\":5,\"cohorte\":\"2022\",\"horasSemanal\":4,\"horasLapso\":60,\"periodoAcademico\":\"2026-II\"},{\"nombre\":\"TIC III\",\"especialidadDestino\":\"Educación Inicial\",\"seccion\":\"90\",\"cupos\":5,\"inscritos\":4,\"cohorte\":\"2026\",\"horasSemanal\":4,\"horasLapso\":60,\"periodoAcademico\":\"2026-II\"}]', 8, 120, '2026-10-16 06:47:55'),
(537, 'V-4074672', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(539, 'V-10157451', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(541, 'V-10175284', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(543, 'V-10481795', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(545, 'V-10683546', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(547, 'V-11106384', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(549, 'V-11106623', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(551, 'V-11109284', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(553, 'V-11111242', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(555, 'V-11227590', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(557, 'V-11296708', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(559, 'V-12228218', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(561, 'V-12517032', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(563, 'V-12517701', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(565, 'V-12526013', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(567, 'V-12580917', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(569, 'V-13037358', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(571, 'V-13038785', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(573, 'V-13145093', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(575, 'V-13283938', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(577, 'V-13302649', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(579, 'V-13303484', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(581, 'V-13303740', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(583, 'V-13304171', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(585, 'V-13304865', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(587, 'V-13582199', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(589, 'V-13821819', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(591, 'V-13821947', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(593, 'V-13999784', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(595, 'V-14217306', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(597, 'V-14217854', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(599, 'V-14459970', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(601, 'V-14546907', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(603, 'V-14598279', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(605, 'V-14599710', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(607, 'V-14688545', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(609, 'V-14776205', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(611, 'V-14932020', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(613, 'V-15001066', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(615, 'V-15194091', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(617, 'V-15194092', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(619, 'V-15438777', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(621, 'V-15854429', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(623, 'V-15880572', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(625, 'V-15881390', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53');
INSERT INTO `cargas_historicas` (`id`, `cedula_docente`, `periodoAcademico`, `department`, `status`, `semanas`, `fechaDesde`, `fechaHasta`, `materias`, `totalHorasSemanal`, `totalHorasLapso`, `fechaRegistro`) VALUES
(627, 'V-15881391', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(629, 'V-15989092', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(631, 'V-16122526', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(633, 'V-16230119', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(635, 'V-16232048', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(637, 'V-16280709', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(639, 'V-16377845', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(641, 'V-16409642', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(643, 'V-16420045', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(645, 'V-16420771', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(647, 'V-16421138', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(649, 'V-16885441', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(651, 'V-16959033', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(653, 'V-16960486', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(655, 'V-17491840', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(657, 'V-17491868', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(659, 'V-17493024', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:53'),
(661, 'V-17493215', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(663, 'V-17493851', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(665, 'V-17690526', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(667, 'V-17875742', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(669, 'V-17877028', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(671, 'V-17912463', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(673, 'V-17961246', '2026-II', 'Pedagogía', 'Activo', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 20:51:31'),
(675, 'V-18010032', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(677, 'V-18228922', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(679, 'V-18374498', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(681, 'V-18378499', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(683, 'V-18791204', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(685, 'V-18959604', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(687, 'V-19034337', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(689, 'V-19519008', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(691, 'V-19540028', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(693, 'V-19541018', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(695, 'V-19898013', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(697, 'V-19899866', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(699, 'V-21002582', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(701, 'V-22726478', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(703, 'V-23544042', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(705, 'V-23742852', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(707, 'V-24745310', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(709, 'V-24784953', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(711, 'V-24785261', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(713, 'V-25166850', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(715, 'V-25361458', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(717, 'V-25463412', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(719, 'V-26675072', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(721, 'V-26788603', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(723, 'V-26841404', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(725, 'V-26988792', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(727, 'V-27601669', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(729, 'V-27815121', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(731, 'V-27815133', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(733, 'V-4447061', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(735, 'V-4989176', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(737, 'V-5102820', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(739, 'V-5283288', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(741, 'V-5283350', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(743, 'V-5445501', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(745, 'V-5662168', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(747, 'V-5664717', '2026-II', 'Ciencias Sociales', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(749, 'V-5730272', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(751, 'V-5740172', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(753, 'V-6030961', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(755, 'V-647952', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(757, 'V-7783686', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(759, 'V-7899241', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(761, 'V-9006286', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(763, 'V-9129456', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(765, 'V-9141418', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(767, 'V-9145601', '2026-II', 'Agroindustrial', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(769, 'V-9146291', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(771, 'V-9174995', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(773, 'V-9233889', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(775, 'V-9338461', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(777, 'V-9462613', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(779, 'V-9467304', '2026-II', 'Matemática', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(781, 'V-9469345', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54'),
(783, 'V-9952315', '2026-II', 'Pedagogía', 'Por Revisar', 15, '2026-11-03', '2027-02-20', '[]', 0, 0, '2026-10-15 18:27:54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cargas_historicas_materias_v3`
--

CREATE TABLE `cargas_historicas_materias_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `carga_historica_id` int(11) NOT NULL,
  `materia_nombre` varchar(150) NOT NULL,
  `horas_semanal` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `horas_lapso` smallint(5) UNSIGNED NOT NULL DEFAULT 0,
  `especialidad_destino` varchar(100) DEFAULT '',
  `seccion` varchar(20) DEFAULT '',
  `cupos` smallint(5) UNSIGNED DEFAULT 0,
  `inscritos` smallint(5) UNSIGNED DEFAULT 0,
  `cohorte` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cargas_historicas_materias_v3`
--

INSERT INTO `cargas_historicas_materias_v3` (`id`, `carga_historica_id`, `materia_nombre`, `horas_semanal`, `horas_lapso`, `especialidad_destino`, `seccion`, `cupos`, `inscritos`, `cohorte`) VALUES
(279, 272, 'CÁLCULO I', 4, 60, 'Matemática', 'U', 0, 0, NULL),
(280, 272, 'ÁLGEBRA LINEAL', 4, 60, 'Matemática', 'U', 0, 0, NULL),
(281, 402, 'CÁLCULO I', 4, 60, '', 'A', 30, 25, NULL),
(6861, 533, 'TIC IV', 4, 60, 'Matemática', '10', 20, 10, '2026'),
(6862, 533, 'TIC IV', 4, 60, 'Artes Escénicas', '10', 10, 10, NULL),
(7416, 4, 'TIC I', 4, 60, 'Educación Física', '10', 10, 10, '2024'),
(7417, 4, 'TIC III', 4, 60, 'Geografía e Historia', '7', 12, 4, NULL),
(7418, 2, 'TIC IV', 4, 60, 'Matemática', '10', 20, 10, '2026'),
(7419, 2, 'TIC IV', 4, 60, 'Artes Escénicas', '10', 10, 10, NULL),
(7420, 1, 'TIC II', 4, 60, 'Geografía e Historia', '09', 8, 5, '2022'),
(7421, 1, 'TIC III', 4, 60, 'Educación Inicial', '90', 5, 4, '2026'),
(7422, 11, 'PRÁCTICA MUSICAL I', 12, 180, 'Educación Musical', 'U', 0, 0, '2022'),
(7423, 11, 'PRÁCTICA MUSICAL II', 8, 120, 'Educación Musical', 'U', 0, 0, '2022'),
(7424, 11, 'MUSICOLOGÍA Y ETNOMUSICOLOGÍA', 4, 60, 'Educación Musical', '7', 15, 7, '2025'),
(7425, 13, 'TIC I', 4, 60, '', 'U', 0, 0, '2024'),
(7426, 36, 'EDUCACIÓN AMBIENTAL', 4, 4, 'Educación Rural', '73', 10, 7, '2023'),
(7427, 20, 'TALLER BÁSICO RURAL I', 4, 60, 'Educación Rural', '52', 10, 1, '2024'),
(7428, 20, 'AGROINDUSTRIAS COMUNITARIAS', 4, 60, 'Educación Rural', '50', 10, 4, '2025'),
(7429, 20, 'FUNDAMENTOS SOCIOLÓGICOS DE LA EDUCACIÓN RURAL', 4, 12, 'Educación Rural', '50', 0, 0, '2025'),
(7430, 22, 'AGROINDUSTRIAS COMUNITARIAS', 4, 4, 'Educación Rural', '71', 15, 7, '2025'),
(7431, 21, 'GESTIÓN COMUNITARIA II', 3, 45, 'Educación Rural', '55', 10, 1, '2022'),
(7432, 21, 'MANTENIMIENTO DE INSTITUCIONES EDUCATIVAS', 2, 5, 'Educación Rural', '54', 10, 2, '2023'),
(7433, 102, 'SOFTWARE EN EDUCACIÓN MUSICAL', 4, 4, 'Educación Musical', '26', 10, 1, '2019'),
(7434, 127, 'INVESTIGACIÓN III', 4, 60, 'Educación Física', '4', 20, 19, '2024'),
(7435, 127, 'INVESTIGACIÓN II', 4, 8, 'Educación Musical', '6', 15, 8, '2025'),
(7436, 79, 'INVESTIGACIÓN III', 4, 60, 'Educación Integral', 'U', 25, 20, '2024'),
(7437, 28, 'LEGISLACIÓN EDUCATIVA AGRARIA', 3, 45, 'Educación Agropecuaria', '5', 25, 2, '2023'),
(7438, 28, 'GERENCIA Y LEGISLACIÓN', 4, 7, 'Educación Rural', '3', 10, 3, '2023'),
(7439, 108, 'FUNDAMENTOS PARA LA ENSEÑANZA DE LA LECTURA Y LA ESCRITURA', 3, 45, 'Educación Rural', '55', 10, 3, '2022'),
(7440, 108, 'EXPRESIÓN ORAL Y ESCRITA', 4, 60, 'Educación Rural', '52', 10, 1, '2024'),
(7441, 108, 'SOCIEDAD Y EDUCACIÓN', 4, 11, 'Educación Rural', '50', 10, 1, '2025'),
(7442, 117, 'LECTURA Y ESCRITURA EN EDUCACIÓN INICIAL', 4, 4, 'Educación Inicial', '5', 25, 9, '2024'),
(7443, 65, 'DISEÑO INSTRUCCIONAL', 4, 60, 'Educación Informática', '27', 12, 7, '2024'),
(7444, 65, 'TIC I', 4, 60, 'Educación Primaria', '29', 30, 22, NULL),
(7445, 65, 'TIC I', 4, 60, 'Educación Inicial', '30', 15, 14, NULL),
(7446, 65, 'TIC I', 4, 16, 'Educación Física', '31', 26, 26, NULL),
(7447, 47, 'TIC II', 4, 60, 'Geografía e Historia', '8', 12, 7, '2025'),
(7448, 47, 'TIC I', 4, 8, 'Geografía e Historia', '9', 20, 19, NULL),
(7449, 86, 'DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS', 4, 4, 'Educación Física', '5', 25, 5, '2024'),
(7450, 38, 'INVESTIGACIÓN III', 4, 60, 'Educación Musical', '80', 10, 10, '2024'),
(7451, 38, 'TIC III', 4, 8, 'Educación Musical', '80', 10, 10, '2024'),
(7452, 118, 'DESARROLLO DE PROCESOS COGNITIVOS', 4, 60, 'Educación Inicial', '11', 40, 37, NULL),
(7453, 118, 'DESARROLLO DE PROCESOS COGNITIVOS', 4, 8, 'Educación Musical', '8', 15, 13, NULL),
(7454, 97, 'RECURSOS DIDÁCTICOS PARA LA EDUCACIÓN INICIAL', 2, 30, 'Educación Inicial', '30', 35, 15, NULL),
(7455, 97, 'PRÁCTICA PROFESIONAL IV', 6, 90, 'Educación Agropecuaria', '25', 25, 2, '2019'),
(7456, 97, 'EVALUACIÓN DEL APRENDIZAJE', 4, 60, 'Educación Informática', '27', 12, 7, '2024'),
(7457, 97, 'INTERDISCIPLINARIEDAD EN LA ENSEÑANZA APRENDIZAJE DE LA CIENCIA', 3, 45, 'Educación Inicial', '25', 35, 3, '2024'),
(7458, 97, 'CIENCIAS NATURALES', 4, 60, 'Educación Primaria', '28', 25, 13, '2025'),
(7459, 97, 'PRÁCTICA PROFESIONAL I', 6, 90, 'Educación Física', '30', 25, 4, '2025'),
(7460, 97, 'REPERTORIO TRADICIONAL VENEZOLANO', 2, 33, 'Educación Primaria', '29', 30, 24, NULL),
(7461, 92, 'COMPETENCIAS GERENCIALES EN EL CONTEXTO EDUCATIVO', 2, 30, 'Educación Musical', '26', 10, 1, '2019'),
(7462, 92, 'INVESTIGACIÓN III', 4, 14, 'Educación Informática', '27', 12, 8, '2023'),
(7463, 90, 'EDUCACIÓN BIOÉTICA Y DERECHOS HUMANOS', 2, 30, 'Educación Inicial', '4', 25, 13, '2024'),
(7464, 90, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO', 4, 60, 'Educación Física', '10', 30, 29, '2025'),
(7465, 90, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO', 4, 60, 'Educación Física', '12', 30, 15, '2025'),
(7466, 90, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO', 4, 14, 'Educación Inicial', '8', 38, 36, '2025'),
(7467, 73, 'PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA', 4, 60, 'Educación Física', '100', 10, 8, '2024'),
(7468, 73, 'PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA', 4, 8, 'Educación Física', '91', 25, 2, '2024'),
(7469, 80, 'EDUCACIÓN Y DERECHOS HUMANOS', 3, 45, 'Educación Primaria', '5', 25, 5, '2022'),
(7470, 80, 'FORMACIÓN PERSONAL DEL DOCENTE', 2, 5, 'Educación Inicial', '3', 25, 2, '2023'),
(7471, 51, 'SALUD PREVENTIVA', 3, 3, 'Educación Agropecuaria', '25', 25, 1, '2022'),
(7472, 131, 'INVESTIGACIÓN I', 4, 4, 'Educación Socioproductiva', '2', 15, 7, NULL),
(7473, 116, 'INVESTIGACIÓN II', 4, 4, 'Educación Inicial', '7', 15, 13, '2025'),
(7474, 96, 'RECURSOS PARA EL APRENDIZAJE', 3, 45, 'Educación Rural', '55', 10, 4, '2022'),
(7475, 96, 'PLANIFICACIÓN POR PROYECTO', 2, 5, 'Educación Rural', '52', 10, 1, '2024'),
(7476, 101, 'PRODUCCIÓN DE EVENTOS ARTÍSTICOS', 2, 30, 'Educación Musical', '3', 10, 6, '2022'),
(7477, 101, 'EDUCACIÓN PARA LA PAZ', 2, 30, 'Educación Inicial', '6', 35, 17, '2025'),
(7478, 101, 'EDUCACIÓN PARA LA PAZ', 2, 6, 'Educación Inicial', '7', 35, 20, '2025'),
(7479, 130, 'INVESTIGACIÓN I', 4, 4, 'Educación Inicial', '13', 25, 18, NULL),
(7480, 52, 'TIC II', 4, 60, 'Educación Agropecuaria', '8', 25, 8, '2025'),
(7481, 52, 'TIC I', 4, 8, 'Educación Musical', '8', 15, 12, NULL),
(7482, 103, 'DESARROLLO DE PROCESOS COGNITIVOS', 4, 60, 'Educación Agropecuaria', '1', 30, 28, NULL),
(7483, 103, 'DESARROLLO DE PROCESOS COGNITIVOS', 4, 8, 'Educación Socioproductiva', '2', 15, 7, NULL),
(7484, 58, 'TIC I', 4, 60, 'Educación Física', '14', 25, 16, NULL),
(7485, 58, 'TIC I', 4, 8, 'Educación Física', '15', 20, 15, NULL),
(7486, 29, 'LEGISTACION COMPARADA EN CONTEXTOS INTERCULTURALES', 2, 2, 'Educación Rural', '50', 24, 20, '2025'),
(7487, 112, 'SOFTWARE EN EDUCACIÓN MUSICAL', 4, 4, 'Educación Musical', '1', 10, 2, '2019'),
(7488, 120, 'SALUD INTEGRAL', 3, 45, 'Educación Rural', '55', 10, 3, '2022'),
(7489, 120, 'DESARROLLO CURRICULAR', 4, 60, 'Educación Rural', '50', 24, 20, '2025'),
(7490, 120, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO', 4, 11, 'Educación Rural', '50', 10, 3, '2025'),
(7491, 94, 'INVESTIGACIÓN IV', 4, 4, 'Educación Rural', '54', 10, 8, '2023'),
(7492, 106, 'NEUROMÚSICA', 4, 4, 'Educación Musical', '2', 10, 7, '2021'),
(7493, 25, 'EDUCACIÓN PARA LA PARTICIPACIÓN COMUNITARIA', 4, 60, 'Educación Rural', '50', 24, 17, '2025'),
(7494, 25, 'EDUCACIÓN PARA LA PARTICIPACIÓN COMUNITARIA', 4, 8, 'Educación Rural', '71', 15, 14, '2025'),
(7495, 64, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 4, 'Educación Musical', '80', 10, 10, '2024'),
(7496, 70, 'TIC II', 4, 4, 'Educación Física', '6', 15, 12, '2025'),
(7497, 30, 'EDUCACIÓN INTERCULTURAL EN EL NIVEL INICIAL', 3, 45, 'Educación Inicial', '1', 25, 8, '2022'),
(7498, 30, 'EDUCACIÓN PARA LA CIUDADANÍA', 2, 30, 'Geografía e Historia', '6', 25, 1, '2023'),
(7499, 31, 'ATENCIÓN EN ESPACIOS DE FAMILIA Y COMUNIDAD', 4, 9, 'Educación Inicial', '6', 35, 15, '2025'),
(7500, 54, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Física', '4', 25, 17, '2024'),
(7501, 54, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Primaria', '7', 30, 1, '2024'),
(7502, 27, 'FUNDAMENTOS DE LA ECONOMÍA AGRÍCOLA', 2, 2, 'Educación Rural', '71', 15, 10, '2025'),
(7503, 121, 'INVESTIGACIÓN II', 4, 60, 'Educación Física', '6', 15, 15, '2025'),
(7504, 121, 'INVESTIGACIÓN I', 4, 8, 'Educación Primaria', '11', 20, 16, NULL),
(7505, 34, 'ECOPEDAGOGÍA', 3, 45, 'Educación Inicial', '25', 35, 2, '2019'),
(7506, 34, 'EDUCACIÓN AMBIENTAL', 4, 60, 'Geografía e Historia', '5', 25, 2, '2022'),
(7507, 35, 'EDUCACIÓN AMBIENTAL', 4, 11, 'Educación Agropecuaria', '6', 25, 3, '2023'),
(7508, 72, 'TIC III', 4, 60, 'Geografía e Historia', '25', 25, 1, '2019'),
(7509, 72, 'TIC III', 4, 60, 'Educación Inicial', '27', 15, 10, '2019'),
(7510, 72, 'TECNOLOGÍAS E INNOVACIONES EDUCATIVAS', 2, 30, 'Educación Informática', '27', 12, 8, '2024'),
(7511, 72, 'PROGRAMACIÓN II', 4, 60, 'Educación Informática', '28', 12, 3, '2025'),
(7512, 72, 'TIC II', 4, 60, 'Geografía e Historia', '26', 12, 3, '2025'),
(7513, 72, 'TIC II', 4, 60, 'Educación Informática', '28', 12, 4, '2025'),
(7514, 72, 'TIC II', 4, 44, 'Educación Física', '29', 25, 9, '2025'),
(7515, 110, 'TIC IV', 4, 60, 'Educación Inicial', '26', 15, 1, '2019'),
(7516, 110, 'TIC IV', 4, 60, 'Educación Agropecuaria', '25', 25, 1, '2019'),
(7517, 110, 'INVESTIGACIÓN III', 4, 60, 'Educación Primaria', '27', 25, 15, '2024'),
(7518, 110, 'EDUCACIÓN INCLUSIVA', 4, 24, 'Educación Inicial', '26', 35, 2, '2019'),
(7519, 111, 'PEDAGOGÍA DE LA MÚSICA II', 4, 4, 'Educación Musical', '27', 10, 2, '2023'),
(7520, 123, 'NEUROCIENCIA Y EDUCACIÓN', 4, 4, 'Educación Inicial', '3', 25, 2, '2023'),
(7521, 33, 'LEGISTACION COMPARADA EN CONTEXTOS INTERCULTURALES', 2, 2, 'Educación Rural', '71', 15, 11, '2025'),
(7522, 100, 'INVESTIGACIÓN III', 4, 60, 'Educación Rural', '52', 20, 20, '2024'),
(7523, 100, 'INVESTIGACIÓN III', 4, 8, 'Educación Rural', '53', 20, 16, '2024'),
(7524, 84, 'FORMACIÓN PERSONAL DEL DOCENTE', 2, 30, 'Educación Inicial', '26', 35, 3, '2019'),
(7525, 84, 'NEUROCIENCIA Y EDUCACIÓN', 4, 60, 'Educación Inicial', '26', 35, 4, '2019'),
(7526, 84, 'EVALUACIÓN DEL APRENDIZAJE', 4, 60, 'Educación Musical', '27', 10, 2, '2023'),
(7527, 84, 'ATENCIÓN A NIÑOS Y JÓVENES CON DISCAPACIDAD', 4, 60, 'Educación Primaria', '27', 25, 15, '2024'),
(7528, 84, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO', 4, 60, 'Educación Física', '30', 25, 6, '2025'),
(7529, 84, 'PRÁCTICA PROFESIONAL I', 6, 90, 'Educación Inicial', '29', 16, 14, '2025'),
(7530, 84, 'INVESTIGACIÓN I', 4, 60, 'Educación Primaria', '29', 30, 21, NULL),
(7531, 84, 'INVESTIGACIÓN I', 4, 32, 'Educación Física', '31', 26, 26, NULL),
(7532, 50, 'ACTIVIDAD FÍSICA PARA EL ADULTO MAYOR', 3, 45, 'Educación Física', '1', 25, 10, '2022'),
(7533, 50, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 7, 'Educación Inicial', '90', 25, 4, NULL),
(7534, 82, 'INVESTIGACIÓN I', 4, 4, 'Educación Informática', '11', 20, 19, NULL),
(7535, 133, 'ENSEÑANZA DE LA LITERATURA', 3, 3, 'Educación Musical', '1', 10, 7, '2019'),
(7536, 77, 'FUNDAMENTOS SOCIOLÓGICOS DE LA EDUCACIÓN RURAL', 4, 60, 'Educación Rural', '71', 15, 11, '2025'),
(7537, 77, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO', 4, 60, 'Educación Rural', '71', 15, 9, '2025'),
(7538, 77, 'SOCIEDAD Y EDUCACIÓN', 4, 12, 'Educación Rural', '70', 16, 16, NULL),
(7539, 137, 'PROYECTOS EDUCATIVOS', 3, 3, 'Educación Primaria', '5', 25, 5, '2022'),
(7540, 76, 'DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS', 4, 8, 'Educación Inicial', '5', 25, 7, '2024'),
(7541, 136, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD', 4, 8, 'Matemática', '6', 10, 2, '2023'),
(7542, 71, 'BASES CIENTÍFICAS DE LA ACTIVIDAD FÍSICA', 2, 30, 'Educación Física', '3', 25, 1, '2023'),
(7543, 71, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Física', '91', 25, 2, NULL),
(7544, 71, 'PREPARACIÓN FÍSICA BÁSICA', 2, 30, 'Educación Física', '14', 42, 42, NULL),
(7545, 71, 'PREPARACIÓN FÍSICA BÁSICA', 2, 10, 'Educación Física', '16', 45, 42, NULL),
(7546, 55, 'TEORÍA Y PRÁCTICA DE LA MOTRICIDAD HUMANA', 4, 60, 'Educación Física', '10', 30, 24, '2025'),
(7547, 55, 'TEORÍA Y PRÁCTICA DE LA MOTRICIDAD HUMANA', 4, 8, 'Educación Física', '12', 30, 12, '2025'),
(7548, 109, 'INVESTIGACIÓN III', 4, 60, 'Educación Inicial', '4', 15, 10, '2023'),
(7549, 109, 'DESARROLLO INFANTIL II PREESCOLAR', 4, 8, 'Educación Inicial', '8', 35, 33, '2025'),
(7550, 41, 'TIC IV', 4, 60, 'Educación Física', '90', 5, 3, '2025'),
(7551, 41, 'TIC I', 4, 12, 'Educación Primaria', '11', 20, 16, NULL),
(7552, 37, 'DINÁMICA DEL ESPACIO GEOGRÁFICO', 2, 2, 'Educación Musical', '80', 10, 9, '2024'),
(7553, 114, 'DESARROLLO CURRICULAR', 4, 60, 'Educación Agropecuaria', '8', 25, 11, '2025'),
(7554, 114, 'INVESTIGACIÓN III', 4, 8, 'Educación Inicial', '90', 15, 4, NULL),
(7555, 69, 'CIENCIA, TECNOLOGÍA Y SOCIEDAD', 2, 30, 'Matemática', '7', 15, 10, NULL),
(7556, 69, 'TIC I', 4, 6, 'Educación Física', '18', 20, 15, NULL),
(7557, 95, 'PLANIFICACIÓN POR PROYECTO', 2, 30, 'Educación Rural', '72', 10, 3, '2024'),
(7558, 95, 'PRÁCTICA PROFESIONAL II', 6, 90, 'Educación Rural', '72', 10, 6, '2024'),
(7559, 95, 'PRÁCTICA PROFESIONAL I', 6, 14, 'Educación Rural', '71', 15, 10, '2025'),
(7560, 67, 'PREVENCIÓN Y GESTIÓN DE RIESGO', 2, 30, 'Educación Primaria', '6', 25, 4, '2023'),
(7561, 67, 'CIENCIAS NATURALES', 4, 60, 'Educación Primaria', '8', 30, 13, '2025'),
(7562, 67, 'ANATOMÍA Y FISIOLOGÍA HUMANA', 4, 10, 'Educación Física', '16', 48, 48, NULL),
(7563, 57, 'TIC III', 4, 60, 'Educación Inicial', '4', 15, 10, '2024'),
(7564, 57, 'TIC I', 4, 12, 'Educación Agropecuaria', '2', 15, 15, NULL),
(7565, 85, 'INVESTIGACIÓN IV', 4, 60, 'Educación Rural', '73', 10, 7, '2023'),
(7566, 85, 'INVESTIGACIÓN III', 4, 60, 'Educación Rural', '72', 15, 7, '2024'),
(7567, 85, 'INVESTIGACIÓN II', 4, 60, 'Educación Rural', '71', 15, 10, '2025'),
(7568, 85, 'INVESTIGACIÓN I', 4, 16, 'Educación Rural', '70', 16, 16, NULL),
(7569, 43, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Rural', '72', 15, 11, '2024'),
(7570, 43, 'RECREACIÓN', 2, 30, 'Educación Rural', '54', 10, 8, '2023'),
(7571, 43, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Rural', '52', 20, 20, '2024'),
(7572, 43, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 10, 'Educación Rural', '53', 20, 16, '2024'),
(7573, 23, 'EDUCACIÓN RURAL', 4, 60, 'Educación Rural', '2', 15, 6, NULL),
(7574, 23, 'EDUCACIÓN RURAL', 4, 8, 'Educación Rural', '70', 15, 8, NULL),
(7575, 68, 'TIC I', 4, 60, 'Educación Física', '16', 20, 18, NULL),
(7576, 68, 'TIC I', 4, 8, 'Educación Física', '17', 15, 14, NULL),
(7577, 62, 'EDUCACIÓN FÍSICA EN ESPACIOS NO CONVENCIONALES', 3, 45, 'Educación Física', '1', 25, 9, '2022'),
(7578, 62, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 7, 'Educación Informática', '7', 8, 2, '2024'),
(7579, 26, 'ECONOMÍA CAMPESINA', 4, 60, 'Educación Rural', '72', 15, 12, '2024'),
(7580, 26, 'GESTIÓN COMUNITARIA I', 2, 6, 'Educación Rural', '70', 15, 14, NULL),
(7581, 53, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Inicial', '4', 25, 13, '2023'),
(7582, 53, 'EDUCACIÓN FÍSICA Y RECREACIÓN', 4, 12, 'Educación Física', '8', 30, 14, '2025'),
(7583, 66, 'SALUD PREVENTIVA', 3, 45, 'Educación Agropecuaria', '5', 25, 5, '2022'),
(7584, 66, 'INTERDISCIPLINARIEDAD EN LA ENSEÑANZA APRENDIZAJE DE LA CIENCIA', 3, 6, 'Educación Inicial', '1', 25, 12, '2022'),
(7585, 132, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD', 4, 60, 'Educación Rural', '54', 10, 7, '2023'),
(7586, 132, 'PSICOLOGÍA DEL APRENDIZAJE', 4, 8, 'Educación Rural', '52', 10, 1, '2024'),
(7587, 107, 'PRÁCTICA PROFESIONAL IV', 6, 90, 'Educación Rural', '55', 10, 4, '2022'),
(7588, 107, 'TIC IV', 4, 60, 'Educación Rural', '54', 10, 8, '2023'),
(7589, 107, 'TIC III', 4, 60, 'Educación Rural', '52', 20, 19, '2024'),
(7590, 107, 'TIC III', 4, 18, 'Educación Rural', '53', 20, 17, '2024'),
(7591, 135, 'EDUCACIÓN PARA LAS ARTES', 4, 4, 'Educación Primaria', '6', 15, 2, '2023'),
(7592, 93, 'DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS', 4, 60, 'Educación Agropecuaria', '25', 25, 1, '2022'),
(7593, 93, 'DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS', 4, 12, 'Educación Inicial', '28', 35, 6, '2022'),
(7594, 104, 'AULA MUSICAL INTERACTIVA', 4, 60, 'Educación Musical', '5', 10, 6, '2024'),
(7595, 104, 'INTERPRETACIÓN Y CREATIVIDAD MUSICAL', 4, 8, 'Educación Musical', '5', 10, 5, '2024'),
(7596, 75, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD', 4, 60, 'Educación Rural', '73', 10, 7, '2023'),
(7597, 75, 'EVALUACIÓN DEL APRENDIZAJE', 4, 8, 'Educación Rural', '72', 15, 12, '2024'),
(7598, 63, 'DIDÁCTICA DE LA INFORMÁTICA', 4, 60, 'Educación Informática', '27', 12, 8, '2024'),
(7599, 63, 'TIC III', 4, 60, 'Educación Primaria', '27', 25, 15, '2024'),
(7600, 63, 'DESARROLLO INFANTIL II PREESCOLAR', 4, 12, 'Educación Inicial', '29', 35, 6, '2025'),
(7601, 46, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Informática', '27', 12, 9, '2024'),
(7602, 46, 'KINESIOLOGÍA EN LA EDUCACIÓN FÍSICA', 2, 30, 'Educación Física', '28', 25, 1, '2024'),
(7603, 46, 'FUNDAMENTOS DE EDUCACIÓN FÍSICA', 4, 18, 'Educación Física', '31', 26, 26, NULL),
(7604, 9, 'PRÁCTICA PROFESIONAL III', 6, 90, 'Educación Rural', 'U', 0, 0, '2024'),
(7605, 9, 'DIDÁCTICA GENERAL', 4, 60, 'Educación Rural', 'U', 0, 0, '2025'),
(7606, 9, 'TIC II', 4, 60, 'Educación Rural', 'U', 0, 0, '2025'),
(7607, 9, 'PRÁCTICA PROFESIONAL III', 6, 90, 'Educación Rural', '53', 10, 1, '2024'),
(7608, 9, 'DIDÁCTICA GENERAL', 4, 60, 'Educación Rural', '50', 24, 21, '2025'),
(7609, 9, 'TIC II', 4, 14, 'Educación Rural', '50', 12, 12, '2025'),
(7610, 115, 'JUEGOS DE MÚSICA Y EXPRESIÓN CORPORAL', 2, 30, 'Educación Inicial', '3', 25, 2, '2023'),
(7611, 115, 'DIDÁCTICA DE LA CANCIÓN INFANTIL', 2, 4, 'Educación Inicial', '5', 25, 5, '2024'),
(7612, 24, 'ECONOMÍA CAMPESINA', 4, 60, 'Educación Rural', '53', 20, 1, '2024'),
(7613, 24, 'FUNDAMENTOS DE LA ECONOMÍA AGRÍCOLA', 2, 6, 'Educación Rural', '52', 10, 1, '2024'),
(7614, 78, 'PRÁCTICA PROFESIONAL IV', 6, 90, 'Educación Inicial', '25', 15, 3, '2019'),
(7615, 78, 'ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE', 2, 30, 'Educación Inicial', '26', 35, 2, '2019'),
(7616, 78, 'DIDÁCTICA DE LA EDUCACIÓN PREESCOLAR', 4, 60, 'Educación Inicial', '27', 35, 12, '2024'),
(7617, 78, 'TRANSICIÓN DE PREESCOLAR  A PRIMER GRADO', 4, 60, 'Educación Inicial', '27', 35, 6, '2024'),
(7618, 78, 'DIDÁCTICA DE LA CANCIÓN INFANTIL', 2, 30, 'Educación Inicial', '28', 35, 1, '2024'),
(7619, 78, 'ATENCIÓN INTEGRAL DEL INFANTE DE 0 A 6 AÑOS', 4, 60, 'Educación Inicial', '28', 35, 12, '2025'),
(7620, 78, 'ETAPAS Y DESARROLLO EMOCIONAL INFANTIL', 2, 30, 'Educación Inicial', '29', 35, 7, '2025'),
(7621, 78, 'DESARROLLO INFANTIL I MATERNAL', 4, 28, 'Educación Inicial', '30', 35, 16, NULL),
(7622, 49, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Física', '27', 25, 8, '2024'),
(7623, 49, 'RITMO Y EXPRESIÓN CORPORAL', 4, 60, 'Educación Física', '27', 25, 8, '2024'),
(7624, 49, 'EDUCACIÓN FÍSICA Y RECREACIÓN', 4, 60, 'Educación Física', '29', 25, 9, '2025'),
(7625, 49, 'LÚDICA Y MOTRICIDAD', 2, 30, 'Educación Física', '30', 25, 4, '2025'),
(7626, 49, 'PREPARACIÓN FÍSICA BÁSICA', 2, 16, 'Educación Física', '31', 26, 26, NULL),
(7627, 49, 'RITMO Y EXPRESIÓN CORPORAL', 4, 60, 'Educación Física', '100', 10, 8, '2024'),
(7628, 49, 'RITMO Y EXPRESIÓN CORPORAL', 4, 60, 'Educación Física', '4', 25, 10, '2024'),
(7629, 49, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Informática', '90', 8, 4, '2024'),
(7630, 49, 'RITMO Y EXPRESIÓN CORPORAL', 4, 16, 'Educación Física', '91', 25, 2, '2024'),
(7631, 48, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Educación Agropecuaria', '25', 25, 1, '2022'),
(7632, 48, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 8, 'Educación Musical', '27', 10, 2, '2022'),
(7633, 105, 'PSICOLOGÍA DEL APRENDIZAJE', 4, 60, 'Educación Informática', '10', 12, 6, '2025'),
(7634, 105, 'PSICOLOGÍA DEL APRENDIZAJE', 4, 8, 'Educación Musical', '7', 15, 6, '2025'),
(7635, 40, 'PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA', 4, 4, 'Educación Física', '4', 25, 13, '2024'),
(7636, 89, 'AULA CULTURAL INTERACTIVA', 4, 4, 'Educación Musical', '3', 10, 3, '2022'),
(7637, 59, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', 4, 60, 'Geografía e Historia', '7', 25, 4, '2024'),
(7638, 59, 'FUNDAMENTOS DE EDUCACIÓN FÍSICA', 4, 8, 'Educación Física', '14', 40, 33, NULL),
(7639, 39, 'RECREACIÓN', 2, 30, 'Educación Agropecuaria', '6', 25, 7, '2023'),
(7640, 39, 'FUNDAMENTOS DE EDUCACIÓN FÍSICA', 4, 60, 'Educación Física', '16', 40, 38, '2026'),
(7641, 99, 'CALENDARIO FESTIVO VENEZOLANO', 2, 2, 'Educación Musical', '3', 10, 3, '2022'),
(7642, 83, 'DIDÁCTICA GENERAL', 4, 4, 'Educación Rural', '71', 15, 11, '2025'),
(7643, 5, 'DESARROLLO CURRICULAR', 0, 0, 'Geografía e Historia', 'U', 0, 0, NULL),
(7644, 5, 'EDUCACIÓN AMBIENTAL', 4, 4, 'Educación Rural', '54', 10, 7, '2023'),
(7645, 88, 'EXPRESIÓN ORAL Y ESCRITA', 4, 60, 'Educación Primaria', '9', 30, 14, '2025'),
(7646, 88, 'INTRODUCCIÓN AL ESTUDIO DE LA LENGUA', 4, 8, 'Educación Primaria', '10', 35, 33, NULL),
(7647, 42, 'RECREACIÓN', 2, 30, 'Educación Inicial', '2', 10, 5, '2021'),
(7648, 42, 'RECREACIÓN', 2, 30, 'Educación Rural', '1', 10, 1, '2021'),
(7649, 42, 'RECREACIÓN', 2, 30, 'Educación Agropecuaria', '90', 5, 3, '2021'),
(7650, 45, 'TALLER BÁSICO RURAL I', 4, 60, 'Educación Rural', '72', 10, 1, '2024'),
(7651, 45, 'CIENCIAS INTEGRADAS', 4, 8, 'Educación Rural', '70', 16, 16, NULL),
(7652, 113, 'EXPRESIÓN ORAL Y ESCRITA', 4, 60, 'Educación Musical', '7', 15, 7, '2025'),
(7653, 113, 'EXPRESIÓN ORAL Y ESCRITA', 4, 8, 'Geografía e Historia', '8', 25, 2, '2025'),
(7654, 32, 'ATENCIÓN EN ESPACIOS DE FAMILIA Y COMUNIDAD', 4, 4, 'Educación Inicial', '28', 35, 13, '2025'),
(7655, 44, 'RECREACIÓN', 2, 6, 'Educación Rural', '73', 10, 7, '2023'),
(7656, 119, 'INVESTIGACIÓN I', 4, 4, 'Educación Física', '18', 20, 15, NULL),
(7657, 125, 'EXPRESIÓN ORAL Y ESCRITA', 4, 4, 'Educación Rural', '71', 15, 9, '2025'),
(7658, 129, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD', 4, 60, 'Educación Física', '2', 25, 13, '2023'),
(7659, 129, 'PSICOLOGÍA DEL APRENDIZAJE', 4, 60, 'Educación Agropecuaria', '9', 25, 10, '2024'),
(7660, 122, 'PLANIFICACIÓN DE LA ENSEÑANZA Y DEL APRENDIZAJE', 4, 60, 'Educación Rural', '72', 10, 2, '2024'),
(7661, 122, 'DESARROLLO CURRICULAR', 4, 60, 'Educación Rural', '71', 15, 11, '2025'),
(7662, 122, 'PSICOLOGÍA DEL APRENDIZAJE', 4, 60, 'Educación Rural', '71', 15, 9, '2025'),
(7663, 122, 'DESARROLLO DE PROCESOS COGNITIVOS', 4, 16, 'Educación Rural', '70', 16, 16, NULL),
(7664, 60, 'TIC IV', 4, 60, 'Educación Rural', '73', 10, 7, '2023'),
(7665, 60, 'TIC III', 4, 8, 'Educación Rural', '72', 15, 7, '2024'),
(7666, 81, 'EVALUACIÓN DEL APRENDIZAJE', 4, 60, 'Educación Rural', '52', 20, 19, '2024'),
(7667, 81, 'EVALUACIÓN DEL APRENDIZAJE', 4, 8, 'Educación Rural', '53', 20, 17, '2024'),
(7668, 128, 'PROBLEMÁTICA SOCIAL Y APRENDIZAJE', 2, 30, 'Educación Musical', '3', 11, 4, '2022'),
(7669, 128, 'PROBLEMÁTICA SOCIAL Y APRENDIZAJE', 2, 4, 'Educación Primaria', '6', 25, 3, '2022'),
(7670, 134, 'REPERTORIO TRADICIONAL VENEZOLANO', 2, 30, 'Educación Primaria', '10', 37, 36, NULL),
(7671, 134, 'REPERTORIO TRADICIONAL VENEZOLANO', 2, 4, 'Educación Musical', '8', 15, 11, NULL),
(7672, 12, 'ECONOMÍA CAMPESINA', 4, 60, 'Educación Rural', '52', 20, 19, '2024'),
(7673, 12, 'ECONOMÍA CAMPESINA', 4, 8, 'Educación Rural', '53', 20, 15, '2024'),
(7674, 56, 'GESTIÓN EN ESCENARIOS ALTERNATIVOS DE APRENDIZAJE', 3, 45, 'Educación Informática', '5', 6, 5, '2022'),
(7675, 56, 'TIC III', 4, 7, 'Educación Musical', '4', 10, 10, '2023'),
(7676, 124, 'PRÁCTICA PROFESIONAL IV', 6, 6, 'Educación Inicial', '53', 15, 1, '2019'),
(7677, 87, 'EVALUACIÓN DEL APRENDIZAJE', 4, 4, 'Educación Musical', '80', 10, 10, '2024'),
(7678, 126, 'INVESTIGACIÓN II', 4, 4, 'Geografía e Historia', '8', 12, 7, '2025'),
(7679, 98, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD', 4, 60, 'Educación Musical', '2', 9, 3, '2021'),
(7680, 98, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD', 4, 8, 'Geografía e Historia', '5', 25, 2, '2021'),
(7681, 61, 'TIC II', 4, 60, 'Educación Inicial', 'U', 0, 0, '2025'),
(7682, 61, 'TIC II', 4, 60, 'Educación Inicial', 'U', 0, 0, '2025'),
(7683, 74, 'ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE', 2, 30, 'Educación Inicial', '2', 25, 4, '2023'),
(7684, 74, 'ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE', 2, 4, 'Educación Informática', '6', 8, 3, '2023'),
(7685, 91, 'PEDAGOGÍA DE LA MÚSICA II', 4, 60, 'Educación Musical', '80', 10, 9, '2024'),
(7686, 91, 'PRÁCTICA MUSICAL I', 4, 60, 'Educación Musical', '81', 10, 1, '2024'),
(7687, 91, 'PRÁCTICA MUSICAL II', 4, 12, 'Educación Musical', '80', 10, 9, '2024'),
(7690, 535, 'TIC II', 4, 60, 'Educación Física', '09', 8, 5, '2022'),
(7691, 535, 'TIC III', 4, 60, 'Educación Inicial', '90', 5, 4, '2026');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `departamentos_v3`
--

CREATE TABLE `departamentos_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `codigo` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `departamentos_v3`
--

INSERT INTO `departamentos_v3` (`id`, `nombre`, `codigo`, `activo`) VALUES
(1, 'Matemática', 'MAT', 1),
(2, 'Ciencias Sociales', 'SOC', 1),
(3, 'Agroindustrial', 'AGRO', 1),
(4, 'Pedagogía', 'PED', 1);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `docentes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `docentes` (
`cedula` varchar(20)
,`nombres` varchar(100)
,`apellidos` varchar(100)
,`department` varchar(100)
,`status` varchar(11)
,`fechaNac` varchar(10)
,`rif` varchar(20)
,`correo` varchar(150)
,`correoInstitucional` varchar(150)
,`direccion` varchar(255)
,`telefonos` varchar(50)
,`banco` varchar(100)
,`cuentaBancaria` varchar(50)
,`tipoCuenta` varchar(9)
,`titulosPregrado` varchar(255)
,`titulosPostgrado` varchar(255)
,`doctorado` varchar(255)
,`categoriaDocente` varchar(10)
,`dedicacion` varchar(20)
,`periodoAcademico` varchar(30)
,`semanas` decimal(3,0)
,`fechaDesde` varchar(10)
,`fechaHasta` varchar(10)
,`sedeCentro` varchar(100)
,`especialidad` varchar(100)
,`clave` varchar(255)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes_contrataciones_v3`
--

CREATE TABLE `docentes_contrataciones_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `docente_cedula` varchar(20) NOT NULL,
  `periodo_id` int(10) UNSIGNED NOT NULL,
  `departamento_id` int(10) UNSIGNED NOT NULL,
  `sede_id` int(10) UNSIGNED NOT NULL,
  `status` enum('Activo','Validado','Por Revisar','Inactivo','Jubilado') NOT NULL DEFAULT 'Por Revisar',
  `categoria_docente` enum('Instructor','Asistente','Agregado','Asociado','Titular') NOT NULL DEFAULT 'Instructor',
  `dedicacion` enum('Tiempo Convencional','Medio Tiempo','Tiempo Completo','Dedicación Exclusiva') NOT NULL DEFAULT 'Tiempo Convencional',
  `especialidad` varchar(100) DEFAULT NULL,
  `semanas` tinyint(3) UNSIGNED NOT NULL DEFAULT 15,
  `fecha_desde` date DEFAULT NULL,
  `fecha_hasta` date DEFAULT NULL,
  `titulos_pregrado` varchar(255) DEFAULT NULL,
  `titulos_postgrado` varchar(255) DEFAULT NULL,
  `doctorado` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `creado_el` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `docentes_contrataciones_v3`
--

INSERT INTO `docentes_contrataciones_v3` (`id`, `docente_cedula`, `periodo_id`, `departamento_id`, `sede_id`, `status`, `categoria_docente`, `dedicacion`, `especialidad`, `semanas`, `fecha_desde`, `fecha_hasta`, `titulos_pregrado`, `titulos_postgrado`, `doctorado`, `observaciones`, `creado_el`, `actualizado_el`) VALUES
(1, 'V-10157451', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Matemática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(2, 'V-10175284', 2, 2, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(3, 'V-10481795', 2, 3, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(4, 'V-10683546', 2, 3, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(5, 'V-11105527', 1, 1, 1, 'Activo', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-01-29', 'PROFESOR EN INFORMATICA', NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:41:21'),
(6, 'V-11106384', 2, 3, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(7, 'V-11106623', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(8, 'V-11109284', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(9, 'V-11111242', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Informática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(10, 'V-11227590', 2, 3, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(11, 'V-11296708', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(12, 'V-12228218', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(13, 'V-12517032', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Informática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(14, 'V-12517701', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Geografía e Historia', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(15, 'V-12526013', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(16, 'V-12580917', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(17, 'V-13037358', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(18, 'V-13038785', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(19, 'V-13145093', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(20, 'V-13230490', 2, 1, 1, 'Activo', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', 'Ingeniero de Sistemas', 'Magister en Planificaciòn Global', 'Estudiante', NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(21, 'V-13283938', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-16 06:42:18'),
(22, 'V-13302649', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(23, 'V-13303484', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(24, 'V-13303740', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(25, 'V-13304171', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Socioproductiva', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(26, 'V-13304865', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(27, 'V-13582199', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(28, 'V-13821819', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(29, 'V-13821947', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(30, 'V-13999784', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(31, 'V-14217306', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(32, 'V-14217854', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(33, 'V-14459970', 2, 2, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(34, 'V-14546907', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(35, 'V-14598279', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(36, 'V-14599710', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(37, 'V-14688545', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(38, 'V-14776205', 2, 3, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(39, 'V-14932020', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(40, 'V-15001066', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(41, 'V-15194091', 2, 2, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(42, 'V-15194092', 2, 2, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(43, 'V-15438777', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(44, 'V-15854429', 2, 3, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(45, 'V-15880572', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(46, 'V-15881390', 2, 2, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(47, 'V-15881391', 2, 2, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(48, 'V-15989092', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Geografía e Historia', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(49, 'V-16122526', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(50, 'V-16230119', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(51, 'V-16232048', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(52, 'V-16280709', 2, 2, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(53, 'V-16377845', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(54, 'V-16409642', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(55, 'V-16420045', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(56, 'V-16420771', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Informática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(57, 'V-16421138', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(58, 'V-16885441', 2, 4, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(59, 'V-16959033', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(60, 'V-16960486', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(61, 'V-17491840', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(62, 'V-17491868', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(63, 'V-17493024', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(64, 'V-17493215', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(65, 'V-17493851', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(66, 'V-17690526', 2, 2, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(67, 'V-17875742', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(68, 'V-17877028', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Matemática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(69, 'V-17912463', 2, 4, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(70, 'V-17961246', 2, 4, 1, 'Activo', 'Instructor', 'Tiempo Convencional', 'Educación Integral', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(71, 'V-18010032', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(72, 'V-18228922', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(73, 'V-18374498', 2, 4, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(74, 'V-18378499', 2, 1, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(75, 'V-18791204', 2, 3, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-16 06:42:18'),
(76, 'V-18959604', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(77, 'V-19034337', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(78, 'V-19519008', 2, 3, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(79, 'V-19540028', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(80, 'V-19540281', 2, 1, 1, 'Activo', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-11-03', '2027-02-20', 'PROFESOR EN INFORMATICA', 'MAGISTER EN INNOVACIONES EDUCATIVAS -', 'ESTUDIANTE', NULL, '2026-10-06 12:44:13', '2026-10-16 06:44:26'),
(81, 'V-19541018', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(82, 'V-19898013', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(83, 'V-19899866', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(84, 'V-21002582', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(85, 'V-22726478', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(86, 'V-23544042', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(87, 'V-23742852', 2, 4, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(88, 'V-24745310', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Informática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(89, 'V-24784953', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(90, 'V-24785261', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(91, 'V-25166850', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(92, 'V-25361458', 2, 3, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(93, 'V-25463412', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(94, 'V-26675072', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(95, 'V-26788603', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(96, 'V-26841404', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Informática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(97, 'V-26988792', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(98, 'V-27601669', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(99, 'V-27815121', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Geografía e Historia', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(100, 'V-27815133', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Agropecuaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(101, 'V-4074672', 1, 4, 1, 'Activo', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-01-29', 'PROFESOR EN educacion musical', 'Magister en Planificaciòn Global', NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:41:21'),
(102, 'V-4447061', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(103, 'V-4989176', 2, 4, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(104, 'V-5102820', 2, 2, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(105, 'V-5283288', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(106, 'V-5283350', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(107, 'V-5445501', 2, 1, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(108, 'V-5662168', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(109, 'V-5664717', 2, 2, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(110, 'V-5730272', 2, 1, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(111, 'V-5740172', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(112, 'V-6030961', 2, 4, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(113, 'V-647952', 1, 4, 1, 'Activo', 'Instructor', 'Tiempo Convencional', 'Educación Física', 15, '2026-10-16', '2027-01-29', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:41:21'),
(114, 'V-7783686', 2, 4, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(115, 'V-7899241', 2, 1, 2, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(116, 'V-9006286', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(117, 'V-9129456', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(118, 'V-9141418', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Primaria', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(119, 'V-9145601', 2, 3, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Rural', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(120, 'V-9146291', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Informática', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(121, 'V-9174995', 2, 4, 3, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(122, 'V-9233889', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(123, 'V-9338461', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Geografía e Historia', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(124, 'V-9462613', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(125, 'V-9467304', 2, 1, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(126, 'V-9469345', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Inicial', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18'),
(127, 'V-9952315', 2, 4, 1, 'Por Revisar', 'Instructor', 'Tiempo Convencional', 'Educación Musical', 15, '2026-10-16', '2027-02-20', NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-16 06:42:18');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes_datos_bancarios_v3`
--

CREATE TABLE `docentes_datos_bancarios_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `docente_cedula` varchar(20) NOT NULL,
  `banco` varchar(100) NOT NULL,
  `cuenta_bancaria` varchar(50) NOT NULL,
  `tipo_cuenta` enum('Ahorro','Corriente') NOT NULL DEFAULT 'Corriente',
  `es_principal` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `docentes_datos_bancarios_v3`
--

INSERT INTO `docentes_datos_bancarios_v3` (`id`, `docente_cedula`, `banco`, `cuenta_bancaria`, `tipo_cuenta`, `es_principal`) VALUES
(1, 'V-11105527', 'Banco de Venezuela', '01020380580100067920', 'Ahorro', 1),
(2, 'V-13230490', 'Banco de Venezuela', '01020380580100064398', 'Ahorro', 1),
(3, 'V-19540281', 'Banco de Venezuela', '01020380580100067920', 'Ahorro', 1),
(4, 'V-4074672', 'Banco de Venezuela', '01020380580100067920', 'Ahorro', 1);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `docentes_materias`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `docentes_materias` (
`id` int(10) unsigned
,`docente_cedula` varchar(20)
,`nombre` varchar(150)
,`horasSemanal` tinyint(3) unsigned
,`horasLapso` smallint(5) unsigned
,`especialidadDestino` varchar(100)
,`seccion` varchar(20)
,`cupos` smallint(5) unsigned
,`inscritos` smallint(5) unsigned
,`cohorte` varchar(50)
,`periodoAcademico` varchar(30)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes_v3`
--

CREATE TABLE `docentes_v3` (
  `cedula` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL DEFAULT '',
  `apellidos` varchar(100) NOT NULL DEFAULT '',
  `fecha_nacimiento` date DEFAULT NULL,
  `rif` varchar(20) DEFAULT NULL,
  `correo_personal` varchar(150) DEFAULT NULL,
  `correo_institucional` varchar(150) DEFAULT NULL,
  `telefonos` varchar(50) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `clave_portal_hash` varchar(255) DEFAULT NULL,
  `creado_el` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_el` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `docentes_v3`
--

INSERT INTO `docentes_v3` (`cedula`, `nombres`, `apellidos`, `fecha_nacimiento`, `rif`, `correo_personal`, `correo_institucional`, `telefonos`, `direccion`, `clave_portal_hash`, `creado_el`, `actualizado_el`) VALUES
('V-10157451', '', 'JOSÉ BECERRA MONTOYA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-10175284', '', 'MARÍA TERESA CANOVAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-10481795', '', 'CONTRERAS ANA YAJAIRA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-10683546', '', 'FLORES HENDRICK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-11105527', 'YOHAN RAMON', 'BAUTISTA MONCADA', '1970-05-15', 'V-11105527-7', NULL, NULL, '04125133060', 'CALLE 11 3-45 LA VICTORIA PARTE BAJA', NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-11106384', '', 'CONTRERAS VEGA ANA YADIRA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-11106623', '', 'JESUS MANUEL RICAURTE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-11109284', '', 'PIERO CATALDO DICHIARA CACERES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-11111242', '', 'BELLA OSORIO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-11227590', '', 'SANDOVAL RIVERA PEDRO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-11296708', '', 'LAURA CASTELLANOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-12228218', '', 'MARIA EMERITA CHACON', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-12517032', '', 'MIGUEL DURÁN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-12517701', '', 'DESIREE SANCHEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-12526013', '', 'EVELIN NIETO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-12580917', '', 'ANOTINA MONAR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-13037358', '', 'MARIANELA GELVES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-13038785', '', 'INGRID OCHOA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-13145093', '', 'FRANKY VARELA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-13230490', 'Yudith Elvira', 'Peña Vera', '1979-01-11', 'V-132304900', 'yudithe.penav@gmail.com', 'yudith.pena.iprgr@upel.edu.ve', '0424745634', 'Av. 3 Calle 3 Urb. Misia Julia Rubio Estado Tàchira', '4652', '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-13283938', '', 'FRANCISCO QUIJARDA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:11', '2026-10-06 12:44:11'),
('V-13302649', '', 'YESENIA YULIET OLIVARES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13303484', '', 'DANIEL CAÑAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13303740', '', 'FLOR NAVARRO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13304171', '', 'THAIS ZAMBRANO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13304865', '', 'MARIA CALDERON', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13582199', '', 'INDIRA CASTRO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13821819', '', 'JESUS FUENTES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13821947', '', 'SILVIA CHACON', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-13999784', '', 'GLENDA FERNANDEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14217306', '', 'JOHAN LAGOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14217854', '', 'LEYDA CAROLINA PARADA DE FERNANDEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14459970', '', 'CARLOS CALDERÓN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14546907', '', 'LUIS PRATO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14598279', '', 'MARYLIN MOLINA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14599710', '', 'GREGORIO TERÁN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14688545', '', 'KARINA ISTURIZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14776205', 'ERIKA', 'MARTINEZ FERNANDEZ ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-14932020', '', 'MAYRA RAMIREZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15001066', '', 'TONY RINCON', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15194091', '', 'ERIKA CHIRINOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15194092', '', 'ERIKA CHIRINOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15438777', '', 'JHON DAVID SANCHEZ CORTES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15854429', '', 'MENDOZA YASQUENI', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15880572', '', 'MIGUEL DAVID DURAN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15881390', '', 'KEYLY NATALI PEREZ ANGARITA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15881391', '', 'KEYLY NATALI PEREZ ANGARITA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-15989092', '', 'WILMER REBOLLEDO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16122526', '', 'LUDDY VARELA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16230119', '', 'LUIS ORTIZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16232048', '', 'NOREIDA MORENO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16280709', '', 'JORGE FLORIAN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16377845', '', 'JEAN ANGEL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16409642', '', 'EDWIN MORENO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16420045', '', 'FELIX GABRIEL GUERRA PEREIRA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16420771', '', 'DIANA  DUQUE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16421138', '', 'WENDY RODRIGUEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16885441', '', 'ANGEL ALEJANDRO PUCHE ROMERO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16959033', '', 'YOLFER MANRIQUE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-16960486', '', 'ALVARO BERON', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17491840', '', 'YOHERKIS GOYENECHE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17491868', '', 'WILLIAN VALDUZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17493024', 'JOSE GREGORIO', 'HERNANDEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17493215', '', 'LISSETTE MORANTES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17493851', '', 'CARLOS MOROS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17690526', '', 'TOVAR GRATEROL CARIBAY GUAQUIRIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17875742', '', 'MAGDA CACERES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17877028', 'Silvia', 'QUEVEDO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17912463', '', 'HAYSLIN GARCIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-17961246', '', 'ADOLFO BAPTISTA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-18010032', '', 'NEUDY CASTILLO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-18228922', '', 'KRISVEL DE SOUSA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-18374498', '', 'ENYERSON GONZALEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-18378499', '', 'CARLOS URBINA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-18791204', '', 'GOMEZ USECHE JOSE EDUARDO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-18959604', '', 'ROSA VIRGINIA PEREZ REYES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:12', '2026-10-06 12:44:12'),
('V-19034337', '', 'MARIA MONTAÑEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-19519008', '', 'MARTÍNEZ SOL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-19540028', '', 'GUSTAVO VALENCIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-19540281', 'CHARLY ROCKMELL', 'SANCHEZ LOPEZ', '1990-01-18', 'V-19540281-3', 'charock1805@gmail.com', 'charly.sanchez.iprgr@upel.edu.ve', '04145747441', 'CALLE 25 BIS -T 36 FIQUEROS PARTE ALTA RUBIO ESTADO TACHIRA', '$2b$10$I0dDgWeJ.79K3wys.rnwWeYM7xKw0i350t72400DW3V6jTPW2QxUC', '2026-10-06 12:44:13', '2026-10-16 06:48:40'),
('V-19541018', '', 'MIGUEL RODRIGUEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-19898013', '', 'TRINIDAD SALAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-19899866', '', 'KENDIS PEÑA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-21002582', '', 'YASODDHARA USECHE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-22726478', '', 'GLIOSMAR NARVAEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-23544042', '', 'JOSÉ VANEGAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-23742852', '', 'ALBEYIMAR LOAIZA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-24745310', '', 'MARÍA VARELA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-24784953', '', 'DANIEL MEJIAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-24785261', '', 'ENDER DURAN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-25166850', '', 'MARGARITA MORANTES', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-25361458', '', 'GONZÁLEZ CARLOS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-25463412', '', 'ARIAN NAVARRO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-26675072', '', 'ORIANY CAMILA RODRIGUEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-26788603', '', 'EDL MANUEL GARAVITO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-26841404', '', 'JOSELIN HERNANDEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-26988792', '', 'ANTHONY MENDOZA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-27601669', '', 'FRANCISCO GARCIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-27815121', '', 'LIBARDO ENMANUEL FLOREZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-27815133', '', 'ANTHONY FLÓREZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-4074672', 'JOSE', 'LEÒN', '1980-07-20', 'V-19540281-3', NULL, NULL, '04145747441', 'RUBIO', NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-4447061', '', 'IVAN ARFILIO BONILLA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-4989176', '', 'DORIS TABORDA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5102820', '', 'HENRY ABREU', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5283288', '', 'FLOR DE LA CRUZ RINCON DE SANCHEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5283350', '', 'CARLOS SIERRA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5445501', '', 'CLEONALDO VARGAS', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5662168', '', 'LUIS SANDOVAL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5664717', '', 'SALCEDO FREDDY', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5730272', '', 'CARLOS URBINA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-5740172', '', 'MARY SOLEDAD MORA DE GARCIA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-6030961', '', 'NUVIA VERGARA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-647952', '', 'ROSA PEÑALOZA DE MOLINA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-7783686', '', 'MIYENKIN ALVAREZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-7899241', '', 'LISLEIDEN LUZARDO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9006286', '', 'DARWIN JUAREZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9129456', '', 'RITA SANCHEZ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9141418', '', 'WILLIAM ACEVEDO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9145601', '', 'DURÁN VALENTÍN', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9146291', '', 'JOSE RONDON', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9174995', '', 'NORIS ABREU', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9233889', '', 'EZBEL OROZCO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9338461', '', 'PASCUAL GERMAN DUQUE ARELLANO', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9462613', '', 'IRIS S. VIELMA PINZON', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9467304', '', 'LUIS VALDEMAR PEÑALOZA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9469345', '', 'AITOR TOVAR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13'),
('V-9952315', '', 'FRANKLIN ARZOLA', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-10-06 12:44:13', '2026-10-06 12:44:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias_catalogo`
--

CREATE TABLE `materias_catalogo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materias_catalogo`
--

INSERT INTO `materias_catalogo` (`id`, `nombre`) VALUES
(1, 'ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA ADOLESCENCIA Y LA ADULTEZ.'),
(2, 'ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA EDAD ESCOLAR (6 A 12 AÑOS)'),
(3, 'ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA PRIMERA INFANCIA (0 A 6 AÑOS)'),
(4, 'ABORDAJE PEDAGÓGICO DEL LENGUAJE'),
(5, 'ACTIVIDAD FÍSICA PARA EL ADULTO MAYOR'),
(6, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN'),
(7, 'ACTIVIDAD FÍSICA, DEPORTE Y RECREACIÓN'),
(8, 'ADAPTACIONES CURRICULARES'),
(9, 'ADQUISICIÓN DE LA LECTURA Y LA ESCRITURA'),
(10, 'ADQUISICIÓN DE UNA SEGUNDA LENGUA EN INGLÉS'),
(11, 'AGROINDUSTRIAS COMUNITARIAS'),
(12, 'ANÁLISIS DEL DISCURSO'),
(13, 'ANÁLISIS DEL TEXTO Y LA REPRESENTACIÓN TEATRAL'),
(14, 'ANÁLISIS FONÉTICO Y FONOLÓGICO DEL INGLÉS'),
(15, 'ANATOMÍA Y FISIOLOGÍA HUMANA'),
(16, 'APRENDIZAJE AUTÓNOMO'),
(17, 'ARTE Y EDUCACIÓN'),
(18, 'ATENCIÓN A NIÑOS Y JÓVENES CON DISCAPACIDAD'),
(19, 'ATENCIÓN EN ESPACIOS DE FAMILIA Y COMUNIDAD'),
(20, 'ATENCIÓN INTEGRAL DEL INFANTE DE 0 A 6 AÑOS'),
(21, 'AULA CULTURAL INTERACTIVA'),
(22, 'AULA MUSICAL INTERACTIVA'),
(23, 'BASES CIENTÍFICAS DE LA ACTIVIDAD FÍSICA'),
(24, 'BIOÉTICA'),
(25, 'CALENDARIO FESTIVO VENEZOLANO'),
(26, 'CAMBIOS ACTUALES DE LA LENGUA ESPAÑOLA'),
(27, 'CIENCIA, TECNOLOGÍA Y SOCIEDAD'),
(28, 'CIENCIAS INTEGRADAS'),
(29, 'CIENCIAS NATURALES'),
(30, 'COMPETENCIAS GERENCIALES EN EL CONTEXTO EDUCATIVO'),
(31, 'COMPRENSIÓN AUDITIVA DEL INGLÉS'),
(32, 'COMPRENSIÓN DE TEXTOS ORALES Y ESCRITOS'),
(33, 'COMPRENSIÓN Y PRODUCCIÓN DE TEXTOS EN INGLÉS'),
(34, 'CONSOLIDACIÓN DE LA COMUNICACIÓN ESCRITA EN INGLÉS'),
(35, 'CONSOLIDACIÓN DE LA COMUNICACIÓN ORAL EN INGLÉS'),
(36, 'CORRIENTES LITERARIAS'),
(37, 'CULTURA DEL MUNDO ANGLOPARLANTE'),
(38, 'CULTURA REGIONAL Y LITERATURA'),
(39, 'CULTURA Y DISCURSO LITERARIO'),
(40, 'DANZA TRADICIONAL VENEZOLANA'),
(41, 'DESARROLLO CURRICULAR'),
(42, 'DESARROLLO DE HABILIDADES PARA LA ESCUCHA'),
(43, 'DESARROLLO DE LA COMUNICACIÓN EN INGLÉS'),
(44, 'DESARROLLO DE PROCESOS COGNITIVOS'),
(45, 'DESARROLLO DE PROCESOS COGNITIVOS DE LAS PERSONAS EN SITUACIÓN DE DISCAPACIDAD'),
(46, 'DESARROLLO INFANTIL I MATERNAL'),
(47, 'DESARROLLO INFANTIL II PREESCOLAR'),
(48, 'DIDÁCTICA DE LA CANCIÓN INFANTIL'),
(49, 'DIDÁCTICA DE LA EDUCACIÓN PREESCOLAR'),
(50, 'DIDÁCTICA DE LA INFORMÁTICA'),
(51, 'DIDÁCTICA DEL INGLÉS'),
(52, 'DIDÁCTICA DEL INGLÉS PARA PÚBLICOS ESPECÍFICOS'),
(53, 'DIDÁCTICA DEL TEATRO'),
(54, 'DIDÁCTICA GENERAL'),
(55, 'DINÁMICA DEL ESPACIO GEOGRÁFICO'),
(56, 'DISCAPACIDAD VISUAL'),
(57, 'DISCAPACIDAD Y DIFERENCIA'),
(58, 'DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS'),
(59, 'DISEÑO INSTRUCCIONAL'),
(60, 'DIVERSIDAD CULTURAL Y LINGÜÍSTICA'),
(61, 'ECONOMÍA CAMPESINA'),
(62, 'ECOPEDAGOGÍA'),
(63, 'EDUCACIÓN AMBIENTAL'),
(64, 'EDUCACIÓN BIOÉTICA Y DERECHOS HUMANOS'),
(65, 'EDUCACIÓN ESPECIAL Y SALUD'),
(66, 'EDUCACIÓN ESTÉTICA'),
(67, 'EDUCACIÓN FÍSICA EN ESPACIOS NO CONVENCIONALES'),
(68, 'EDUCACIÓN FÍSICA Y RECREACIÓN'),
(69, 'EDUCACIÓN INCLUSIVA'),
(70, 'EDUCACIÓN INTERCULTURAL EN EL NIVEL INICIAL'),
(71, 'EDUCACIÓN PARA LA CIUDADANÍA'),
(72, 'EDUCACIÓN PARA LA PARTICIPACIÓN COMUNITARIA'),
(73, 'EDUCACIÓN PARA LA PAZ'),
(74, 'EDUCACIÓN PARA LAS ARTES'),
(75, 'EDUCACIÓN RURAL'),
(76, 'EDUCACIÓN Y DERECHOS HUMANOS'),
(77, 'EDUCACIÓN Y ESCENARIOS CONVENCIONALES Y NO CONVENCIONALES'),
(78, 'EL CIRCO Y PEDAGOGÍA: PAYASOS Y MANIPULACIÓN DE OBJETOS CIRCENSES'),
(79, 'EL JUEGO Y LA CREATIVIDAD'),
(80, 'EL TÍTERE Y LA PEDAGOGÍA'),
(81, 'ENSEÑANZA DE LA LENGUA DE SEÑAS VENEZOLANA'),
(82, 'ENSEÑANZA DE LA LITERATURA'),
(83, 'ESPAÑOL DE VENEZUELA'),
(84, 'ESTRATEGIAS CONVERSACIONALES EN INGLÉS'),
(85, 'ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE'),
(86, 'ESTUDIO DEL DISCURSO LITERARIO EN INGLÉS'),
(87, 'ESTUDIOS LINGÜÍSTICOS Y LITERARIOS INTERCULTURALES'),
(88, 'ETAPAS Y DESARROLLO EMOCIONAL INFANTIL'),
(89, 'EVALUACIÓN DE LA SITUACIÓN DE DISCAPACIDAD'),
(90, 'EVALUACIÓN DE LOS PROCESOS DE ENSEÑANZA Y APRENDIZAJE DEL INGLÉS COMO LENGUA EXTRANJERA'),
(91, 'EVALUACIÓN DEL APRENDIZAJE'),
(92, 'EXPRESIÓN CORPORAL'),
(93, 'EXPRESIÓN ORAL Y ESCRITA'),
(94, 'FONÉTICA Y FONOLOGÍA EN INGLÉS'),
(95, 'FORMACIÓN E INSERCIÓN LABORAL DE PERSONAS CON DISCAPACIDAD.'),
(96, 'FORMACIÓN PERSONAL DEL DOCENTE'),
(97, 'FUNDAMENTOS DE EDUCACIÓN FÍSICA'),
(98, 'FUNDAMENTOS DE LA ECONOMÍA AGRÍCOLA'),
(99, 'FUNDAMENTOS PARA LA ENSEÑANZA DE LA LECTURA Y LA ESCRITURA'),
(100, 'FUNDAMENTOS SOCIOLÓGICOS DE LA EDUCACIÓN RURAL'),
(101, 'GÉNEROS TEXTUALES ACADÉMICOS'),
(102, 'GERENCIA Y LEGISLACIÓN'),
(103, 'GESTIÓN COMUNITARIA I'),
(104, 'GESTIÓN COMUNITARIA II'),
(105, 'GESTIÓN CURRICULAR'),
(106, 'GESTIÓN EN ESCENARIOS ALTERNATIVOS DE APRENDIZAJE'),
(107, 'GRAMÁTICA'),
(108, 'GRAMÁTICA DEL INGLÉS'),
(109, 'HISTORIA DEL TEATRO I'),
(110, 'HISTORIA DEL TEATRO II'),
(111, 'INGLÉS PARA NIÑOS'),
(112, 'INTERDISCIPLINARIEDAD EN LA ENSEÑANZA APRENDIZAJE DE LA CIENCIA'),
(113, 'INTERPRETACIÓN Y CREATIVIDAD MUSICAL'),
(114, 'INTRODUCCIÓN A LA COMUNICACIÓN ESCRITA EN INGLÉS'),
(115, 'INTRODUCCIÓN A LA COMUNICACIÓN ORAL EN INGLÉS'),
(116, 'INTRODUCCIÓN A LA LECTURA Y ESCRITURA EN INGLÉS'),
(117, 'INTRODUCCIÓN A LOS ESTUDIOS DE LA LENGUA'),
(118, 'INTRODUCCIÓN AL ESTUDIO DE LA LENGUA'),
(119, 'INTRODUCCIÓN AL ESTUDIO DEL DISCURSO LITERARIO'),
(120, 'INVESTIGACIÓN I'),
(121, 'INVESTIGACIÓN II'),
(122, 'INVESTIGACIÓN III'),
(123, 'INVESTIGACIÓN IV'),
(124, 'JUEGOS DE MÚSICA Y EXPRESIÓN CORPORAL'),
(125, 'KINESIOLOGÍA EN LA EDUCACIÓN FÍSICA'),
(126, 'LA TEATRALIDAD EN LAS MANIFESTACIONES ARTÍSTICO – TRADICIONALES VENEZOLANAS'),
(127, 'LA TEORÍA LITERARIA Y SU RECEPCIÓN'),
(128, 'LATÍN'),
(129, 'LECTURA Y ESCRITURA EN EDUCACIÓN INICIAL'),
(130, 'LEGISLACIÓN DE LA EDUCACIÓN ESPECIAL'),
(131, 'LEGISLACIÓN EDUCATIVA AGRARIA'),
(132, 'LEGISTACION COMPARADA EN CONTEXTOS INTERCULTURALES'),
(133, 'LENGUA DE SEÑAS VENEZOLANA'),
(134, 'LENGUA DE SEÑAS VENEZOLANA INSTRUMENTAL'),
(135, 'LENGUA Y CULTURA'),
(136, 'LENGUA, LITERATURA Y SOCIEDAD'),
(137, 'LENGUAJE Y PENSAMIENTO'),
(138, 'LÉXICO SEMÁNTICA Y SEMIÓTICA'),
(139, 'LIDERAZGO MAGISTERIAL Y ORATORIA'),
(140, 'LINGÜÍSTICA APLICADA A LA ENSEÑANZA DE LA LENGUA'),
(141, 'LINGÜÍSTICA DEL CORPUS'),
(142, 'LINGÜÍSTICA GENERAL'),
(143, 'LITERATURA JUVENIL'),
(144, 'LITERATURA LATINOAMERICANA Y CARIBEÑA'),
(145, 'LITERATURA VENEZOLANA'),
(146, 'LITERATURA Y ARTE'),
(147, 'LÚDICA Y MOTRICIDAD'),
(148, 'MANIFESTACIONES ESCÉNICAS VENEZOLANAS CONTEMPORÁNEAS'),
(149, 'MANTENIMIENTO DE INSTITUCIONES EDUCATIVAS'),
(150, 'MAQUILLAJE TEATRAL'),
(151, 'MEDIO FÍSICO Y DISCAPACIDAD'),
(152, 'MEDIOS EXPRESIVO DE LA ACTUACIÓN'),
(153, 'MÉTODOS DE ANÁLISIS LITERARIOS'),
(154, 'MOMENTOS DE LA LITERATURA'),
(155, 'MUSICOLOGÍA Y ETNOMUSICOLOGÍA'),
(156, 'NEUROCIENCIA'),
(157, 'NEUROCIENCIA Y EDUCACIÓN'),
(158, 'NEUROMÚSICA'),
(159, 'ORALIDAD Y CORPUS'),
(160, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD'),
(161, 'ORIENTACIÓN PARA LA ATENCIÓN DE PERSONAS EN SITUACIÓN DE DISCAPACIDAD'),
(162, 'PEDAGOGÍA DE LA ACTUACIÓN'),
(163, 'PEDAGOGÍA DE LA DIRECCIÓN TEATRAL'),
(164, 'PEDAGOGÍA DE LA MÚSICA II'),
(165, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO'),
(166, 'PERSPECTIVA DE LA SITUACIÓN DE DISCAPACIDAD'),
(167, 'PERSPECTIVA EDUCATIVA DE LA DISCAPACIDAD MOTORA'),
(168, 'PERSPECTIVAS DE ANÁLISIS LITERARIO'),
(169, 'PLANIFICACIÓN DE LA ENSEÑANZA Y DEL APRENDIZAJE'),
(170, 'PLANIFICACIÓN POR PROYECTO'),
(171, 'PLANIFICACIÓN PROSPECTIVA EN LA EDUCACIÓN'),
(172, 'PRÁCTICA MUSICAL I'),
(173, 'PRÁCTICA MUSICAL II'),
(174, 'PRÁCTICA PROFESIONAL I'),
(175, 'PRÁCTICA PROFESIONAL II'),
(176, 'PRÁCTICA PROFESIONAL III'),
(177, 'PRÁCTICA PROFESIONAL IV'),
(178, 'PREPARACIÓN FÍSICA BÁSICA'),
(179, 'PREVENCIÓN DE LA SITUACIÓN DE DISCAPACIDAD'),
(180, 'PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA'),
(181, 'PREVENCIÓN Y GESTIÓN DE RIESGO'),
(182, 'PROBLEMÁTICA SOCIAL Y APRENDIZAJE'),
(183, 'PRODUCCIÓN DE EVENTOS ARTÍSTICOS'),
(184, 'PRODUCCIÓN Y PUESTA EN ESCENA'),
(185, 'PROGRAMACIÓN DIDÁCTICA CRÍTICO CONSTRUCTIVA'),
(186, 'PROGRAMACIÓN II'),
(187, 'PROMOCIÓN DE LA LECTURA EN EL AULA'),
(188, 'PROYECTOS EDUCATIVOS'),
(189, 'PSICOLOGÍA DE LA CREACIÓN DRAMÁTICA'),
(190, 'PSICOLOGÍA DEL APRENDIZAJE'),
(191, 'PSICOLOGÍA EVOLUTIVA'),
(192, 'RECREACIÓN'),
(193, 'RECURSOS DIDÁCTICOS PARA LA EDUCACIÓN INICIAL'),
(194, 'RECURSOS PARA EL APRENDIZAJE'),
(195, 'REPERTORIO TRADICIONAL VENEZOLANO'),
(196, 'RITMO Y EXPRESIÓN CORPORAL'),
(197, 'SALUD INTEGRAL'),
(198, 'SALUD PREVENTIVA'),
(199, 'SEMINARIO DE INMERSIÓN TOTAL EN INGLÉS'),
(200, 'SEMINARIO DE INVESTIGACIÓN'),
(201, 'SEMINARIO DE LECTURA Y ESCRITURA'),
(202, 'SEMINARIO DE POLÍTICAS EDUCATIVAS DEL MUNDO ANGLOPARLANTE'),
(203, 'SEMINARIO DE TEATRO'),
(204, 'SEMINARIO DE TÉCNICAS DE TRADUCCIÓN'),
(205, 'SISTEMA BRAILLE'),
(206, 'SISTEMAS AUMENTATIVOS DE COMUNICACIÓN'),
(207, 'SOCIEDAD Y EDUCACIÓN'),
(208, 'SOFTWARE EN EDUCACIÓN MUSICAL'),
(209, 'TALLER BÁSICO RURAL I'),
(210, 'TALLER DE CREACIÓN LITERARIA'),
(211, 'TALLER DE EXPRESIÓN ARTÍSTICA INTEGRAL'),
(212, 'TALLER DE JUEGOS ESCÉNICOS'),
(213, 'TALLER DE MAQUETAS Y MODELOS TRIDIMENSIONALES CON FINES DIDÁCTICOS'),
(214, 'TALLER DE TEATRO INFANTIL'),
(215, 'TALLER DE TEATRO LATINOAMERICANO'),
(216, 'TALLER DE TEATRO VENEZOLANO'),
(217, 'TÉCNICAS Y ESTRATEGIAS DE LA ENSEÑANZA DEL INGLÉS EN LÍNEA'),
(218, 'TECNOLOGÍA TEATRAL'),
(219, 'TECNOLOGÍAS E INNOVACIONES EDUCATIVAS'),
(220, 'TENDENCIAS ACTUALES Y FUTURAS PARA LA ATENCIÓN DE LA PERSONA EN SITUACIÓN DE DISCAPACIDAD'),
(221, 'TENDENCIAS DE LA LINGÜÍSTICA'),
(222, 'TEORÍA LITERARIA'),
(223, 'TEORÍA Y PRÁCTICA DE LA MOTRICIDAD HUMANA'),
(224, 'TIC I'),
(225, 'TIC II'),
(226, 'TIC III'),
(227, 'TIC IV'),
(228, 'TOPÓNIMO E IDENTIDAD'),
(229, 'TRANSICIÓN DE PREESCOLAR  A PRIMER GRADO'),
(230, 'TRANSICIÓN DE PREESCOLAR A PRIMER GRADO'),
(231, 'VEJEZ Y DESARROLLO DE LA PERSONA EN SITUACIÓN DE DISCAPACIDAD'),
(232, 'VISIÓN SOCIO ANTROPOLÓGICA DE LA DISCAPACIDAD'),
(233, 'VISIONES DE LA LITERATURA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias_catalogo_v3`
--

CREATE TABLE `materias_catalogo_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `departamento_id` int(10) UNSIGNED DEFAULT NULL,
  `horas_semanales_referencial` tinyint(3) UNSIGNED NOT NULL DEFAULT 4
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `materias_catalogo_v3`
--

INSERT INTO `materias_catalogo_v3` (`id`, `nombre`, `departamento_id`, `horas_semanales_referencial`) VALUES
(1, 'ACTIVIDAD FÍSICA PARA EL ADULTO MAYOR', NULL, 4),
(2, 'ACTIVIDAD FÍSICA, DEPORTE  Y RECREACIÓN', NULL, 4),
(3, 'AGROINDUSTRIAS COMUNITARIAS', NULL, 4),
(4, 'ANATOMÍA Y FISIOLOGÍA HUMANA', NULL, 4),
(5, 'APRENDIZAJE AUTÓNOMO', NULL, 4),
(6, 'ATENCIÓN A NIÑOS Y JÓVENES CON DISCAPACIDAD', NULL, 4),
(7, 'ATENCIÓN EN ESPACIOS DE FAMILIA Y COMUNIDAD', NULL, 4),
(8, 'ATENCIÓN INTEGRAL DEL INFANTE DE 0 A 6 AÑOS', NULL, 4),
(9, 'AULA CULTURAL INTERACTIVA', NULL, 4),
(10, 'AULA MUSICAL INTERACTIVA', NULL, 4),
(11, 'BASES CIENTÍFICAS DE LA ACTIVIDAD FÍSICA', NULL, 4),
(12, 'CALENDARIO FESTIVO VENEZOLANO', NULL, 4),
(13, 'CIENCIA, TECNOLOGÍA Y SOCIEDAD', NULL, 4),
(14, 'CIENCIAS INTEGRADAS', NULL, 4),
(15, 'CIENCIAS NATURALES', NULL, 4),
(16, 'COMPETENCIAS GERENCIALES EN EL CONTEXTO EDUCATIVO', NULL, 4),
(17, 'DESARROLLO CURRICULAR', NULL, 4),
(18, 'DESARROLLO DE PROCESOS COGNITIVOS', NULL, 4),
(19, 'DESARROLLO INFANTIL I MATERNAL', NULL, 4),
(20, 'DESARROLLO INFANTIL II PREESCOLAR', NULL, 4),
(21, 'DIDÁCTICA DE LA CANCIÓN INFANTIL', NULL, 4),
(22, 'DIDÁCTICA DE LA EDUCACIÓN PREESCOLAR', NULL, 4),
(23, 'DIDÁCTICA DE LA INFORMÁTICA', NULL, 4),
(24, 'DIDÁCTICA GENERAL', NULL, 4),
(25, 'DINÁMICA DEL ESPACIO GEOGRÁFICO', NULL, 4),
(26, 'DISCURSO ESPECIALIZADO EN IDIOMA INGLÉS', NULL, 4),
(27, 'DISEÑO INSTRUCCIONAL', NULL, 4),
(28, 'ECONOMÍA CAMPESINA', NULL, 4),
(29, 'ECOPEDAGOGÍA', NULL, 4),
(30, 'EDUCACIÓN AMBIENTAL', NULL, 4),
(31, 'EDUCACIÓN BIOÉTICA Y DERECHOS HUMANOS', NULL, 4),
(32, 'EDUCACIÓN FÍSICA EN ESPACIOS NO CONVENCIONALES', NULL, 4),
(33, 'EDUCACIÓN FÍSICA Y RECREACIÓN', NULL, 4),
(34, 'EDUCACIÓN INCLUSIVA', NULL, 4),
(35, 'EDUCACIÓN INTERCULTURAL EN EL NIVEL INICIAL', NULL, 4),
(36, 'EDUCACIÓN PARA LA CIUDADANÍA', NULL, 4),
(37, 'EDUCACIÓN PARA LA PARTICIPACIÓN COMUNITARIA', NULL, 4),
(38, 'EDUCACIÓN PARA LA PAZ', NULL, 4),
(39, 'EDUCACIÓN PARA LAS ARTES', NULL, 4),
(40, 'EDUCACIÓN RURAL', NULL, 4),
(41, 'EDUCACIÓN Y DERECHOS HUMANOS', NULL, 4),
(42, 'ENSEÑANZA DE LA LITERATURA', NULL, 4),
(43, 'ESTRATEGIAS METACOGNITIVAS PARA EL APRENDIZAJE', NULL, 4),
(44, 'ETAPAS Y DESARROLLO EMOCIONAL INFANTIL', NULL, 4),
(45, 'EVALUACIÓN DEL APRENDIZAJE', NULL, 4),
(46, 'EXPRESIÓN ORAL Y ESCRITA', NULL, 4),
(47, 'FORMACIÓN PERSONAL DEL DOCENTE', NULL, 4),
(48, 'FUNDAMENTOS DE EDUCACIÓN FÍSICA', NULL, 4),
(49, 'FUNDAMENTOS DE LA ECONOMÍA AGRÍCOLA', NULL, 4),
(50, 'FUNDAMENTOS PARA LA ENSEÑANZA DE LA LECTURA Y LA ESCRITURA', NULL, 4),
(51, 'FUNDAMENTOS SOCIOLÓGICOS DE LA EDUCACIÓN RURAL', NULL, 4),
(52, 'GERENCIA Y LEGISLACIÓN', NULL, 4),
(53, 'GESTIÓN COMUNITARIA I', NULL, 4),
(54, 'GESTIÓN COMUNITARIA II', NULL, 4),
(55, 'GESTIÓN EN ESCENARIOS ALTERNATIVOS DE APRENDIZAJE', NULL, 4),
(56, 'INTERDISCIPLINARIEDAD EN LA ENSEÑANZA APRENDIZAJE DE LA CIENCIA', NULL, 4),
(57, 'INTERPRETACIÓN Y CREATIVIDAD MUSICAL', NULL, 4),
(58, 'INTRODUCCIÓN AL ESTUDIO DE LA LENGUA', NULL, 4),
(59, 'INVESTIGACIÓN I', NULL, 4),
(60, 'INVESTIGACIÓN II', NULL, 4),
(61, 'INVESTIGACIÓN III', NULL, 4),
(62, 'INVESTIGACIÓN IV', NULL, 4),
(63, 'JUEGOS DE MÚSICA Y EXPRESIÓN CORPORAL', NULL, 4),
(64, 'KINESIOLOGÍA EN LA EDUCACIÓN FÍSICA', NULL, 4),
(65, 'LECTURA Y ESCRITURA EN EDUCACIÓN INICIAL', NULL, 4),
(66, 'LEGISLACIÓN EDUCATIVA AGRARIA', NULL, 4),
(67, 'LEGISTACION COMPARADA EN CONTEXTOS INTERCULTURALES', NULL, 4),
(68, 'LÚDICA Y MOTRICIDAD', NULL, 4),
(69, 'MANTENIMIENTO DE INSTITUCIONES EDUCATIVAS', NULL, 4),
(70, 'MUSICOLOGÍA Y ETNOMUSICOLOGÍA', NULL, 4),
(71, 'NEUROCIENCIA Y EDUCACIÓN', NULL, 4),
(72, 'NEUROMÚSICA', NULL, 4),
(73, 'ORIENTACIÓN EDUCATIVA Y DIVERSIDAD', NULL, 4),
(74, 'PEDAGOGÍA DE LA MÚSICA II', NULL, 4),
(75, 'PENSAMIENTO FILOSÓFICO Y PEDAGÓGICO', NULL, 4),
(76, 'PLANIFICACIÓN DE LA ENSEÑANZA Y DEL APRENDIZAJE', NULL, 4),
(77, 'PLANIFICACIÓN POR PROYECTO', NULL, 4),
(78, 'PRÁCTICA MUSICAL I', NULL, 4),
(79, 'PRÁCTICA MUSICAL II', NULL, 4),
(80, 'PRÁCTICA PROFESIONAL I', NULL, 4),
(81, 'PRÁCTICA PROFESIONAL II', NULL, 4),
(82, 'PRÁCTICA PROFESIONAL III', NULL, 4),
(83, 'PRÁCTICA PROFESIONAL IV', NULL, 4),
(84, 'PREPARACIÓN FÍSICA BÁSICA', NULL, 4),
(85, 'PREVENCIÓN Y ATENCIÓN PRIMARIA EN LA ACTIVIDAD FÍSICA', NULL, 4),
(86, 'PREVENCIÓN Y GESTIÓN DE RIESGO', NULL, 4),
(87, 'PROBLEMÁTICA SOCIAL Y APRENDIZAJE', NULL, 4),
(88, 'PRODUCCIÓN DE EVENTOS ARTÍSTICOS', NULL, 4),
(89, 'PROGRAMACIÓN II', NULL, 4),
(90, 'PROYECTOS EDUCATIVOS', NULL, 4),
(91, 'PSICOLOGÍA DEL APRENDIZAJE', NULL, 4),
(92, 'RECREACIÓN', NULL, 4),
(93, 'RECURSOS DIDÁCTICOS PARA LA EDUCACIÓN INICIAL', NULL, 4),
(94, 'RECURSOS PARA EL APRENDIZAJE', NULL, 4),
(95, 'REPERTORIO TRADICIONAL VENEZOLANO', NULL, 4),
(96, 'RITMO Y EXPRESIÓN CORPORAL', NULL, 4),
(97, 'SALUD INTEGRAL', NULL, 4),
(98, 'SALUD PREVENTIVA', NULL, 4),
(99, 'SOCIEDAD Y EDUCACIÓN', NULL, 4),
(100, 'SOFTWARE EN EDUCACIÓN MUSICAL', NULL, 4),
(101, 'TALLER BÁSICO RURAL I', NULL, 4),
(102, 'TECNOLOGÍAS E INNOVACIONES EDUCATIVAS', NULL, 4),
(103, 'TEORÍA Y PRÁCTICA DE LA MOTRICIDAD HUMANA', NULL, 4),
(104, 'TIC I', NULL, 4),
(105, 'TIC II', NULL, 4),
(106, 'TIC III', NULL, 4),
(107, 'TIC IV', NULL, 4),
(108, 'TRANSICIÓN DE PREESCOLAR  A PRIMER GRADO', NULL, 4),
(393, 'ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA ADOLESCENCIA Y LA ADULTEZ.', NULL, 4),
(394, 'ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA EDAD ESCOLAR (6 A 12 AÑOS)', NULL, 4),
(395, 'ABORDAJE PEDAGÓGICO DE LA SITUACIÓN DE DISCAPACIDAD EN LA PRIMERA INFANCIA (0 A 6 AÑOS)', NULL, 4),
(396, 'ABORDAJE PEDAGÓGICO DEL LENGUAJE', NULL, 4),
(398, 'ACTIVIDAD FÍSICA, DEPORTE Y RECREACIÓN', NULL, 4),
(399, 'ADAPTACIONES CURRICULARES', NULL, 4),
(400, 'ADQUISICIÓN DE LA LECTURA Y LA ESCRITURA', NULL, 4),
(401, 'ADQUISICIÓN DE UNA SEGUNDA LENGUA EN INGLÉS', NULL, 4),
(403, 'ANÁLISIS DEL DISCURSO', NULL, 4),
(404, 'ANÁLISIS DEL TEXTO Y LA REPRESENTACIÓN TEATRAL', NULL, 4),
(405, 'ANÁLISIS FONÉTICO Y FONOLÓGICO DEL INGLÉS', NULL, 4),
(408, 'ARTE Y EDUCACIÓN', NULL, 4),
(415, 'BIOÉTICA', NULL, 4),
(417, 'CAMBIOS ACTUALES DE LA LENGUA ESPAÑOLA', NULL, 4),
(422, 'COMPRENSIÓN AUDITIVA DEL INGLÉS', NULL, 4),
(423, 'COMPRENSIÓN DE TEXTOS ORALES Y ESCRITOS', NULL, 4),
(424, 'COMPRENSIÓN Y PRODUCCIÓN DE TEXTOS EN INGLÉS', NULL, 4),
(425, 'CONSOLIDACIÓN DE LA COMUNICACIÓN ESCRITA EN INGLÉS', NULL, 4),
(426, 'CONSOLIDACIÓN DE LA COMUNICACIÓN ORAL EN INGLÉS', NULL, 4),
(427, 'CORRIENTES LITERARIAS', NULL, 4),
(428, 'CULTURA DEL MUNDO ANGLOPARLANTE', NULL, 4),
(429, 'CULTURA REGIONAL Y LITERATURA', NULL, 4),
(430, 'CULTURA Y DISCURSO LITERARIO', NULL, 4),
(431, 'DANZA TRADICIONAL VENEZOLANA', NULL, 4),
(433, 'DESARROLLO DE HABILIDADES PARA LA ESCUCHA', NULL, 4),
(434, 'DESARROLLO DE LA COMUNICACIÓN EN INGLÉS', NULL, 4),
(436, 'DESARROLLO DE PROCESOS COGNITIVOS DE LAS PERSONAS EN SITUACIÓN DE DISCAPACIDAD', NULL, 4),
(442, 'DIDÁCTICA DEL INGLÉS', NULL, 4),
(443, 'DIDÁCTICA DEL INGLÉS PARA PÚBLICOS ESPECÍFICOS', NULL, 4),
(444, 'DIDÁCTICA DEL TEATRO', NULL, 4),
(447, 'DISCAPACIDAD VISUAL', NULL, 4),
(448, 'DISCAPACIDAD Y DIFERENCIA', NULL, 4),
(451, 'DIVERSIDAD CULTURAL Y LINGÜÍSTICA', NULL, 4),
(456, 'EDUCACIÓN ESPECIAL Y SALUD', NULL, 4),
(457, 'EDUCACIÓN ESTÉTICA', NULL, 4),
(468, 'EDUCACIÓN Y ESCENARIOS CONVENCIONALES Y NO CONVENCIONALES', NULL, 4),
(469, 'EL CIRCO Y PEDAGOGÍA: PAYASOS Y MANIPULACIÓN DE OBJETOS CIRCENSES', NULL, 4),
(470, 'EL JUEGO Y LA CREATIVIDAD', NULL, 4),
(471, 'EL TÍTERE Y LA PEDAGOGÍA', NULL, 4),
(472, 'ENSEÑANZA DE LA LENGUA DE SEÑAS VENEZOLANA', NULL, 4),
(474, 'ESPAÑOL DE VENEZUELA', NULL, 4),
(475, 'ESTRATEGIAS CONVERSACIONALES EN INGLÉS', NULL, 4),
(477, 'ESTUDIO DEL DISCURSO LITERARIO EN INGLÉS', NULL, 4),
(478, 'ESTUDIOS LINGÜÍSTICOS Y LITERARIOS INTERCULTURALES', NULL, 4),
(480, 'EVALUACIÓN DE LA SITUACIÓN DE DISCAPACIDAD', NULL, 4),
(481, 'EVALUACIÓN DE LOS PROCESOS DE ENSEÑANZA Y APRENDIZAJE DEL INGLÉS COMO LENGUA EXTRANJERA', NULL, 4),
(483, 'EXPRESIÓN CORPORAL', NULL, 4),
(485, 'FONÉTICA Y FONOLOGÍA EN INGLÉS', NULL, 4),
(486, 'FORMACIÓN E INSERCIÓN LABORAL DE PERSONAS CON DISCAPACIDAD.', NULL, 4),
(492, 'GÉNEROS TEXTUALES ACADÉMICOS', NULL, 4),
(496, 'GESTIÓN CURRICULAR', NULL, 4),
(498, 'GRAMÁTICA', NULL, 4),
(499, 'GRAMÁTICA DEL INGLÉS', NULL, 4),
(500, 'HISTORIA DEL TEATRO I', NULL, 4),
(501, 'HISTORIA DEL TEATRO II', NULL, 4),
(502, 'INGLÉS PARA NIÑOS', NULL, 4),
(505, 'INTRODUCCIÓN A LA COMUNICACIÓN ESCRITA EN INGLÉS', NULL, 4),
(506, 'INTRODUCCIÓN A LA COMUNICACIÓN ORAL EN INGLÉS', NULL, 4),
(507, 'INTRODUCCIÓN A LA LECTURA Y ESCRITURA EN INGLÉS', NULL, 4),
(508, 'INTRODUCCIÓN A LOS ESTUDIOS DE LA LENGUA', NULL, 4),
(510, 'INTRODUCCIÓN AL ESTUDIO DEL DISCURSO LITERARIO', NULL, 4),
(517, 'LA TEATRALIDAD EN LAS MANIFESTACIONES ARTÍSTICO – TRADICIONALES VENEZOLANAS', NULL, 4),
(518, 'LA TEORÍA LITERARIA Y SU RECEPCIÓN', NULL, 4),
(519, 'LATÍN', NULL, 4),
(521, 'LEGISLACIÓN DE LA EDUCACIÓN ESPECIAL', NULL, 4),
(524, 'LENGUA DE SEÑAS VENEZOLANA', NULL, 4),
(525, 'LENGUA DE SEÑAS VENEZOLANA INSTRUMENTAL', NULL, 4),
(526, 'LENGUA Y CULTURA', NULL, 4),
(527, 'LENGUA, LITERATURA Y SOCIEDAD', NULL, 4),
(528, 'LENGUAJE Y PENSAMIENTO', NULL, 4),
(529, 'LÉXICO SEMÁNTICA Y SEMIÓTICA', NULL, 4),
(530, 'LIDERAZGO MAGISTERIAL Y ORATORIA', NULL, 4),
(531, 'LINGÜÍSTICA APLICADA A LA ENSEÑANZA DE LA LENGUA', NULL, 4),
(532, 'LINGÜÍSTICA DEL CORPUS', NULL, 4),
(533, 'LINGÜÍSTICA GENERAL', NULL, 4),
(534, 'LITERATURA JUVENIL', NULL, 4),
(535, 'LITERATURA LATINOAMERICANA Y CARIBEÑA', NULL, 4),
(536, 'LITERATURA VENEZOLANA', NULL, 4),
(537, 'LITERATURA Y ARTE', NULL, 4),
(539, 'MANIFESTACIONES ESCÉNICAS VENEZOLANAS CONTEMPORÁNEAS', NULL, 4),
(541, 'MAQUILLAJE TEATRAL', NULL, 4),
(542, 'MEDIO FÍSICO Y DISCAPACIDAD', NULL, 4),
(543, 'MEDIOS EXPRESIVO DE LA ACTUACIÓN', NULL, 4),
(544, 'MÉTODOS DE ANÁLISIS LITERARIOS', NULL, 4),
(545, 'MOMENTOS DE LA LITERATURA', NULL, 4),
(547, 'NEUROCIENCIA', NULL, 4),
(550, 'ORALIDAD Y CORPUS', NULL, 4),
(552, 'ORIENTACIÓN PARA LA ATENCIÓN DE PERSONAS EN SITUACIÓN DE DISCAPACIDAD', NULL, 4),
(553, 'PEDAGOGÍA DE LA ACTUACIÓN', NULL, 4),
(554, 'PEDAGOGÍA DE LA DIRECCIÓN TEATRAL', NULL, 4),
(557, 'PERSPECTIVA DE LA SITUACIÓN DE DISCAPACIDAD', NULL, 4),
(558, 'PERSPECTIVA EDUCATIVA DE LA DISCAPACIDAD MOTORA', NULL, 4),
(559, 'PERSPECTIVAS DE ANÁLISIS LITERARIO', NULL, 4),
(562, 'PLANIFICACIÓN PROSPECTIVA EN LA EDUCACIÓN', NULL, 4),
(570, 'PREVENCIÓN DE LA SITUACIÓN DE DISCAPACIDAD', NULL, 4),
(575, 'PRODUCCIÓN Y PUESTA EN ESCENA', NULL, 4),
(576, 'PROGRAMACIÓN DIDÁCTICA CRÍTICO CONSTRUCTIVA', NULL, 4),
(578, 'PROMOCIÓN DE LA LECTURA EN EL AULA', NULL, 4),
(580, 'PSICOLOGÍA DE LA CREACIÓN DRAMÁTICA', NULL, 4),
(582, 'PSICOLOGÍA EVOLUTIVA', NULL, 4),
(590, 'SEMINARIO DE INMERSIÓN TOTAL EN INGLÉS', NULL, 4),
(591, 'SEMINARIO DE INVESTIGACIÓN', NULL, 4),
(592, 'SEMINARIO DE LECTURA Y ESCRITURA', NULL, 4),
(593, 'SEMINARIO DE POLÍTICAS EDUCATIVAS DEL MUNDO ANGLOPARLANTE', NULL, 4),
(594, 'SEMINARIO DE TEATRO', NULL, 4),
(595, 'SEMINARIO DE TÉCNICAS DE TRADUCCIÓN', NULL, 4),
(596, 'SISTEMA BRAILLE', NULL, 4),
(597, 'SISTEMAS AUMENTATIVOS DE COMUNICACIÓN', NULL, 4),
(601, 'TALLER DE CREACIÓN LITERARIA', NULL, 4),
(602, 'TALLER DE EXPRESIÓN ARTÍSTICA INTEGRAL', NULL, 4),
(603, 'TALLER DE JUEGOS ESCÉNICOS', NULL, 4),
(604, 'TALLER DE MAQUETAS Y MODELOS TRIDIMENSIONALES CON FINES DIDÁCTICOS', NULL, 4),
(605, 'TALLER DE TEATRO INFANTIL', NULL, 4),
(606, 'TALLER DE TEATRO LATINOAMERICANO', NULL, 4),
(607, 'TALLER DE TEATRO VENEZOLANO', NULL, 4),
(608, 'TÉCNICAS Y ESTRATEGIAS DE LA ENSEÑANZA DEL INGLÉS EN LÍNEA', NULL, 4),
(609, 'TECNOLOGÍA TEATRAL', NULL, 4),
(611, 'TENDENCIAS ACTUALES Y FUTURAS PARA LA ATENCIÓN DE LA PERSONA EN SITUACIÓN DE DISCAPACIDAD', NULL, 4),
(612, 'TENDENCIAS DE LA LINGÜÍSTICA', NULL, 4),
(613, 'TEORÍA LITERARIA', NULL, 4),
(619, 'TOPÓNIMO E IDENTIDAD', NULL, 4),
(620, 'TRANSICIÓN DE PREESCOLAR A PRIMER GRADO', NULL, 4),
(621, 'VEJEZ Y DESARROLLO DE LA PERSONA EN SITUACIÓN DE DISCAPACIDAD', NULL, 4),
(622, 'VISIÓN SOCIO ANTROPOLÓGICA DE LA DISCAPACIDAD', NULL, 4),
(623, 'VISIONES DE LA LITERATURA', NULL, 4),
(840, '', NULL, 4),
(841, 'CÁLCULO I', NULL, 4),
(842, 'ÁLGEBRA LINEAL', NULL, 4),
(843, 'GEOMETRÍA I', NULL, 4),
(881, 'INVESTIGACIÓN EDUCATIVA', NULL, 4),
(892, 'INTRODUCCIÓN A LA INVESTIGACIÓN', NULL, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos_academicos`
--

CREATE TABLE `periodos_academicos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `estado` enum('ACTIVO','PLANIFICACION','CERRADO') NOT NULL DEFAULT 'PLANIFICACION',
  `semanas` int(11) DEFAULT 15,
  `fechaDesde` varchar(20) DEFAULT '',
  `fechaHasta` varchar(20) DEFAULT '',
  `observaciones` varchar(255) DEFAULT '',
  `fechaCreacion` datetime DEFAULT current_timestamp(),
  `fechaActivacion` datetime DEFAULT NULL,
  `fechaCierre` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `periodos_academicos`
--

INSERT INTO `periodos_academicos` (`id`, `nombre`, `estado`, `semanas`, `fechaDesde`, `fechaHasta`, `observaciones`, `fechaCreacion`, `fechaActivacion`, `fechaCierre`) VALUES
(1, '2026-I', 'CERRADO', 15, '2026-05-21', '2026-11-30', 'Período reactivado institucionalmente como oficial en curso', '2026-10-06 20:42:54', '2026-10-06 20:42:54', '2026-10-16 06:41:21'),
(2, '2026-II', 'ACTIVO', 15, '2026-11-03', '2027-02-20', 'Período reactivado institucionalmente como oficial en curso', '2026-10-06 20:42:54', '2026-10-15 18:29:32', NULL),
(4, '2027-I', 'CERRADO', 15, '2026-10-16', '2027-01-29', 'Siguiente período abierto para planificación y asignación anticipada', '2026-10-15 18:29:33', '2026-10-16 06:41:21', '2026-10-16 06:42:18'),
(5, '2027-II', 'PLANIFICACION', 15, '', '', 'Siguiente período abierto para planificación y asignación anticipada', '2026-10-16 06:41:21', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `periodos_academicos_v3`
--

CREATE TABLE `periodos_academicos_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `estado` enum('ACTIVO','PLANIFICACION','CERRADO') NOT NULL DEFAULT 'PLANIFICACION',
  `semanas` tinyint(3) UNSIGNED NOT NULL DEFAULT 15,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `observaciones` varchar(255) DEFAULT '',
  `creado_el` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `periodos_academicos_v3`
--

INSERT INTO `periodos_academicos_v3` (`id`, `nombre`, `estado`, `semanas`, `fecha_inicio`, `fecha_fin`, `observaciones`, `creado_el`) VALUES
(1, '2026-I', 'CERRADO', 15, '2026-05-21', '2026-10-03', 'Período reactivado institucionalmente como oficial en curso', '2026-10-06 12:44:09'),
(2, '2026-II', 'ACTIVO', 15, '2026-11-03', '2027-02-20', 'Período reactivado institucionalmente como oficial en curso', '2026-10-06 12:44:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sedes_v3`
--

CREATE TABLE `sedes_v3` (
  `id` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `sedes_v3`
--

INSERT INTO `sedes_v3` (`id`, `nombre`, `activo`) VALUES
(1, 'Rubio', 1),
(2, 'Encontrados', 1),
(3, 'Sabana de Mendoza', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `role` enum('ADMIN','JEFE','AUDITOR','DOCENCIA') NOT NULL,
  `department` varchar(100) NOT NULL,
  `correo` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `password`, `name`, `role`, `department`, `correo`) VALUES
(1, 'yudith', '$2b$10$4R3wV3RDWOwaJtKPhAHWA.bqvHDUypoH8XTpmgDOnwayIMgzhxQb.', 'Unidad de Informatica', 'ADMIN', 'Todos', ''),
(2, 'carlos.gamez', '$2b$10$pMMvcOKrLRD8jtW2PWDVme907HPHl/ZhIAZxEyP7JYex9aSPN20bC', 'Dr. Carlos Gamez', 'JEFE', 'Matemática', ''),
(3, 'dpto.agroindustrial', '$2b$10$BkCzYPOs8qsjsnhBuYLs/e2Yfh7W8JlHAxCSS91X4g.i6nWV6omwW', 'Dr. Sergio J. Villaruel', 'JEFE', 'Agroindustrial', ''),
(4, 'dpto.sociales', '$2b$10$RslyYBQNfDwq.mfrYN.Dku4rB.d2DcrLUd5.m2txMELsJRYMBAp2m', 'Dra. Lorena Alvarez', 'JEFE', 'Ciencias Sociales', ''),
(5, 'dpto.pedagogia', '$2b$10$NlsdglZNimha93IHOP3RnOqReDsm8PiccmiJ/EZ5W0rtgMsxhk57O', 'Dr. Andry E. Bonilla ', 'JEFE', 'Pedagogía', ''),
(6, 'talentohumano', '$2b$10$VNvEs45srSWPpW/ojiF1.O298uirXu8DrCVzIwdI7/6nhds4jP18S', 'seccion.tecnica', 'AUDITOR', 'Todos', ''),
(7, 'subdireccion.docencia', '$2b$10$L1yt0WLny/VFEv/LcV1Vt.dMMnXCGpv0N0YoIS8DlmPYEc609/rwu', 'Dra. Carmen Narvaez', 'AUDITOR', 'Todos', '');

-- --------------------------------------------------------

--
-- Estructura para la vista `docentes`
--
DROP TABLE IF EXISTS `docentes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `docentes`  AS SELECT `d`.`cedula` AS `cedula`, `d`.`nombres` AS `nombres`, `d`.`apellidos` AS `apellidos`, ifnull(`dep`.`nombre`,'Matemática') AS `department`, ifnull(`c`.`status`,'Por Revisar') AS `status`, ifnull(date_format(`d`.`fecha_nacimiento`,'%Y-%m-%d'),'') AS `fechaNac`, ifnull(`d`.`rif`,'') AS `rif`, ifnull(`d`.`correo_personal`,'') AS `correo`, ifnull(`d`.`correo_institucional`,'') AS `correoInstitucional`, ifnull(`d`.`direccion`,'') AS `direccion`, ifnull(`d`.`telefonos`,'') AS `telefonos`, ifnull(`b`.`banco`,'') AS `banco`, ifnull(`b`.`cuenta_bancaria`,'') AS `cuentaBancaria`, ifnull(`b`.`tipo_cuenta`,'Ahorro') AS `tipoCuenta`, ifnull(`c`.`titulos_pregrado`,'') AS `titulosPregrado`, ifnull(`c`.`titulos_postgrado`,'') AS `titulosPostgrado`, ifnull(`c`.`doctorado`,'') AS `doctorado`, ifnull(`c`.`categoria_docente`,'Instructor') AS `categoriaDocente`, ifnull(`c`.`dedicacion`,'Tiempo Convencional') AS `dedicacion`, ifnull(`p`.`nombre`,'2026-I') AS `periodoAcademico`, ifnull(`c`.`semanas`,15) AS `semanas`, ifnull(date_format(`c`.`fecha_desde`,'%Y-%m-%d'),'') AS `fechaDesde`, ifnull(date_format(`c`.`fecha_hasta`,'%Y-%m-%d'),'') AS `fechaHasta`, ifnull(`s`.`nombre`,'Rubio') AS `sedeCentro`, ifnull(`c`.`especialidad`,'') AS `especialidad`, `d`.`clave_portal_hash` AS `clave` FROM (((((`docentes_v3` `d` left join (select `c1`.`id` AS `id`,`c1`.`docente_cedula` AS `docente_cedula`,`c1`.`periodo_id` AS `periodo_id`,`c1`.`departamento_id` AS `departamento_id`,`c1`.`sede_id` AS `sede_id`,`c1`.`status` AS `status`,`c1`.`categoria_docente` AS `categoria_docente`,`c1`.`dedicacion` AS `dedicacion`,`c1`.`especialidad` AS `especialidad`,`c1`.`semanas` AS `semanas`,`c1`.`fecha_desde` AS `fecha_desde`,`c1`.`fecha_hasta` AS `fecha_hasta`,`c1`.`titulos_pregrado` AS `titulos_pregrado`,`c1`.`titulos_postgrado` AS `titulos_postgrado`,`c1`.`doctorado` AS `doctorado`,`c1`.`observaciones` AS `observaciones`,`c1`.`creado_el` AS `creado_el`,`c1`.`actualizado_el` AS `actualizado_el` from (`docentes_contrataciones_v3` `c1` join (select `docentes_contrataciones_v3`.`docente_cedula` AS `docente_cedula`,max(`docentes_contrataciones_v3`.`id`) AS `max_id` from `docentes_contrataciones_v3` group by `docentes_contrataciones_v3`.`docente_cedula`) `c2` on(`c1`.`id` = `c2`.`max_id`))) `c` on(`d`.`cedula` = `c`.`docente_cedula`)) left join `periodos_academicos_v3` `p` on(`c`.`periodo_id` = `p`.`id`)) left join `departamentos_v3` `dep` on(`c`.`departamento_id` = `dep`.`id`)) left join `sedes_v3` `s` on(`c`.`sede_id` = `s`.`id`)) left join `docentes_datos_bancarios_v3` `b` on(`d`.`cedula` = `b`.`docente_cedula` and `b`.`es_principal` = 1)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `docentes_materias`
--
DROP TABLE IF EXISTS `docentes_materias`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `docentes_materias`  AS SELECT `ca`.`id` AS `id`, `c`.`docente_cedula` AS `docente_cedula`, `m`.`nombre` AS `nombre`, `ca`.`horas_semanal` AS `horasSemanal`, `ca`.`horas_lapso` AS `horasLapso`, `ca`.`especialidad_destino` AS `especialidadDestino`, `ca`.`seccion` AS `seccion`, `ca`.`cupos` AS `cupos`, `ca`.`inscritos` AS `inscritos`, `ca`.`cohorte` AS `cohorte`, `p`.`nombre` AS `periodoAcademico` FROM (((`cargas_academicas_v3` `ca` join `docentes_contrataciones_v3` `c` on(`ca`.`contratacion_id` = `c`.`id`)) join `materias_catalogo_v3` `m` on(`ca`.`materia_id` = `m`.`id`)) left join `periodos_academicos_v3` `p` on(`c`.`periodo_id` = `p`.`id`)) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_logs_timestamp` (`timestamp`),
  ADD KEY `idx_audit_logs_action` (`action`),
  ADD KEY `idx_audit_timestamp` (`timestamp`),
  ADD KEY `idx_audit_user` (`user_name`),
  ADD KEY `idx_audit_time_role` (`timestamp`,`user_role`),
  ADD KEY `idx_audit_role_time` (`user_role`,`timestamp`);

--
-- Indices de la tabla `autorizaciones`
--
ALTER TABLE `autorizaciones`
  ADD PRIMARY KEY (`cedula`);

--
-- Indices de la tabla `cargas_academicas_v3`
--
ALTER TABLE `cargas_academicas_v3`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_carga_contratacion` (`contratacion_id`),
  ADD KEY `idx_carga_materia` (`materia_id`),
  ADD KEY `idx_carga_seccion` (`seccion`),
  ADD KEY `idx_carga_especialidad` (`especialidad_destino`);

--
-- Indices de la tabla `cargas_historicas`
--
ALTER TABLE `cargas_historicas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_docente_periodo` (`cedula_docente`,`periodoAcademico`),
  ADD KEY `idx_hist_periodo` (`periodoAcademico`),
  ADD KEY `idx_hist_cedula_search` (`cedula_docente`),
  ADD KEY `idx_hist_periodo_search` (`periodoAcademico`);

--
-- Indices de la tabla `cargas_historicas_materias_v3`
--
ALTER TABLE `cargas_historicas_materias_v3`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_hist_materia_id` (`carga_historica_id`);

--
-- Indices de la tabla `departamentos_v3`
--
ALTER TABLE `departamentos_v3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `docentes_contrataciones_v3`
--
ALTER TABLE `docentes_contrataciones_v3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_docente_periodo_depto` (`docente_cedula`,`periodo_id`,`departamento_id`),
  ADD KEY `fk_contratacion_departamento` (`departamento_id`),
  ADD KEY `fk_contratacion_sede` (`sede_id`),
  ADD KEY `idx_contratacion_busqueda` (`periodo_id`,`departamento_id`,`status`),
  ADD KEY `idx_contratacion_cedula_id` (`docente_cedula`,`id`);

--
-- Indices de la tabla `docentes_datos_bancarios_v3`
--
ALTER TABLE `docentes_datos_bancarios_v3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_docente_cuenta` (`docente_cedula`,`cuenta_bancaria`),
  ADD KEY `idx_banco_cedula` (`docente_cedula`),
  ADD KEY `idx_banco_principal` (`docente_cedula`,`es_principal`);

--
-- Indices de la tabla `docentes_v3`
--
ALTER TABLE `docentes_v3`
  ADD PRIMARY KEY (`cedula`),
  ADD KEY `idx_docentes_apellidos_nombres` (`apellidos`,`nombres`),
  ADD KEY `idx_docentes_correo` (`correo_personal`);

--
-- Indices de la tabla `materias_catalogo`
--
ALTER TABLE `materias_catalogo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `materias_catalogo_v3`
--
ALTER TABLE `materias_catalogo_v3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `fk_materia_departamento` (`departamento_id`),
  ADD KEY `idx_materia_nombre` (`nombre`);

--
-- Indices de la tabla `periodos_academicos`
--
ALTER TABLE `periodos_academicos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_periodo_estado` (`estado`);

--
-- Indices de la tabla `periodos_academicos_v3`
--
ALTER TABLE `periodos_academicos_v3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `idx_periodo_estado` (`estado`);

--
-- Indices de la tabla `sedes_v3`
--
ALTER TABLE `sedes_v3`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_usuarios_correo` (`correo`),
  ADD KEY `idx_usuarios_role` (`role`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=382;

--
-- AUTO_INCREMENT de la tabla `cargas_academicas_v3`
--
ALTER TABLE `cargas_academicas_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5363;

--
-- AUTO_INCREMENT de la tabla `cargas_historicas`
--
ALTER TABLE `cargas_historicas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1439;

--
-- AUTO_INCREMENT de la tabla `cargas_historicas_materias_v3`
--
ALTER TABLE `cargas_historicas_materias_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7692;

--
-- AUTO_INCREMENT de la tabla `departamentos_v3`
--
ALTER TABLE `departamentos_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `docentes_contrataciones_v3`
--
ALTER TABLE `docentes_contrataciones_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT de la tabla `docentes_datos_bancarios_v3`
--
ALTER TABLE `docentes_datos_bancarios_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `materias_catalogo`
--
ALTER TABLE `materias_catalogo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=234;

--
-- AUTO_INCREMENT de la tabla `materias_catalogo_v3`
--
ALTER TABLE `materias_catalogo_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=920;

--
-- AUTO_INCREMENT de la tabla `periodos_academicos`
--
ALTER TABLE `periodos_academicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `periodos_academicos_v3`
--
ALTER TABLE `periodos_academicos_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `sedes_v3`
--
ALTER TABLE `sedes_v3`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cargas_academicas_v3`
--
ALTER TABLE `cargas_academicas_v3`
  ADD CONSTRAINT `fk_carga_contratacion` FOREIGN KEY (`contratacion_id`) REFERENCES `docentes_contrataciones_v3` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_carga_materia` FOREIGN KEY (`materia_id`) REFERENCES `materias_catalogo_v3` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `cargas_historicas_materias_v3`
--
ALTER TABLE `cargas_historicas_materias_v3`
  ADD CONSTRAINT `fk_hist_materias_rel` FOREIGN KEY (`carga_historica_id`) REFERENCES `cargas_historicas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `docentes_contrataciones_v3`
--
ALTER TABLE `docentes_contrataciones_v3`
  ADD CONSTRAINT `fk_contratacion_departamento` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos_v3` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contratacion_docente` FOREIGN KEY (`docente_cedula`) REFERENCES `docentes_v3` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contratacion_periodo` FOREIGN KEY (`periodo_id`) REFERENCES `periodos_academicos_v3` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contratacion_sede` FOREIGN KEY (`sede_id`) REFERENCES `sedes_v3` (`id`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `docentes_datos_bancarios_v3`
--
ALTER TABLE `docentes_datos_bancarios_v3`
  ADD CONSTRAINT `fk_banco_docente` FOREIGN KEY (`docente_cedula`) REFERENCES `docentes_v3` (`cedula`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `materias_catalogo_v3`
--
ALTER TABLE `materias_catalogo_v3`
  ADD CONSTRAINT `fk_materia_departamento` FOREIGN KEY (`departamento_id`) REFERENCES `departamentos_v3` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
