<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/equipo — público
if ($method === 'GET') {
  $db = getDB();
  $visible = getQueryParam('visible');

  $sql = 'SELECT * FROM equipo';
  $params = [];
  if ($visible !== null) {
    $sql .= ' WHERE visible = ?';
    $params[] = (int)$visible;
  }
  $sql .= ' ORDER BY orden ASC, fecha_creacion DESC';

  $stmt = $db->prepare($sql);
  $stmt->execute($params);
  jsonResponse($stmt->fetchAll());
}

// POST /api/equipo — requiere auth
if ($method === 'POST') {
  require_auth();
  $data = getInput();

  $nombre = trim($data['nombre'] ?? '');
  if (!$nombre) {
    jsonResponse(['error' => 'El nombre es obligatorio'], 400);
  }

  $db = getDB();
  $stmt = $db->prepare('INSERT INTO equipo (nombre, cargo, especialidad, foto, visible, orden) VALUES (?, ?, ?, ?, ?, ?)');
  $stmt->execute([
    $nombre,
    $data['cargo'] ?? null,
    $data['especialidad'] ?? null,
    $data['foto'] ?? null,
    $data['visible'] ?? 1,
    $data['orden'] ?? 0
  ]);

  jsonResponse(['success' => true, 'id' => $db->lastInsertId()], 201);
}

jsonResponse(['error' => 'Método no permitido'], 405);
