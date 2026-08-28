<?php
/**
 * Test SMTP email - detailed debug version.
 * DELETE THIS FILE AFTER TESTING.
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/helpers/phpmailer/PHPMailer.php';
require_once __DIR__ . '/helpers/phpmailer/SMTP.php';
require_once __DIR__ . '/helpers/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

echo "<h2>SMTP Debug Test</h2>";

// Show config
echo "<p><strong>SMTP_HOST:</strong> " . (getenv('SMTP_HOST') ?: 'NOT SET') . "</p>";
echo "<p><strong>SMTP_PORT:</strong> " . (getenv('SMTP_PORT') ?: 'NOT SET') . "</p>";
echo "<p><strong>SMTP_USER:</strong> " . (getenv('SMTP_USER') ?: 'NOT SET') . "</p>";
echo "<p><strong>SMTP_PASS:</strong> " . (getenv('SMTP_PASS') ? '***SET***' : 'NOT SET') . "</p>";

$mail = new PHPMailer(true);

try {
    // SMTP config (Gmail)
    $mail->isSMTP();
    $mail->Host       = getenv('SMTP_HOST') ?: 'smtp.gmail.com';
    $mail->Port       = getenv('SMTP_PORT') ?: 587;
    $mail->SMTPAuth   = true;
    $mail->Username   = getenv('SMTP_USER') ?: 'oteguiobra@gmail.com';
    $mail->Password   = getenv('SMTP_PASS') ?: '';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->CharSet    = 'UTF-8';
    $mail->SMTPDebug  = SMTP::DEBUG_SERVER; // Enable full debug output

    echo "<p>Connecting to {$mail->Host}:{$mail->Port}...</p>";

    // From / To
    $mail->setFrom('oteguiobra@gmail.com', 'Otegui Obras');
    $mail->addAddress('oficina@oteguiobras.com');

    // Content
    $mail->isHTML(true);
    $mail->Subject = "Test SMTP Debug - " . date('Y-m-d H:i:s');
    $mail->Body    = "<h1>Test exitoso</h1><p>El envío SMTP está funcionando.</p>";

    $mail->send();
    echo "<p style='color:green;'><strong>✅ Email enviado exitosamente!</strong></p>";
} catch (Exception $e) {
    echo "<p style='color:red;'><strong>❌ Error:</strong> " . htmlspecialchars($mail->ErrorInfo) . "</p>";
    echo "<p><strong>PHP Error:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<p><small>Archivo: api/_test_mail_debug.php - BORRAR DESPUÉS DEL TEST</small></p>";
