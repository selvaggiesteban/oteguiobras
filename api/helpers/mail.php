<?php
// ─── Email helper for LatinCloud (DirectAdmin + Exim) ──────────
// Uses PHP native mail() — works out of the box on DirectAdmin hosting.

define('SMTP_FROM', 'Otegui Obras <no-reply@oteguiobras.com>');
define('SMTP_NOTIFY', 'admin@oteguiobras.com');

/**
 * Send an admin notification email.
 * @param string $subject  Email subject (UTF-8)
 * @param string $body     HTML body
 * @return bool
 */
function sendAdminNotification($subject, $body) {
  $to = SMTP_NOTIFY;
  $headers = [
    'From: ' . SMTP_FROM,
    'Reply-To: ' . SMTP_FROM,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'X-Mailer: OteguiObras/1.0',
  ];

  return mail($to, $subject, $body, implode("\r\n", $headers));
}

/**
 * Build a styled HTML email for contact form submission.
 */
function buildContactEmail($data) {
  $nombre  = htmlspecialchars($data['nombre'] ?? '');
  $email   = htmlspecialchars($data['email'] ?? '');
  $tel     = htmlspecialchars($data['telefono'] ?? '');
  $empresa = htmlspecialchars($data['empresa'] ?? '');
  $mensaje = nl2br(htmlspecialchars($data['mensaje'] ?? ''));

  $telBlock = $tel ? "<p><strong>Teléfono:</strong> {$tel}</p>" : '';
  $empresaBlock = $empresa ? "<p><strong>Empresa:</strong> {$empresa}</p>" : '';

  return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <div style="background:#1a1a2e;color:#d4a574;padding:20px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;">Nuevo mensaje de contacto</h2>
  </div>
  <div style="border:1px solid #ddd;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
    <p><strong>Nombre:</strong> {$nombre}</p>
    <p><strong>Email:</strong> <a href="mailto:{$email}">{$email}</a></p>
    {$telBlock}
    {$empresaBlock}
    <hr style="border:none;border-top:1px solid #eee;margin:15px 0;">
    <p><strong>Mensaje:</strong></p>
    <div style="background:#f9f9f9;padding:15px;border-radius:6px;">{$mensaje}</div>
    <hr style="border:none;border-top:1px solid #eee;margin:15px 0;">
    <p style="color:#888;font-size:12px;">Este mensaje fue enviado desde el formulario de contacto de oteguiobras.com</p>
  </div>
</body>
</html>
HTML;
}

/**
 * Build a styled HTML email for job application.
 */
function buildPostulacionEmail($data) {
  $nombre  = htmlspecialchars($data['nombre'] ?? '');
  $email   = htmlspecialchars($data['email'] ?? '');
  $tel     = htmlspecialchars($data['telefono'] ?? '');
  $linkedin = htmlspecialchars($data['linkedin'] ?? '');
  $cvUrl   = $data['cv_url'] ?? '';

  $telBlock = $tel ? "<p><strong>Teléfono:</strong> {$tel}</p>" : '';
  $linkedinBlock = $linkedin ? "<p><strong>LinkedIn:</strong> <a href=\"{$linkedin}\">{$linkedin}</a></p>" : '';
  $cvBlock = $cvUrl ? "<p><strong>CV:</strong> <a href=\"https://oteguiobras.com{$cvUrl}\">Descargar PDF</a></p>" : '';

  return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333;">
  <div style="background:#1a1a2e;color:#d4a574;padding:20px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;">Nueva postulación recibida</h2>
  </div>
  <div style="border:1px solid #ddd;border-top:none;padding:20px;border-radius:0 0 8px 8px;">
    <p><strong>Nombre:</strong> {$nombre}</p>
    <p><strong>Email:</strong> <a href="mailto:{$email}">{$email}</a></p>
    {$telBlock}
    {$linkedinBlock}
    {$cvBlock}
    <hr style="border:none;border-top:1px solid #eee;margin:15px 0;">
    <p style="color:#888;font-size:12px;">Postulación enviada desde "Trabajá con nosotros" en oteguiobras.com</p>
  </div>
</body>
</html>
HTML;
}
