import { Request, Response } from 'express';
import { Event } from '../models/Event.js';
import { TicketType } from '../models/TicketType.js';
import { User } from '../models/User.js';
import { Ticket } from '../models/Ticket.js';
import { generateAttendeesCsv } from '../services/csvService.js';

export const getAllEvents = async (_req: Request, res: Response): Promise<void> => {
  try {
    const events = await Event.find({ isActive: true }).sort({ eventDate: 1 });
    res.json({ success: true, events });
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const getEventBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { ref } = req.query;

    const event = await Event.findOne({ slug: slug.toLowerCase() });
    if (!event) {
      res.status(404).json({ success: false, message: 'Evento no encontrado' });
      return;
    }

    const ticketTypes = await TicketType.find({ eventId: event._id }).sort({ price: 1 });

    let referrer = null;
    if (ref && typeof ref === 'string') {
      const user = await User.findOne({ referralCode: ref.trim().toLowerCase() });
      if (user) {
        referrer = {
          id: user._id,
          fullName: user.fullName,
          referralCode: user.referralCode,
        };
      }
    }

    // Count tickets already registered to calculate remaining capacity
    const registeredCount = await Ticket.countDocuments({
      eventId: event._id,
      status: { $ne: 'cancelled' },
    });

    const isSoldOut = event.capacityLimit !== null && registeredCount >= (event.capacityLimit || 0);

    res.json({
      success: true,
      event,
      ticketTypes,
      referrer,
      stats: {
        registeredCount,
        capacityLimit: event.capacityLimit,
        isSoldOut,
      },
    });
  } catch (error) {
    console.error('Error al obtener evento por slug:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      eventDate,
      city,
      venueName,
      venueAddress,
      guestLeaders,
      capacityLimit,
      ticketTypes,
    } = req.body;

    const existing = await Event.findOne({ slug: slug.toLowerCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'Ya existe un evento con este slug' });
      return;
    }

    const event = new Event({
      title,
      slug: slug.toLowerCase(),
      eventDate: new Date(eventDate),
      city,
      venueName,
      venueAddress,
      guestLeaders: guestLeaders || [],
      capacityLimit: capacityLimit || null,
      isActive: true,
    });

    await event.save();

    // Create ticket types
    if (Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      const typesToInsert = ticketTypes.map((t: { name: string; price?: number; maxQuantity?: number }) => ({
        eventId: event._id,
        name: t.name,
        price: t.price || 0,
        maxQuantity: t.maxQuantity || null,
      }));
      await TicketType.insertMany(typesToInsert);
    } else {
      // Default ticket types if none provided
      await TicketType.create([
        { eventId: event._id, name: 'Invitado General (Pase Libre)', price: 0 },
        { eventId: event._id, name: 'Socio Calificado', price: 15 },
        { eventId: event._id, name: 'Acceso VIP / Leaders Club', price: 35 },
      ]);
    }

    res.status(201).json({ success: true, event });
  } catch (error: any) {
    console.error('Error al crear evento:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al crear evento' });
  }
};

export const getEventStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Evento no encontrado' });
      return;
    }

    const tickets = await Ticket.find({ eventId: event._id, status: { $ne: 'cancelled' } })
      .populate('invitedByUserId', 'fullName referralCode')
      .populate('ticketTypeId', 'name price');

    const totalRegistered = tickets.length;
    const checkedInCount = tickets.filter((t) => t.status === 'checked_in').length;
    const attendanceRate = totalRegistered > 0 ? Math.round((checkedInCount / totalRegistered) * 100) : 0;
    const capacityLimit = event.capacityLimit;
    const remainingCapacity = capacityLimit ? Math.max(0, capacityLimit - totalRegistered) : null;

    // Breakdown by Partner (Leaderboard)
    const partnerMap = new Map<string, { partnerName: string; referralCode: string; totalInvited: number; checkedIn: number }>();

    // Breakdown by Ticket Type
    const ticketTypeMap = new Map<string, { typeName: string; total: number; checkedIn: number }>();

    tickets.forEach((t: any) => {
      // Partner stats
      const partner = t.invitedByUserId;
      const partnerKey = partner ? partner._id.toString() : 'direct';
      const partnerName = partner ? partner.fullName : 'Registro Directo / Org';
      const referralCode = partner ? partner.referralCode : '-';

      if (!partnerMap.has(partnerKey)) {
        partnerMap.set(partnerKey, { partnerName, referralCode, totalInvited: 0, checkedIn: 0 });
      }
      const pEntry = partnerMap.get(partnerKey)!;
      pEntry.totalInvited += 1;
      if (t.status === 'checked_in') pEntry.checkedIn += 1;

      // Ticket Type stats
      const type = t.ticketTypeId;
      const typeKey = type ? type._id.toString() : 'unknown';
      const typeName = type ? type.name : 'General';

      if (!ticketTypeMap.has(typeKey)) {
        ticketTypeMap.set(typeKey, { typeName, total: 0, checkedIn: 0 });
      }
      const tEntry = ticketTypeMap.get(typeKey)!;
      tEntry.total += 1;
      if (t.status === 'checked_in') tEntry.checkedIn += 1;
    });

    const partnerLeaderboard = Array.from(partnerMap.values()).sort((a, b) => b.totalInvited - a.totalInvited);
    const ticketTypeBreakdown = Array.from(ticketTypeMap.values()).sort((a, b) => b.total - a.total);

    res.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        slug: event.slug,
        eventDate: event.eventDate,
        city: event.city,
        venueName: event.venueName,
        capacityLimit: event.capacityLimit,
      },
      stats: {
        totalRegistered,
        checkedInCount,
        attendanceRate,
        capacityLimit,
        remainingCapacity,
        partnerLeaderboard,
        ticketTypeBreakdown,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del evento:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const exportEventAttendeesCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Evento no encontrado' });
      return;
    }

    const tickets = await Ticket.find({ eventId: event._id })
      .populate('invitedByUserId', 'fullName referralCode')
      .populate('ticketTypeId', 'name price')
      .sort({ createdAt: -1 });

    const exportRows = tickets.map((t: any) => ({
      ticketCode: t.ticketCode,
      attendeeName: t.attendeeName,
      attendeeEmail: t.attendeeEmail,
      attendeePhone: t.attendeePhone || '',
      ticketTypeName: t.ticketTypeId ? t.ticketTypeId.name : 'N/A',
      ticketPrice: t.ticketTypeId ? t.ticketTypeId.price : 0,
      partnerName: t.invitedByUserId ? t.invitedByUserId.fullName : 'Directo',
      referralCode: t.invitedByUserId ? t.invitedByUserId.referralCode : '-',
      status: t.status === 'checked_in' ? 'Asistió (Check-in)' : t.status === 'registered' ? 'Inscrito' : 'Cancelado',
      registeredAt: new Date(t.createdAt).toLocaleString('es-ES'),
      checkedInAt: t.checkedInAt ? new Date(t.checkedInAt).toLocaleString('es-ES') : 'Pendiente',
    }));

    const csvContent = generateAttendeesCsv(exportRows);

    const filename = `asistentes_${event.slug}_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error('Error al exportar asistentes:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
