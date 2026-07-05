<?php
require_once __DIR__ . '/../config.php';

if (session_status() === PHP_SESSION_NONE) {
  session_start();
}

ensureMethod('POST');

$_SESSION = [];
session_destroy();

jsonResponse(['success' => true]);
