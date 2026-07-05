<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

ensureMethod('POST');
require_auth();

if (empty($_FILES['imagen'])) {
  jsonResponse(['error' => 'No se envió ninguna imagen'], 400);
}

$file = $_FILES['imagen'];
if ($file['error'] !== UPLOAD_ERR_OK) {
  jsonResponse(['error' => 'Error al subir archivo'], 400);
}

if (!in_array($file['type'], ALLOWED_IMAGE_TYPES)) {
  jsonResponse(['error' => 'Tipo de imagen no permitido. Use JPG, PNG, WebP o AVIF'], 400);
}

if ($file['size'] > MAX_IMAGE_SIZE) {
  jsonResponse(['error' => 'La imagen no puede superar 5MB'], 400);
}

$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = 'obras/' . time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;

$destDir = UPLOAD_DIR . '/obras';
if (!is_dir($destDir)) mkdir($destDir, 0755, true);

$destination = UPLOAD_DIR . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
  jsonResponse(['error' => 'Error al guardar imagen'], 500);
}

jsonResponse(['success' => true, 'url' => '/images/' . $filename], 201);
