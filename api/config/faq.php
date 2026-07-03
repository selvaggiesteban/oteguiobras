<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../middleware/auth.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET /api/config/faq — público
if ($method === 'GET') {
  $db = getDB();
  $stmt = $db->prepare('SELECT config_value FROM config WHERE config_key = ?');
  $stmt->execute(['faq']);
  $row = $stmt->fetch();

  if (!$row) {
    jsonResponse(['faq' => []]);
  }

  jsonResponse(json_decode($row['config_value'], true));
}

// PUT /api/config/faq — requiere auth
if ($method === 'PUT') {
  require_auth();
  $data = getInput();

  $db = getDB();
  $stmt = $db->prepare('INSERT INTO config (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = ?');
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  $stmt->execute(['faq', $json, $json]);

  jsonResponse(['success' => true]);
}

jsonResponse(['error' => 'Método no permitido'], 405);
