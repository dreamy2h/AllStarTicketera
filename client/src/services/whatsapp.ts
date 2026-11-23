export interface WhatsAppTicketShareParams {
  phone?: string;
  attendeeName: string;
  eventName: string;
  ticketCode: string;
  ticketViewUrl: string;
  referrerName?: string;
}

export const buildWhatsAppMessage = ({
  attendeeName,
  eventName,
  ticketCode,
  ticketViewUrl,
  referrerName,
}: Omit<WhatsAppTicketShareParams, 'phone'>): string => {
  const origin = window.location.origin;
  const qrDirectImageUrl = `${origin}/api/tickets/${ticketCode}/qr.png`;

  const lines = [
    `🎟️ *¡HOLA ${attendeeName.toUpperCase()}! TU PASE DE ABORDAJE ESTÁ LISTO* ⭐`,
    ``,
    `Nos complace confirmarte tu entrada para:`,
    `✨ *${eventName}*`,
    ``,
    `🎫 *Código de Validación:* \`${ticketCode}\``,
    referrerName ? `👤 *Invitado por:* ${referrerName}` : '',
    ``,
    `📲 *Tu Pase de Abordaje Completo:*`,
    `${ticketViewUrl}`,
    ``,
    `🖼️ *Imagen de tu Código QR:*`,
    `${qrDirectImageUrl}`,
    ``,
    `_Por favor presenta la imagen del código QR en la entrada para tu ingreso rápido. ¡Te esperamos!_ 🚀`,
  ];

  return lines.filter((line) => line !== '').join('\n');
};

export const generateWhatsAppTicketLink = ({
  phone,
  attendeeName,
  eventName,
  ticketCode,
  ticketViewUrl,
  referrerName,
}: WhatsAppTicketShareParams): string => {
  const cleanPhone = phone ? phone.replace(/\D/g, '') : '';
  const message = buildWhatsAppMessage({ attendeeName, eventName, ticketCode, ticketViewUrl, referrerName });
  const encodedMessage = encodeURIComponent(message);

  if (cleanPhone) {
    return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
  }

  return `https://api.whatsapp.com/send?text=${encodedMessage}`;
};

export interface ShareWithImageResult {
  sharedDirectly: boolean;
  copiedToClipboard: boolean;
  downloaded: boolean;
  message: string;
}

/**
 * Shares ticket and QR image:
 * 1. On Mobile: uses native Web Share API to attach and send the actual PNG file to WhatsApp.
 * 2. On Desktop: automatically downloads the QR image, copies it to the clipboard, and opens WhatsApp Web ready for Ctrl+V.
 */
export const shareTicketWithQRImage = async (
  params: WhatsAppTicketShareParams,
  initialImageBlob?: Blob | null
): Promise<ShareWithImageResult> => {
  const message = buildWhatsAppMessage(params);
  let imageBlob = initialImageBlob;

  // If no blob was passed, fetch the server-generated QR PNG directly
  if (!imageBlob) {
    try {
      const res = await fetch(`/api/tickets/${params.ticketCode}/qr.png`);
      if (res.ok) {
        imageBlob = await res.blob();
      }
    } catch (fetchErr) {
      console.warn('No se pudo obtener el QR PNG desde el servidor:', fetchErr);
    }
  }

  // 1. Try Native Web Share API with file (smartphones, Android, iOS Safari)
  if (imageBlob && typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const imageFile = new File([imageBlob], `Pase-QR-${params.ticketCode}.png`, {
        type: imageBlob.type || 'image/png',
      });

      if (navigator.canShare({ files: [imageFile] })) {
        await navigator.share({
          files: [imageFile],
          title: `Pase de Abordaje • ${params.eventName}`,
          text: message,
        });

        return {
          sharedDirectly: true,
          copiedToClipboard: false,
          downloaded: false,
          message: '¡Pase de abordaje y código QR enviados por WhatsApp!',
        };
      }
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        return {
          sharedDirectly: false,
          copiedToClipboard: false,
          downloaded: false,
          message: 'Envío cancelado.',
        };
      }
      console.warn('Web Share API falló, usando fallback de WhatsApp Web con descarga y portapapeles:', shareErr);
    }
  }

  // 2. Desktop Fallback: Copy image to clipboard + Auto-download image + Open WhatsApp Web
  let copied = false;
  let downloaded = false;

  if (imageBlob) {
    // Copy to clipboard
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      try {
        await navigator.clipboard.write([
          new ClipboardItem({
            [imageBlob.type || 'image/png']: imageBlob,
          }),
        ]);
        copied = true;
      } catch (clipErr) {
        console.warn('No se pudo copiar la imagen al portapapeles:', clipErr);
      }
    }

    // Auto-download image so user has the physical file ready
    try {
      const blobUrl = URL.createObjectURL(imageBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `Pase-QR-${params.ticketCode}.png`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 500);
      downloaded = true;
    } catch (dlErr) {
      console.warn('Error al descargar imagen QR:', dlErr);
    }
  }

  // Open WhatsApp
  const url = generateWhatsAppTicketLink(params);
  window.open(url, '_blank', 'noopener,noreferrer');

  return {
    sharedDirectly: false,
    copiedToClipboard: copied,
    downloaded,
    message: copied
      ? '¡QR descargado y copiado! En el chat de WhatsApp presiona Ctrl + V para adjuntar la imagen.'
      : downloaded
      ? '¡QR descargado! Puedes adjuntar el archivo descargado en el chat de WhatsApp.'
      : 'Abriendo WhatsApp...',
  };
};
