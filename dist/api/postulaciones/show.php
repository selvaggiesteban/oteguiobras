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

// PUT /api/postulaciones/:id — marcar leído
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
  $data = getInput();

  $stmt = $db->prepare('SELECT id FROM postulaciones WHERE id = ?');
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    jsonResponse(['error' => 'Postulación no encontrada'], 404);
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
  $sql = 'UPDATE postulaciones SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $db->prepare($sql);
  $stmt->execute($params);

  jsonResponse(['success' => true]);
}

// DELETE /api/postulaciones/:id
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
  // Borrar CV si existe
  $stmt = $db->prepare('SELECT cv_url FROM postulaciones WHERE id = ?');
  $stmt->execute([$id]);
  $post = $stmt->fetch();

  if (!$post) {
    jsonResponse(['error' => 'Postulación no encontrada'], 404);
  }

  if ($post['cv_url'] && $post['cv_url'][0] === '/') {
    $filepath = $_SERVER['DOCUMENT_ROOT'] . $post['cv_url'];
    if (file_exists($filepath)) unlink($filepath);
  }

  $stmt = $db->prepare('DELETE FROM postulaciones WHERE id = ?');
  $stmt->execute([$id]);

  jsonResponse(['success' => true]);
}
