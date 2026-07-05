<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

$id = getQueryParam('id');
if (!$id || !is_numeric($id)) {
  jsonResponse(['error' => 'ID inválido'], 400);
}

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/equipo/:id — público
if ($method === 'GET') {
  $db = getDB();
  $stmt = $db->prepare('SELECT * FROM equipo WHERE id = ?');
  $stmt->execute([$id]);
  $miembro = $stmt->fetch();

  if (!$miembro) {
    jsonResponse(['error' => 'Miembro no encontrado'], 404);
  }

  jsonResponse($miembro);
}

// PUT /api/equipo/:id — requiere auth
if ($method === 'PUT') {
  require_auth();
  $data = getInput();

  $db = getDB();
  $stmt = $db->prepare('SELECT id FROM equipo WHERE id = ?');
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    jsonResponse(['error' => 'Miembro no encontrado'], 404);
  }

  $fields = [];
  $params = [];
  $allowed = ['nombre', 'cargo', 'especialidad', 'foto', 'visible', 'orden'];

  foreach ($allowed as $field) {
    if (array_key_exists($field, $data)) {
      $fields[] = "$field = ?";
      $params[] = $data[$field];
    }
  }

  if (empty($fields)) {
    jsonResponse(['error' => 'No hay campos para actualizar'], 400);
  }

  $params[] = $id;
  $sql = 'UPDATE equipo SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $db->prepare($sql);
  $stmt->execute($params);

  jsonResponse(['success' => true]);
}

// DELETE /api/equipo/:id — requiere auth
if ($method === 'DELETE') {
  require_auth();

  $db = getDB();

  // Obtener foto para borrar del filesystem
  $stmt = $db->prepare('SELECT foto FROM equipo WHERE id = ?');
  $stmt->execute([$id]);
  $miembro = $stmt->fetch();

  if (!$miembro) {
    jsonResponse(['error' => 'Miembro no encontrado'], 404);
  }

  if ($miembro['foto'] && $miembro['foto'][0] === '/') {
    $filepath = $_SERVER['DOCUMENT_ROOT'] . $miembro['foto'];
    if (file_exists($filepath)) unlink($filepath);
  }

  $stmt = $db->prepare('DELETE FROM equipo WHERE id = ?');
  $stmt->execute([$id]);

  jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Método no permitido'], 405);
