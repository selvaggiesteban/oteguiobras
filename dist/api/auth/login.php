<?php
require_once __DIR__ . '/../config.php';

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

ensureMethod('POST');

$data = getInput();
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (!$email || !$password) {
  jsonResponse(['error' => 'Email y contraseña son obligatorios'], 400);
}

$db = getDB();
$stmt = $db->prepare('SELECT id, email, password_hash FROM admins WHERE email = ?');
$stmt->execute([$email]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
  jsonResponse(['error' => 'Credenciales inválidas'], 401);
}

$_SESSION['admin_id'] = $admin['id'];
$_SESSION['admin_email'] = $admin['email'];

jsonResponse(['success' => true, 'email' => $admin['email']]);
