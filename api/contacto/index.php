<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../helpers/mail.php';

$method = $_SERVER['REQUEST_METHOD'];

// POST /api/contacto — público (envío de formulario)
if ($method === 'POST') {
  $data = getInput();

  $nombre = trim($data['nombre'] ?? '');
  $email = trim($data['email'] ?? '');
  $mensaje = trim($data['mensaje'] ?? '');

  if (!$nombre || !$email || !$mensaje) {
    jsonResponse(['error' => 'Nombre, email y mensaje son obligatorios'], 400);
  }

  $db = getDB();
  $stmt = $db->prepare('INSERT INTO contacto (nombre, email, telefono, empresa, mensaje) VALUES (?, ?, ?, ?, ?)');
  $stmt->execute([
    $nombre,
    $email,
    $data['telefono'] ?? null,
    $data['empresa'] ?? null,
    $mensaje
  ]);

  // Send admin notification (fire and forget)
  sendAdminNotification(
    "Nuevo mensaje de {$nombre} — Otegui Obras",
    buildContactEmail($data)
  );

  jsonResponse(['success' => true, 'id' => $db->lastInsertId()], 201);
}

// GET /api/contacto — requiere auth (listar mensajes)
if ($method === 'GET') {
  require_auth();

  $db = getDB();
  $stmt = $db->prepare('SELECT * FROM contacto ORDER BY fecha_envio DESC');
  $stmt->execute();
  jsonResponse($stmt->fetchAll());
}

jsonResponse(['error' => 'Método no permitido'], 405);
