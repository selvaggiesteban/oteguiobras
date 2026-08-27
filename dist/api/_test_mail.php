<?php
/**
 * Test SMTP email sending.
 * DELETE THIS FILE AFTER TESTING.
 * Usage: php api/_test_mail.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/mail.php';

echo "Testing SMTP email...\n";

$subject = "Test de email - Otegui Obras (" . date('Y-m-d H:i:s') . ")";
$body = <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <h2>Email de prueba</h2>
  <p>Este es un email de prueba desde el script <code>_test_mail.php</code>.</p>
  <p>Si lo recibiste, el envío SMTP está funcionando correctamente.</p>
  <p style="color:#888;font-size:12px;">Enviado: {date('Y-m-d H:i:s')}</p>
</body>
</html>
HTML;

$result = sendAdminNotification($subject, $body);

if ($result) {
  echo "✅ Email enviado exitosamente a " . SMTP_NOTIFY . "\n";
} else {
  echo "❌ Error al enviar email. Revisá los logs de PHP.\n";
}
