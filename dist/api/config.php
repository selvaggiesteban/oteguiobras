<?php
// ─── Configuración de base de datos ───────────────────────────
// Read from .env file if it exists, otherwise use defaults

$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
  $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    $line = trim($line);
    if (str_starts_with($line, '#') || !str_contains($line, '=')) continue;
    [$key, $value] = explode('=', $line, 2);
    $key = trim($key);
    $value = trim($value, " \t\n\r\0\x0B\"'");
    if (!getenv($key)) putenv("$key=$value");
  }
}

define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'oteguiobra_web');
define('DB_USER', getenv('DB_USER') ?: 'oteguiobra_web');
define('DB_PASS', getenv('DB_PASS') ?: '');

define('UPLOAD_DIR', $_SERVER['DOCUMENT_ROOT'] . '/images');
define('CV_DIR', $_SERVER['DOCUMENT_ROOT'] . '/cvs');

define('MAX_IMAGE_SIZE', 5 * 1024 * 1024);   // 5MB
define('MAX_FILE_SIZE', 10 * 1024 * 1024);    // 10MB (video/CV)

define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']);
define('ALLOWED_VIDEO_TYPES', ['video/mp4', 'video/webm']);
define('ALLOWED_DOC_TYPES', ['application/pdf']);

// ─── Conexión PDO ─────────────────────────────────────────────
function getDB() {
  static $pdo = null;
  if ($pdo !== null) return $pdo;

  try {
    $pdo = new PDO(
      'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
      DB_USER,
      DB_PASS,
      [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
      ]
    );
  } catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
  }
  return $pdo;
}

// ─── Helpers ──────────────────────────────────────────────────
function jsonResponse($data, $code = 200) {
  http_response_code($code);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function getInput() {
  $input = file_get_contents('php://input');
  return json_decode($input, true) ?: [];
}

function ensureMethod($methods) {
  if (!in_array($_SERVER['REQUEST_METHOD'], (array)$methods)) {
    jsonResponse(['error' => 'Método no permitido'], 405);
  }
}

function getQueryParam($key, $default = null) {
  return $_GET[$key] ?? $default;
}
