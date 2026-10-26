interface WhatsAppTicketShareParams {
  phone?: string;
  attendeeName: string;
  eventName: string;
  ticketCode: string;
  ticketViewUrl: string;
  referrerName?: string;
}

export const generateWhatsAppTicketLink = ({
  phone,
  attendeeName,
  eventName,
  ticketCode,
  ticketViewUrl,
  referrerName,
}: WhatsAppTicketShareParams): string => {
  // Format phone number: remove non-digits
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

  const message = [
    `🎟️ *¡HOLA ${attendeeName.toUpperCase()}! TU PASE DE ABORDAJE ESTÁ LISTO* ⭐`,
    ``,
    `Nos complace confirmarte tu entrada para:`,
    `✨ *${eventName}*`,
    ``,
    `🎫 *Código de Ticket:* \`${ticketCode}\``,
    referrerName ? `👤 *Invitado por:* ${referrerName}` : '',
    ``,
    `📥 *Descarga o presenta tu pase digital aquí:*`,
    `${ticketViewUrl}`,
    ``,
    `_Por favor presenta el código QR en la entrada al llegar para tu ingreso rápido. ¡Te esperamos!_ 🚀`,
  ]
    .filter((line) => line !== '')
    .join('\n');

  const encodedMessage = encodeURIComponent(message);

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
  }

  // If no phone specified, open WhatsApp with text ready to choose contact
  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
};
