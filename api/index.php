<?php
// index.php
require_once 'db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Cache-Control: post-check=0, pre-check=0', false);
header('Pragma: no-cache');

// Basic router
$requestUri = $_SERVER['REQUEST_URI'];
// Remove query string
$uriPath = parse_url($requestUri, PHP_URL_PATH);
// Base path might include subdirectory if not on root, e.g., /talento_humano_upel/api/
$pathParts = explode('/api/', $uriPath);
$endpoint = isset($pathParts[1]) ? $pathParts[1] : '';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

try {
    // --- HEALTH CHECK ---
    if ($endpoint === 'health') {
        sendResponse(['ok' => true, 'timestamp' => time() * 1000, 'server' => 'UPEL SIGOA PHP Core']);
    }

    // --- REALTIME SYNC VERSION (SMART POLLING FALLBACK) ---
    if ($endpoint === 'sync/version' && $method === 'GET') {
        $lastTimestamp = time() * 1000;
        try {
            $stmt = $pdo->query("SELECT UNIX_TIMESTAMP(MAX(timestamp)) AS max_ts FROM audit_logs");
            if ($stmt) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                if (!empty($row['max_ts'])) {
                    $lastTimestamp = (int)$row['max_ts'] * 1000;
                }
            }
        } catch (Exception $e) {}
        sendResponse([
            'success' => true,
            'version' => $lastTimestamp,
            'activeConnections' => 0,
            'serverTime' => time() * 1000,
            'mode' => 'mirror-php'
        ]);
    }

    // --- SYNC BATCH OFFLINE ---
    if ($endpoint === 'sync/batch' && $method === 'POST') {
        $queue = $input['queue'] ?? [];
        if (!is_array($queue) || empty($queue)) {
            sendResponse(['success' => true, 'processed' => 0, 'succeeded' => 0, 'failed' => 0, 'succeededIds' => []]);
        }
        $processed = 0;
        $succeeded = 0;
        $failed = 0;
        $succeededIds = [];
        $errors = [];

        foreach ($queue as $item) {
            $processed++;
            $type = $item['type'] ?? '';
            $payload = $item['payload'] ?? [];
            $id = $item['id'] ?? null;
            try {
                if ($type === 'UPDATE_CARGA') {
                    $cedula = trim($payload['cedula'] ?? '');
                    if ($cedula !== '') {
                        $vCedula = (strpos($cedula, 'V-') === 0) ? $cedula : ('V-' . preg_replace('/^[Vv]-?/', '', $cedula));
                        $status = $payload['status'] ?? 'Activo';
                        $stmt = $pdo->prepare('UPDATE docentes SET status = ? WHERE cedula = ? OR cedula = ?');
                        $stmt->execute([$status, $cedula, $vCedula]);

                        if (!empty($payload['materias']) && is_array($payload['materias'])) {
                            $stmtDel = $pdo->prepare('DELETE FROM docentes_materias WHERE docente_cedula = ? OR docente_cedula = ?');
                            $stmtDel->execute([$cedula, $vCedula]);

                            $stmtIns = $pdo->prepare('INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso, especialidadDestino, seccion, cupos, inscritos) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
                            foreach ($payload['materias'] as $m) {
                                if (!empty($m['nombre'])) {
                                    $stmtIns->execute([
                                        $vCedula,
                                        $m['nombre'],
                                        (int)($m['horasSemanal'] ?? $m['horasSemanales'] ?? 0),
                                        (int)($m['horasLapso'] ?? 0),
                                        $m['especialidadDestino'] ?? '',
                                        $m['seccion'] ?? '',
                                        $m['cupos'] ?? null,
                                        $m['inscritos'] ?? null
                                    ]);
                                }
                            }
                        }
                    }
                    $succeeded++;
                    if ($id) $succeededIds[] = $id;
                } else if ($type === 'DELETE_STAFF') {
                    $cedula = trim($payload['cedula'] ?? '');
                    if ($cedula !== '') {
                        $pdo->prepare('DELETE FROM docentes WHERE cedula = ?')->execute([$cedula]);
                        $pdo->prepare('DELETE FROM docentes_materias WHERE docente_cedula = ?')->execute([$cedula]);
                    }
                    $succeeded++;
                    if ($id) $succeededIds[] = $id;
                } else {
                    $succeeded++;
                    if ($id) $succeededIds[] = $id;
                }
            } catch (Exception $eItem) {
                $failed++;
                $errors[] = ['error' => $eItem->getMessage()];
            }
        }
        sendResponse([
            'success' => true,
            'processed' => $processed,
            'succeeded' => $succeeded,
            'failed' => $failed,
            'succeededIds' => $succeededIds,
            'errors' => $errors
        ]);
    }
    // --- CATÁLOGO DE MATERIAS ---
    if ($endpoint === 'materias-catalogo') {
        if ($method === 'GET') {
            $stmt = $pdo->query('SELECT nombre FROM materias_catalogo ORDER BY nombre ASC');
            $materias = $stmt->fetchAll(PDO::FETCH_COLUMN);
            sendResponse($materias);
        } elseif ($method === 'POST') {
            $nombre = trim($input['nombre'] ?? '');
            if ($nombre === '') {
                sendResponse(['success' => false, 'message' => 'El nombre no puede estar vacío'], 400);
            }
            $nombre = mb_strtoupper($nombre, 'UTF-8');
            $stmt = $pdo->prepare('INSERT IGNORE INTO materias_catalogo (nombre) VALUES (?)');
            $stmt->execute([$nombre]);
            sendResponse(['success' => true, 'nombre' => $nombre]);
        }
    }

    // --- LOGIN CON BCRYPT SEGURO ---
    if ($endpoint === 'login' && $method === 'POST') {
        $username = trim($input['username'] ?? '');
        $password = trim($input['password'] ?? '');

        if (empty($username) || empty($password)) {
            sendResponse(['success' => false, 'message' => 'Credenciales incompletas'], 400);
        }

        $stmt = $pdo->prepare('SELECT id, username, password, name, role, department FROM usuarios WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && (password_verify($password, $user['password']) || $user['password'] === $password)) {
            // Migración suave: si la clave en BD era texto plano, actualizar automáticamente a bcrypt
            if ($user['password'] === $password && password_needs_rehash($user['password'], PASSWORD_BCRYPT)) {
                $newHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
                $upd = $pdo->prepare('UPDATE usuarios SET password = ? WHERE id = ?');
                $upd->execute([$newHash, $user['id']]);
            }
            unset($user['password']); // Ocultar hash de la respuesta JSON
            sendResponse(['success' => true, 'user' => $user]);
        } else {
            sendResponse(['success' => false, 'message' => 'Credenciales inválidas'], 401);
        }
    }

    // --- USERS ---
    if (strpos($endpoint, 'users') === 0) {
        if ($method === 'GET') {
            $stmt = $pdo->query('SELECT id, username, name, role, department FROM usuarios');
            sendResponse($stmt->fetchAll());
        } elseif ($method === 'POST') {
            $rawPassword = trim($input['password'] ?? '');
            if (strlen($rawPassword) < 6) {
                sendResponse(['error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
            }
            $hashedPassword = password_hash($rawPassword, PASSWORD_BCRYPT, ['cost' => 10]);

            $stmt = $pdo->prepare('INSERT INTO usuarios (username, password, name, role, department) VALUES (?, ?, ?, ?, ?)');
            $stmt->execute([
                trim($input['username'] ?? ''),
                $hashedPassword,
                trim($input['name'] ?? ''),
                trim($input['role'] ?? 'DOCENCIA'),
                trim($input['department'] ?? '')
            ]);
            sendResponse(['success' => true]);
        } elseif ($method === 'DELETE') {
            preg_match('/users\/(\d+)/', $endpoint, $matches);
            $id = $matches[1] ?? null;
            if ($id == 1) {
                sendResponse(['error' => 'No se puede eliminar al administrador principal'], 403);
            }
            $stmt = $pdo->prepare('DELETE FROM usuarios WHERE id = ?');
            $stmt->execute([$id]);
            sendResponse(['success' => true]);
        } elseif ($method === 'PUT') {
            preg_match('/users\/(\d+)/', $endpoint, $matches);
            $id = $matches[1] ?? null;
            $rawPassword = trim($input['password'] ?? '');

            if (!empty($rawPassword)) {
                $hashedPassword = password_hash($rawPassword, PASSWORD_BCRYPT, ['cost' => 10]);
                $stmt = $pdo->prepare('UPDATE usuarios SET username = ?, password = ?, name = ?, role = ?, department = ? WHERE id = ?');
                $stmt->execute([
                    trim($input['username'] ?? ''),
                    $hashedPassword,
                    trim($input['name'] ?? ''),
                    trim($input['role'] ?? ''),
                    trim($input['department'] ?? ''),
                    $id
                ]);
            } else {
                $stmt = $pdo->prepare('UPDATE usuarios SET username = ?, name = ?, role = ?, department = ? WHERE id = ?');
                $stmt->execute([
                    trim($input['username'] ?? ''),
                    trim($input['name'] ?? ''),
                    trim($input['role'] ?? ''),
                    trim($input['department'] ?? ''),
                    $id
                ]);
            }
            sendResponse(['success' => true]);
        }
    }

    // --- AUTORIZACIONES ---
    if (strpos($endpoint, 'autorizaciones') === 0) {
        if ($method === 'GET') {
            $stmt = $pdo->query('SELECT * FROM autorizaciones');
            sendResponse($stmt->fetchAll());
        } elseif ($method === 'POST') {
            $stmt = $pdo->prepare('INSERT IGNORE INTO autorizaciones (cedula, department, nombresApellidos) VALUES (?, ?, ?)');
            $stmt->execute([
                $input['cedula'] ?? '',
                $input['department'] ?? '',
                $input['nombresApellidos'] ?? ''
            ]);
            sendResponse(['success' => true]);
        } elseif ($method === 'DELETE') {
            preg_match('/autorizaciones\/(.+)/', $endpoint, $matches);
            $cedula = urldecode($matches[1] ?? '');
            $stmt = $pdo->prepare('DELETE FROM autorizaciones WHERE cedula = ?');
            $stmt->execute([$cedula]);
            sendResponse(['success' => true]);
        }
    }

    // --- DOCENTES ---
    if (strpos($endpoint, 'docentes') === 0) {
        if ($endpoint === 'docentes/carga' && $method === 'PUT') {
            $cedula = $input['cedula'] ?? '';
            $status = $input['status'] ?? '';
            $materias = $input['materias'] ?? [];
            
            $updateQuery = 'UPDATE docentes SET status = ?';
            $updateParams = [$status];

            if (isset($input['periodoAcademico'])) {
                $updateQuery .= ', periodoAcademico = ?, semanas = ?, fechaDesde = ?, fechaHasta = ?';
                array_push($updateParams, $input['periodoAcademico'], $input['semanas'], $input['fechaDesde'], $input['fechaHasta']);
            }
            $updateQuery .= ' WHERE cedula = ?';
            $updateParams[] = $cedula;

            $stmt = $pdo->prepare($updateQuery);
            $stmt->execute($updateParams);

            $stmt = $pdo->prepare('DELETE FROM docentes_materias WHERE docente_cedula = ?');
            $stmt->execute([$cedula]);

            if (!empty($materias)) {
                $insertStmt = $pdo->prepare('INSERT INTO docentes_materias (docente_cedula, nombre, horasSemanal, horasLapso) VALUES (?, ?, ?, ?)');
                foreach ($materias as $m) {
                    $insertStmt->execute([
                        $cedula,
                        $m['nombre'] ?? '',
                        (int)($m['horasSemanal'] ?? 0),
                        (int)($m['horasLapso'] ?? 0)
                    ]);
                }
            }
            sendResponse(['success' => true]);
        }
        elseif ($method === 'GET') {
            $stmt = $pdo->query('SELECT * FROM docentes');
            $docentes = $stmt->fetchAll();
            
            $stmt = $pdo->query('SELECT * FROM docentes_materias');
            $materias = $stmt->fetchAll();

            $materiasPorDocente = [];
            foreach ($materias as $m) {
                $materiasPorDocente[$m['docente_cedula']][] = $m;
            }

            foreach ($docentes as &$doc) {
                $doc['materias'] = $materiasPorDocente[$doc['cedula']] ?? [];
            }
            sendResponse($docentes);
        }
        elseif ($method === 'POST') {
            $d = $input;
            $query = "INSERT INTO docentes (
                cedula, nombres, apellidos, department, status, fechaNac, rif, correo, direccion, telefonos, 
                banco, cuentaBancaria, tipoCuenta, titulosPregrado, titulosPostgrado, 
                categoriaDocente, dedicacion, periodoAcademico, semanas, fechaDesde, fechaHasta, doctorado, sedeCentro
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                nombres=VALUES(nombres), apellidos=VALUES(apellidos), department=VALUES(department),
                fechaNac=VALUES(fechaNac), rif=VALUES(rif), correo=VALUES(correo), direccion=VALUES(direccion), telefonos=VALUES(telefonos),
                banco=VALUES(banco), cuentaBancaria=VALUES(cuentaBancaria), tipoCuenta=VALUES(tipoCuenta),
                titulosPregrado=VALUES(titulosPregrado), titulosPostgrado=VALUES(titulosPostgrado),
                categoriaDocente=VALUES(categoriaDocente), dedicacion=VALUES(dedicacion), 
                periodoAcademico=VALUES(periodoAcademico), semanas=VALUES(semanas), 
                fechaDesde=VALUES(fechaDesde), fechaHasta=VALUES(fechaHasta), doctorado=VALUES(doctorado),
                sedeCentro=VALUES(sedeCentro)";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute([
                $d['cedula'] ?? '', mb_strtoupper($d['nombres'] ?? '', 'UTF-8'), mb_strtoupper($d['apellidos'] ?? '', 'UTF-8'), 
                $d['department'] ?? '', $d['status'] ?? 'Por Revisar', $d['fechaNac'] ?? '', 
                $d['rif'] ?? '', $d['correo'] ?? '', $d['direccion'] ?? '', $d['telefonos'] ?? '', 
                $d['banco'] ?? '', $d['cuentaBancaria'] ?? '', $d['tipoCuenta'] ?? '',
                $d['titulosPregrado'] ?? '', $d['titulosPostgrado'] ?? '', $d['categoriaDocente'] ?? '', 
                $d['dedicacion'] ?? '', $d['periodoAcademico'] ?? '2025-I', $d['semanas'] ?? 15, 
                $d['fechaDesde'] ?? '', $d['fechaHasta'] ?? '', $d['doctorado'] ?? '',
                $d['sedeCentro'] ?? 'Rubio'
            ]);

            $stmt = $pdo->prepare('DELETE FROM autorizaciones WHERE cedula = ?');
            $stmt->execute([$d['cedula'] ?? '']);

            sendResponse(['success' => true]);
        }
        elseif ($method === 'DELETE') {
            preg_match('/docentes\/(.+)/', $endpoint, $matches);
            $cedula = urldecode($matches[1] ?? '');
            $stmt = $pdo->prepare('DELETE FROM docentes WHERE cedula = ?');
            $stmt->execute([$cedula]);
            sendResponse(['success' => true]);
        }
    }

    // --- HISTORIAL DE CARGAS POR DOCENTE ---
    if (preg_match('/docentes\/(.+)\/historial/', $endpoint, $matches) && $method === 'GET') {
        $cedula = urldecode($matches[1]);
        $stmt = $pdo->prepare('SELECT * FROM cargas_historicas WHERE cedula_docente = ? ORDER BY periodoAcademico DESC, fechaRegistro DESC');
        $stmt->execute([$cedula]);
        $rows = $stmt->fetchAll();
        foreach ($rows as &$r) {
            $r['materias'] = json_decode($r['materias'] ?? '[]', true) ?: [];
        }
        sendResponse($rows);
    }

    // --- REPLICACIÓN DE PERÍODOS ---
    if ($endpoint === 'periodos/replicar' && $method === 'POST') {
        $periodoOrigen = $input['periodoOrigen'] ?? '';
        $periodoDestino = $input['periodoDestino'] ?? '';
        $semanas = (int)($input['semanas'] ?? 15);
        $fechaDesde = $input['fechaDesde'] ?? '';
        $fechaHasta = $input['fechaHasta'] ?? '';
        $cedulas = $input['cedulasSeleccionadas'] ?? [];

        if (empty($periodoOrigen) || empty($periodoDestino) || empty($cedulas)) {
            sendResponse(['error' => 'Datos incompletos para replicar el período'], 400);
        }

        $inClause = implode(',', array_fill(0, count($cedulas), '?'));
        $stmtDoc = $pdo->prepare("SELECT * FROM docentes WHERE cedula IN ($inClause)");
        $stmtDoc->execute($cedulas);
        $docentes = $stmtDoc->fetchAll();

        $stmtMat = $pdo->prepare("SELECT * FROM docentes_materias WHERE docente_cedula IN ($inClause)");
        $stmtMat->execute($cedulas);
        $materias = $stmtMat->fetchAll();

        $matsByDoc = [];
        foreach ($materias as $m) {
            $matsByDoc[$m['docente_cedula']][] = $m;
        }

        foreach ($docentes as $d) {
            $docMats = $matsByDoc[$d['cedula']] ?? [];
            $totSem = 0;
            $totLap = 0;
            foreach ($docMats as $dm) {
                $totSem += (int)($dm['horasSemanal'] ?? 0);
                $totLap += (int)($dm['horasLapso'] ?? 0);
            }
            $jsonMats = json_encode($docMats);

            // Snapshot origen
            $stmtHist = $pdo->prepare("INSERT INTO cargas_historicas 
                (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE status=VALUES(status), materias=VALUES(materias), totalHorasSemanal=VALUES(totalHorasSemanal), totalHorasLapso=VALUES(totalHorasLapso)");
            $stmtHist->execute([
                $d['cedula'], $periodoOrigen, $d['department'], $d['status'] ?: 'Validado',
                (int)($d['semanas'] ?: 15), $d['fechaDesde'] ?: '', $d['fechaHasta'] ?: '',
                $jsonMats, $totSem, $totLap
            ]);

            // Nuevo snapshot destino
            $stmtHistNew = $pdo->prepare("INSERT INTO cargas_historicas 
                (cedula_docente, periodoAcademico, department, status, semanas, fechaDesde, fechaHasta, materias, totalHorasSemanal, totalHorasLapso)
                VALUES (?, ?, ?, 'Por Revisar', ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE status='Por Revisar', semanas=VALUES(semanas), fechaDesde=VALUES(fechaDesde), fechaHasta=VALUES(fechaHasta), materias=VALUES(materias), totalHorasSemanal=VALUES(totalHorasSemanal), totalHorasLapso=VALUES(totalHorasLapso), fechaRegistro=CURRENT_TIMESTAMP");
            $stmtHistNew->execute([
                $d['cedula'], $periodoDestino, $d['department'],
                $semanas, $fechaDesde, $fechaHasta,
                $jsonMats, $totSem, $totLap
            ]);
        }

        // Actualizar tabla docentes
        $stmtUp = $pdo->prepare("UPDATE docentes SET periodoAcademico = ?, status = 'Por Revisar', semanas = ?, fechaDesde = ?, fechaHasta = ? WHERE cedula IN ($inClause)");
        $stmtUp->execute(array_merge([$periodoDestino, $semanas, $fechaDesde, $fechaHasta], $cedulas));

        sendResponse(['success' => true, 'count' => count($cedulas), 'periodoDestino' => $periodoDestino]);
    }

    if ($endpoint === 'historico-periodos' && $method === 'GET') {
        $stmt = $pdo->query('SELECT DISTINCT periodoAcademico FROM cargas_historicas ORDER BY periodoAcademico DESC');
        sendResponse($stmt->fetchAll(PDO::FETCH_COLUMN));
    }

    // --- PERIODOS ACADEMICOS ---
    if ($endpoint === 'periodos' && $method === 'GET') {
        $stmt = $pdo->query("SELECT * FROM periodos_academicos ORDER BY CASE estado WHEN 'ACTIVO' THEN 1 WHEN 'PLANIFICACION' THEN 2 WHEN 'CERRADO' THEN 3 ELSE 4 END, nombre DESC");
        sendResponse($stmt->fetchAll());
    }

    if ($endpoint === 'periodos' && $method === 'POST') {
        $nombre = $input['nombre'] ?? '';
        $estado = $input['estado'] ?? 'PLANIFICACION';
        $semanas = (int)($input['semanas'] ?? 15);
        $fechaDesde = $input['fechaDesde'] ?? '';
        $fechaHasta = $input['fechaHasta'] ?? '';
        $observaciones = $input['observaciones'] ?? '';

        if (!$nombre) {
            sendResponse(['error' => 'Nombre requerido'], 400);
        }

        if ($estado === 'ACTIVO') {
            $pdo->query("UPDATE periodos_academicos SET estado = 'CERRADO', fechaCierre = CURRENT_TIMESTAMP WHERE estado = 'ACTIVO'");
        }

        $stmt = $pdo->prepare("INSERT INTO periodos_academicos (nombre, estado, semanas, fechaDesde, fechaHasta, observaciones) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$nombre, $estado, $semanas, $fechaDesde, $fechaHasta, $observaciones]);
        sendResponse(['success' => true, 'id' => $pdo->lastInsertId(), 'nombre' => $nombre, 'estado' => $estado]);
    }

    if ($endpoint === 'periodos/activar' && $method === 'POST') {
        $periodoId = $input['periodoId'] ?? null;
        $nombre = $input['nombre'] ?? null;

        $target = null;
        if ($periodoId) {
            $stmt = $pdo->prepare("SELECT * FROM periodos_academicos WHERE id = ?");
            $stmt->execute([$periodoId]);
            $target = $stmt->fetch();
        } elseif ($nombre) {
            $stmt = $pdo->prepare("SELECT * FROM periodos_academicos WHERE nombre = ?");
            $stmt->execute([$nombre]);
            $target = $stmt->fetch();
        }

        if (!$target) {
            sendResponse(['error' => 'Período no encontrado'], 404);
        }

        // Cerrar activo previo
        $stmtPrev = $pdo->query("SELECT * FROM periodos_academicos WHERE estado = 'ACTIVO' LIMIT 1");
        $prev = $stmtPrev->fetch();
        if ($prev) {
            $pdo->prepare("UPDATE periodos_academicos SET estado = 'CERRADO', fechaCierre = CURRENT_TIMESTAMP WHERE id = ?")->execute([$prev['id']]);
        }

        // Activar objetivo
        $pdo->prepare("UPDATE periodos_academicos SET estado = 'ACTIVO', fechaActivacion = CURRENT_TIMESTAMP WHERE id = ?")->execute([$target['id']]);

        sendResponse([
            'success' => true,
            'periodoActivado' => $target['nombre'],
            'message' => "Período {$target['nombre']} activado con éxito."
        ]);
    }

    sendResponse(['error' => 'Endpoint no encontrado'], 404);

} catch (Exception $e) {
    sendResponse(['error' => $e->getMessage()], 500);
}
?>
