<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/obras — público
if ($method === 'GET') {
  $db = getDB();
  $visible = getQueryParam('visible');

  $sql = 'SELECT * FROM obras';
  $params = [];
  if ($visible !== null) {
    $sql .= ' WHERE visible = ?';
    $params[] = (int)$visible;
  }
  $sql .= ' ORDER BY orden ASC, fecha_creacion DESC';

  $stmt = $db->prepare($sql);
  $stmt->execute($params);
  $obras = $stmt->fetchAll();

  // Decodificar JSON de imagenes
  foreach ($obras as &$obra) {
    $obra['imagenes'] = json_decode($obra['imagenes'], true) ?: [];
  }

  jsonResponse($obras);
}

// POST /api/obras — requiere auth
if ($method === 'POST') {
  require_auth();
  $data = getInput();

  $nombre = trim($data['nombre'] ?? '');
  if (!$nombre) {
    jsonResponse(['error' => 'El nombre es obligatorio'], 400);
  }

  $db = getDB();
  $stmt = $db->prepare('INSERT INTO obras (nombre, categoria, ubicacion, anno, descripcion, imagenes, imagen_portada, metros_cuadrados, cliente, destacada, visible, orden) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  $stmt->execute([
    $nombre,
    $data['categoria'] ?? 'Retail / Comercial',
    $data['ubicacion'] ?? null,
    $data['anno'] ?? null,
    $data['descripcion'] ?? null,
    json_encode($data['imagenes'] ?? []),
    $data['imagen_portada'] ?? 0,
    $data['metros_cuadrados'] ?? null,
    $data['cliente'] ?? null,
    $data['destacada'] ?? 0,
    $data['visible'] ?? 1,
    $data['orden'] ?? 0
  ]);

  jsonResponse(['success' => true, 'id' => $db->lastInsertId()], 201);
}

jsonResponse(['error' => 'Método no permitido'], 405);
