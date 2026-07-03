<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/postulaciones — público (envío con CV)
if ($method === 'POST') {
  $nombre = trim($_POST['nombre'] ?? '');
  $email = trim($_POST['email'] ?? '');
  $telefono = trim($_POST['telefono'] ?? '');

  if (!$nombre || !$email) {
    jsonResponse(['error' => 'Nombre y email son obligatorios'], 400);
  }

  $cv_url = null;

  // Procesar CV si viene
  if (!empty($_FILES['cv']) && $_FILES['cv']['error'] === UPLOAD_ERR_OK) {
    $cv = $_FILES['cv'];

    if (!in_array($cv['type'], ALLOWED_DOC_TYPES)) {
      jsonResponse(['error' => 'Solo se aceptan archivos PDF'], 400);
    }

    if ($cv['size'] > MAX_FILE_SIZE) {
      jsonResponse(['error' => 'El archivo no puede superar 10MB'], 400);
    }

    $ext = pathinfo($cv['name'], PATHINFO_EXTENSION);
    $filename = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;

    if (!is_dir(CV_DIR)) mkdir(CV_DIR, 0755, true);

    $destination = CV_DIR . '/' . $filename;

    if (move_uploaded_file($cv['tmp_name'], $destination)) {
      $cv_url = '/cvs/' . $filename;
    }
  }

  $db = getDB();
  $stmt = $db->prepare('INSERT INTO postulaciones (nombre, email, telefono, linkedin, cv_url) VALUES (?, ?, ?, ?, ?)');
  $stmt->execute([
    $nombre,
    $email,
    $telefono,
    $_POST['linkedin'] ?? null,
    $cv_url
  ]);

  jsonResponse(['success' => true, 'id' => $db->lastInsertId()], 201);
}

// GET /api/postulaciones — requiere auth
if ($method === 'GET') {
  require_auth();

  $db = getDB();
  $stmt = $db->prepare('SELECT * FROM postulaciones ORDER BY fecha_envio DESC');
  $stmt->execute();
  jsonResponse($stmt->fetchAll());
}

jsonResponse(['error' => 'Método no permitido'], 405);
