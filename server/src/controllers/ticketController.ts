import { Request, Response } from 'express';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import { Ticket } from '../models/Ticket.js';
import { Event } from '../models/Event.js';
import { TicketType } from '../models/TicketType.js';
import { User } from '../models/User.js';
import { sendTicketConfirmationEmail } from '../services/emailService.js';

// Helper to generate distinctive, clean boarding pass ticket codes: ALLSTAR-7B3K9A
const generateUniqueTicketCode = async (): Promise<string> => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude 0, 1, O, I for clarity
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    let randomPart = '';
    for (let i = 0; i < 6; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = `ALLSTAR-${randomPart}`;
    const existing = await Ticket.findOne({ ticketCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

export const registerTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      eventId,
      ticketTypeId,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      referralCode,
    } = req.body;

    if (!eventId || !ticketTypeId || !attendeeName || !attendeeEmail) {
      res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos obligatorios (nombre, correo y tipo de entrada)',
      });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event || !event.isActive || event.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: event?.status === 'cancelled'
          ? 'Este evento ha sido cancelado y no admite nuevas inscripciones.'
          : 'El evento no existe o no se encuentra activo',
      });
      return;
    }

    // Check overall event capacity limit
    if (event.capacityLimit) {
      const currentCount = await Ticket.countDocuments({
        eventId: event._id,
        status: { $ne: 'cancelled' },
      });
      if (currentCount >= event.capacityLimit) {
        res.status(400).json({
          success: false,
          message: 'Lo sentimos, el aforo total para este evento se ha completado.',
        });
        return;
      }
    }

    const ticketType = await TicketType.findById(ticketTypeId);
    if (!ticketType || ticketType.eventId.toString() !== event._id.toString()) {
      res.status(400).json({ success: false, message: 'Tipo de entrada inválido para este evento' });
      return;
    }

    // Check ticket type max quantity
    if (ticketType.maxQuantity) {
      const currentTypeCount = await Ticket.countDocuments({
        ticketTypeId: ticketType._id,
        status: { $ne: 'cancelled' },
      });
      if (currentTypeCount >= ticketType.maxQuantity) {
        res.status(400).json({
          success: false,
          message: `El cupo para el tipo de entrada "${ticketType.name}" se ha agotado.`,
        });
        return;
      }
    }

    // Look up referring partner by code if supplied
    let invitedByUserId = null;
    let referrerUser = null;
    if (referralCode && typeof referralCode === 'string') {
      referrerUser = await User.findOne({ referralCode: referralCode.trim().toLowerCase() });
      if (referrerUser) {
        invitedByUserId = referrerUser._id;
      }
    }

    const ticketCode = await generateUniqueTicketCode();

    const ticket = new Ticket({
      ticketCode,
      eventId: event._id,
      ticketTypeId: ticketType._id,
      invitedByUserId,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim().toLowerCase(),
      attendeePhone: attendeePhone ? attendeePhone.trim() : '',
      status: 'registered',
    });

    await ticket.save();

    // Populate for immediate response and email
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('eventId')
      .populate('ticketTypeId')
      .populate('invitedByUserId', 'fullName referralCode');

    // Send transactional email in background
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const ticketViewUrl = `${clientUrl}/ticket/${ticketCode}`;

    sendTicketConfirmationEmail({
      toEmail: ticket.attendeeEmail,
      attendeeName: ticket.attendeeName,
      eventName: event.title,
      eventDate: event.eventDate,
      venueName: event.venueName,
      city: event.city,
      ticketCode: ticket.ticketCode,
      ticketTypeName: ticketType.name,
      referrerName: referrerUser ? referrerUser.fullName : undefined,
      ticketViewUrl,
    }).catch((err) => console.error('Error enviando email en background:', err));

    res.status(201).json({
      success: true,
      message: '¡Registro completado exitosamente!',
      ticket: populatedTicket,
    });
  } catch (error: any) {
    console.error('Error al registrar ticket:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al procesar el registro' });
  }
};

export const checkInTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ticketCode } = req.body;

    if (!ticketCode || typeof ticketCode !== 'string') {
      res.status(400).json({ success: false, message: 'Código de ticket no proporcionado' });
      return;
    }

    const cleanedCode = ticketCode.trim().toUpperCase();

    const ticket = await Ticket.findOne({ ticketCode: cleanedCode })
      .populate('eventId')
      .populate('ticketTypeId')
      .populate('invitedByUserId', 'fullName referralCode');

    if (!ticket) {
      res.status(404).json({
        success: false,
        message: 'Código inválido. No existe ningún ticket registrado con este identificador.',
        ticketCode: cleanedCode,
      });
      return;
    }

    if (ticket.status === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'Este ticket fue cancelado previamente y no tiene acceso autorizado.',
        ticket,
      });
      return;
    }

    const event = ticket.eventId as any;
    if (event && (event.status === 'cancelled' || event.isActive === false)) {
      res.status(400).json({
        success: false,
        message: `El evento "${event.title || 'Asociado'}" ha sido CANCELADO. El acceso no está permitido.`,
        ticket,
      });
      return;
    }

    if (ticket.status === 'checked_in') {
      const checkInFormatted = ticket.checkedInAt
        ? new Date(ticket.checkedInAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : 'Previamente';

      res.status(409).json({
        success: false,
        alreadyUsed: true,
        message: `¡ATENCIÓN! Este ticket YA FUE UTILIZADO a las ${checkInFormatted}.`,
        checkedInAt: ticket.checkedInAt,
        ticket,
      });
      return;
    }

    // Mark as checked in
    ticket.status = 'checked_in';
    ticket.checkedInAt = new Date();
    await ticket.save();

    res.status(200).json({
      success: true,
      message: `¡ACCESO CONCEDIDO! Bienvenido(a) ${ticket.attendeeName}`,
      ticket,
      checkedInAt: ticket.checkedInAt,
    });
  } catch (error) {
    console.error('Error al realizar check-in:', error);
    res.status(500).json({ success: false, message: 'Error interno al procesar el check-in' });
  }
};

export const getTicketByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const ticket = await Ticket.findOne({ ticketCode: code.trim().toUpperCase() })
      .populate('eventId')
      .populate('ticketTypeId')
      .populate('invitedByUserId', 'fullName referralCode');

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket no encontrado' });
      return;
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getEventAttendees = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const { search, partnerId, status } = req.query;

    const query: any = { eventId };

    if (status && typeof status === 'string' && status !== 'all') {
      query.status = status;
    }

    if (partnerId && typeof partnerId === 'string' && partnerId !== 'all') {
      if (partnerId === 'direct') {
        query.invitedByUserId = null;
      } else {
        query.invitedByUserId = partnerId;
      }
    }

    if (search && typeof search === 'string') {
      const term = search.trim();
      query.$or = [
        { attendeeName: { $regex: term, $options: 'i' } },
        { attendeeEmail: { $regex: term, $options: 'i' } },
        { attendeePhone: { $regex: term, $options: 'i' } },
        { ticketCode: { $regex: term, $options: 'i' } },
      ];
    }

    const attendees = await Ticket.find(query)
      .populate('eventId')
      .populate('invitedByUserId', 'fullName referralCode')
      .populate('ticketTypeId', 'name price')
      .sort({ createdAt: -1 });

    res.json({ success: true, attendees, count: attendees.length });
  } catch (error) {
    console.error('Error al listar asistentes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const resendTicketEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const query = mongoose.isValidObjectId(id) ? { _id: id } : { ticketCode: id.trim().toUpperCase() };
    const ticket = await Ticket.findOne(query)
      .populate('eventId')
      .populate('ticketTypeId')
      .populate('invitedByUserId', 'fullName referralCode');

    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket no encontrado' });
      return;
    }

    const event = ticket.eventId as any;
    const ticketType = ticket.ticketTypeId as any;
    const referrer = ticket.invitedByUserId as any;

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const ticketViewUrl = `${clientUrl}/ticket/${ticket.ticketCode}`;

    const result = await sendTicketConfirmationEmail({
      toEmail: (req.body && req.body.email) || ticket.attendeeEmail,
      attendeeName: ticket.attendeeName,
      eventName: event ? event.title : 'Evento Oficial AllStar',
      eventDate: event ? event.eventDate : new Date(),
      venueName: event ? event.venueName : 'Recinto Oficial',
      city: event ? event.city : 'Sede Oficial',
      ticketCode: ticket.ticketCode,
      ticketTypeName: ticketType ? ticketType.name : 'Pase General',
      referrerName: referrer ? referrer.fullName : undefined,
      ticketViewUrl,
    });

    res.json({
      success: result.success,
      sent: result.sent,
      previewUrl: result.previewUrl,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error enviando email de invitación:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al enviar email de invitación' });
  }
};

export const getTicketQrImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const cleanCode = code.replace(/\.png$/i, '').trim().toUpperCase();

    const ticket = await Ticket.findOne({ ticketCode: cleanCode });
    if (!ticket) {
      res.status(404).json({ success: false, message: 'Ticket no encontrado' });
      return;
    }

    const qrBuffer = await QRCode.toBuffer(cleanCode, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0b1329',
        light: '#ffffff',
      },
    });

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Disposition', `inline; filename="qr-${cleanCode}.png"`);
    res.send(qrBuffer);
  } catch (error: any) {
    console.error('Error generando QR image:', error);
    res.status(500).json({ success: false, message: 'Error generando imagen QR' });
  }
};
