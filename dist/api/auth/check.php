<?php
require_once __DIR__ . '/../config.php';

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

ensureMethod('GET');

if (isset($_SESSION['admin_id'])) {
  jsonResponse(['authenticated' => true, 'email' => $_SESSION['admin_email'] ?? '']);
} else {
  jsonResponse(['authenticated' => false, 'email' => null]);
}
