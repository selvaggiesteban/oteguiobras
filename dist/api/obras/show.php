<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

$id = getQueryParam('id');
if (!$id || !is_numeric($id)) {
  jsonResponse(['error' => 'ID inválido'], 400);
}

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/obras/:id — público
if ($method === 'GET') {
  $db = getDB();
  $stmt = $db->prepare('SELECT * FROM obras WHERE id = ?');
  $stmt->execute([$id]);
  $obra = $stmt->fetch();

  if (!$obra) {
    jsonResponse(['error' => 'Obra no encontrada'], 404);
  }

  $obra['imagenes'] = json_decode($obra['imagenes'], true) ?: [];
  jsonResponse($obra);
}

// PUT /api/obras/:id — requiere auth
if ($method === 'PUT') {
  require_auth();
  $data = getInput();

  $db = getDB();
  $stmt = $db->prepare('SELECT id FROM obras WHERE id = ?');
  $stmt->execute([$id]);
  if (!$stmt->fetch()) {
    jsonResponse(['error' => 'Obra no encontrada'], 404);
  }

  $fields = [];
  $params = [];
  $allowed = ['nombre', 'categoria', 'ubicacion', 'anno', 'descripcion', 'imagen_portada', 'metros_cuadrados', 'cliente', 'destacada', 'visible', 'orden'];

  foreach ($allowed as $field) {
    if (array_key_exists($field, $data)) {
      $fields[] = "$field = ?";
      $params[] = $data[$field];
    }
  }

  // Campo imagenes como JSON
  if (array_key_exists('imagenes', $data)) {
    $fields[] = 'imagenes = ?';
    $params[] = json_encode($data['imagenes']);
  }

  if (empty($fields)) {
    jsonResponse(['error' => 'No hay campos para actualizar'], 400);
  }

  $params[] = $id;
  $sql = 'UPDATE obras SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $db->prepare($sql);
  $stmt->execute($params);

  jsonResponse(['success' => true]);
}

// DELETE /api/obras/:id — requiere auth
if ($method === 'DELETE') {
  require_auth();

  $db = getDB();

  // Obtener imágenes para borrar del filesystem
  $stmt = $db->prepare('SELECT imagenes FROM obras WHERE id = ?');
  $stmt->execute([$id]);
  $obra = $stmt->fetch();

  if (!$obra) {
    jsonResponse(['error' => 'Obra no encontrada'], 404);
  }

  $imagenes = json_decode($obra['imagenes'], true) ?: [];

  // Borrar archivos de imagen
  foreach ($imagenes as $img) {
    $url = $img['url'] ?? $img;
    if (is_string($url) && $url[0] === '/') {
      $filepath = $_SERVER['DOCUMENT_ROOT'] . $url;
      if (file_exists($filepath)) unlink($filepath);
    }
  }

  $stmt = $db->prepare('DELETE FROM obras WHERE id = ?');
  $stmt->execute([$id]);

  jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Método no permitido'], 405);
