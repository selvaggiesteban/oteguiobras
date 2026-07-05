<?php
// Middleware: requiere sesión admin activa

require_once __DIR__ . '/../config.php';

function require_auth() {
  if (session_status() === PHP_SESSION_NONE) {
    session_start();
  }

  if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'No autenticado']);
    exit;
  }

  return $_SESSION['admin_id'];
}
