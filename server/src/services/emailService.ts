import { Resend } from 'resend';

interface SendTicketEmailParams {
  toEmail: string;
  attendeeName: string;
  eventName: string;
  eventDate: Date;
  venueName: string;
  city: string;
  ticketCode: string;
  ticketTypeName: string;
  referrerName?: string;
  ticketViewUrl: string;
}

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'AllStar Tickets <onboarding@resend.dev>';

export const sendTicketConfirmationEmail = async (params: SendTicketEmailParams): Promise<boolean> => {
  const {
    toEmail,
    attendeeName,
    eventName,
    eventDate,
    venueName,
    city,
    ticketCode,
    ticketTypeName,
    referrerName,
    ticketViewUrl,
  } = params;

  const formattedDate = new Date(eventDate).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b1329; color: #ffffff; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #111c44 0%, #0d1533 100%); border-radius: 16px; border: 1px solid rgba(212, 175, 55, 0.3); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(90deg, #d4af37, #f3e5ab, #d4af37); padding: 24px; text-align: center; color: #0b1329; font-weight: 800; font-size: 24px; letter-spacing: 2px; text-transform: uppercase; }
        .content { padding: 32px 24px; }
        .badge { display: inline-block; background-color: rgba(212, 175, 55, 0.15); border: 1px solid #d4af37; color: #f3e5ab; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
        .h1 { font-size: 22px; font-weight: 700; margin-top: 0; color: #ffffff; }
        .detail-card { background: rgba(255, 255, 255, 0.04); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 12px; padding: 20px; margin: 24px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 14px; }
        .detail-label { color: #8fa0c9; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
        .detail-value { font-weight: 600; color: #ffffff; }
        .code-box { background: #000; border: 2px solid #d4af37; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0; }
        .code-title { color: #8fa0c9; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .code-num { font-size: 28px; font-weight: 900; letter-spacing: 4px; color: #f3e5ab; font-family: monospace; }
        .btn { display: block; text-align: center; background: linear-gradient(90deg, #d4af37, #e6c86e); color: #0b1329; font-weight: 700; text-decoration: none; padding: 16px 28px; border-radius: 10px; font-size: 16px; margin: 28px 0 10px 0; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4); text-transform: uppercase; letter-spacing: 1px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #6b7a99; border-top: 1px solid rgba(255,255,255,0.06); }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">⭐ ALLSTAR TICKET ⭐</div>
        <div class="content">
          <div class="badge">${ticketTypeName}</div>
          <h1 class="h1">¡Hola ${attendeeName}! Tu Pase de Abordaje está confirmado</h1>
          <p style="color: #c7d2fe; line-height: 1.6; font-size: 15px;">
            Te damos la bienvenida a una experiencia exclusiva de liderazgo, networking y viajes. Presenta este pase en la puerta de acceso para registrar tu ingreso.
          </p>

          <div class="code-box">
            <div class="code-title">CÓDIGO DE VALIDACIÓN RÁPIDA</div>
            <div class="code-num">${ticketCode}</div>
          </div>

          <div class="detail-card">
            <div style="margin-bottom: 12px;">
              <div class="detail-label">Evento</div>
              <div class="detail-value" style="font-size: 16px; color: #f3e5ab;">${eventName}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div class="detail-label">Fecha y Hora</div>
              <div class="detail-value">${formattedDate}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div class="detail-label">Recinto</div>
              <div class="detail-value">${venueName} - ${city}</div>
            </div>
            ${referrerName ? `
              <div>
                <div class="detail-label">Invitado Especial por</div>
                <div class="detail-value" style="color: #60a5fa;">${referrerName}</div>
              </div>
            ` : ''}
          </div>

          <a href="${ticketViewUrl}" class="btn" target="_blank">Ver y Descargar Boarding Pass</a>
          <p style="text-align: center; font-size: 12px; color: #8fa0c9; margin-top: 8px;">
            También puedes llevar este código QR descargado en tu teléfono móvil.
          </p>
        </div>
        <div class="footer">
          AllStar Ticket Platform • Experiencias de Liderazgo y Estilo de Vida
        </div>
      </div>
    </body>
    </html>
  `;

  if (!resend) {
    console.log(`✉️ [Resend Mock] Email simulado para ${toEmail} | Ticket: ${ticketCode} | Evento: ${eventName}`);
    console.log(`🔗 Ver ticket: ${ticketViewUrl}`);
    return true;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `🎟️ Tu Pase de Abordaje: ${eventName} (${ticketCode})`,
      html: htmlContent,
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      return false;
    }

    console.log(`✅ Email enviado exitosamente vía Resend ID: ${data?.id}`);
    return true;
  } catch (err) {
    console.error('❌ Error al enviar email con Resend:', err);
    return false;
  }
};
