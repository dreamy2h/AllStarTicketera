interface AttendeeExportRow {
  ticketCode: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketTypeName: string;
  ticketPrice: number;
  partnerName: string;
  referralCode: string;
  status: string;
  registeredAt: string;
  checkedInAt: string;
}

export const generateAttendeesCsv = (rows: AttendeeExportRow[]): string => {
  const headers = [
    'Codigo Ticket',
    'Asistente',
    'Email',
    'WhatsApp / Telefono',
    'Tipo de Entrada',
    'Precio',
    'Socio Invitador',
    'Codigo Referido',
    'Estado',
    'Fecha Registro',
    'Fecha Check-in',
  ];

  const escapeCsv = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const stringVal = String(val).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const csvRows = rows.map((r) => [
    escapeCsv(r.ticketCode),
    escapeCsv(r.attendeeName),
    escapeCsv(r.attendeeEmail),
    escapeCsv(r.attendeePhone),
    escapeCsv(r.ticketTypeName),
    escapeCsv(r.ticketPrice),
    escapeCsv(r.partnerName),
    escapeCsv(r.referralCode),
    escapeCsv(r.status),
    escapeCsv(r.registeredAt),
    escapeCsv(r.checkedInAt),
  ].join(';')); // Semicolon is widely preferred for Excel in Spanish-speaking regions

  // Prepend UTF-8 BOM (\uFEFF) so Excel renders tildes and special characters correctly
  return '\uFEFF' + [headers.join(';'), ...csvRows].join('\r\n');
};
