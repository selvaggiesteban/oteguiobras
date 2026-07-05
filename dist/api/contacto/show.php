<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

$id = getQueryParam('id');
if (!$id || !is_numeric($id)) {
  jsonResponse(['error' => 'ID inválido'], 400);
}

ensureMethod(['PUT', 'DELETE']);
require_auth();

$db = getDB();

// PUT /api/contacto/:id — marcar leído
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  $data = getInput();

  $stmt = $db->prepare('SELECT id FROM contacto WHERE id = ?');
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    jsonResponse(['error' => 'Mensaje no encontrado'], 404);
  }

  $fields = [];
  $params = [];

  if (array_key_exists('leido', $data)) {
    $fields[] = 'leido = ?';
    $params[] = (int)$data['leido'];
  }

  if (empty($fields)) {
    jsonResponse(['error' => 'No hay campos para actualizar'], 400);
  }

  $params[] = $id;
  $sql = 'UPDATE contacto SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $db->prepare($sql);
  $stmt->execute($params);

  jsonResponse(['success' => true]);
}

// DELETE /api/contacto/:id
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $stmt = $db->prepare('SELECT id FROM contacto WHERE id = ?');
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    jsonResponse(['error' => 'Mensaje no encontrado'], 404);
  }

  $stmt = $db->prepare('DELETE FROM contacto WHERE id = ?');
  $stmt->execute([$id]);

  jsonResponse(['success' => true]);
}
