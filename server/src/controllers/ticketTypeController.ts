import { Request, Response } from 'express';
import { TicketType } from '../models/TicketType.js';
import { Event } from '../models/Event.js';
import { Ticket } from '../models/Ticket.js';

export const getAllTicketTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.query;
    const filter: any = {};
    if (eventId) {
      filter.eventId = eventId;
    }

    const ticketTypes = await TicketType.find(filter).sort({ price: 1, createdAt: 1 });

    const enrichedTypes = await Promise.all(
      ticketTypes.map(async (t) => {
        const soldCount = await Ticket.countDocuments({
          ticketTypeId: t._id,
          status: { $ne: 'cancelled' },
        });
        const checkedInCount = await Ticket.countDocuments({
          ticketTypeId: t._id,
          status: 'checked_in',
        });
        return {
          ...t.toObject(),
          ticketsSold: soldCount,
          ticketsCheckedIn: checkedInCount,
          availableQuantity:
            t.maxQuantity !== null && t.maxQuantity !== undefined
              ? Math.max(0, t.maxQuantity - soldCount)
              : null,
        };
      })
    );

    res.json({ success: true, ticketTypes: enrichedTypes });
  } catch (error: any) {
    console.error('Error al obtener tipos de entrada:', error);
    res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const getTicketTypesByEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'Evento no encontrado' });
      return;
    }

    const ticketTypes = await TicketType.find({ eventId }).sort({ price: 1, createdAt: 1 });

    // Calculate tickets sold/registered for each ticket type
    const enrichedTypes = await Promise.all(
      ticketTypes.map(async (t) => {
        const soldCount = await Ticket.countDocuments({
          ticketTypeId: t._id,
          status: { $ne: 'cancelled' },
        });
        const checkedInCount = await Ticket.countDocuments({
          ticketTypeId: t._id,
          status: 'checked_in',
        });
        return {
          ...t.toObject(),
          ticketsSold: soldCount,
          ticketsCheckedIn: checkedInCount,
          availableQuantity: t.maxQuantity !== null && t.maxQuantity !== undefined
            ? Math.max(0, t.maxQuantity - soldCount)
            : null,
        };
      })
    );

    res.json({ success: true, ticketTypes: enrichedTypes });
  } catch (error: any) {
    console.error('Error al obtener tipos de entrada:', error);
    res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};

export const createTicketType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId, name, price, maxQuantity, description, isActive } = req.body;

    if (!eventId || !name) {
      res.status(400).json({ success: false, message: 'El evento y el nombre de la entrada son requeridos' });
      return;
    }

    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ success: false, message: 'El evento especificado no existe' });
      return;
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      res.status(400).json({ success: false, message: 'El precio debe ser un número válido mayor o igual a 0' });
      return;
    }

    let parsedMaxQuantity: number | null = null;
    if (maxQuantity !== undefined && maxQuantity !== null && maxQuantity !== '') {
      parsedMaxQuantity = Number(maxQuantity);
      if (isNaN(parsedMaxQuantity) || parsedMaxQuantity < 0) {
        res.status(400).json({ success: false, message: 'El cupo máximo debe ser un número válido' });
        return;
      }
    }

    const ticketType = new TicketType({
      eventId,
      name: name.trim(),
      price: parsedPrice,
      maxQuantity: parsedMaxQuantity,
      description: description ? description.trim() : '',
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await ticketType.save();

    res.status(201).json({
      success: true,
      message: 'Tipo de entrada creado exitosamente',
      ticketType: {
        ...ticketType.toObject(),
        ticketsSold: 0,
        ticketsCheckedIn: 0,
        availableQuantity: parsedMaxQuantity,
      },
    });
  } catch (error: any) {
    console.error('Error al crear tipo de entrada:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al crear tipo de entrada' });
  }
};

export const updateTicketType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, price, maxQuantity, description, isActive } = req.body;

    const ticketType = await TicketType.findById(id);
    if (!ticketType) {
      res.status(404).json({ success: false, message: 'Tipo de entrada no encontrado' });
      return;
    }

    if (name !== undefined) ticketType.name = name.trim();

    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        res.status(400).json({ success: false, message: 'El precio debe ser un número válido mayor o igual a 0' });
        return;
      }
      ticketType.price = parsedPrice;
    }

    if (maxQuantity !== undefined) {
      if (maxQuantity === null || maxQuantity === '') {
        ticketType.maxQuantity = null;
      } else {
        const parsedMaxQuantity = Number(maxQuantity);
        if (isNaN(parsedMaxQuantity) || parsedMaxQuantity < 0) {
          res.status(400).json({ success: false, message: 'El cupo máximo debe ser un número válido' });
          return;
        }
        ticketType.maxQuantity = parsedMaxQuantity;
      }
    }

    if (description !== undefined) ticketType.description = description.trim();
    if (isActive !== undefined) ticketType.isActive = Boolean(isActive);

    await ticketType.save();

    const soldCount = await Ticket.countDocuments({
      ticketTypeId: ticketType._id,
      status: { $ne: 'cancelled' },
    });

    res.json({
      success: true,
      message: 'Tipo de entrada actualizado exitosamente',
      ticketType: {
        ...ticketType.toObject(),
        ticketsSold: soldCount,
        availableQuantity: (ticketType.maxQuantity !== null && ticketType.maxQuantity !== undefined)
          ? Math.max(0, ticketType.maxQuantity - soldCount)
          : null,
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar tipo de entrada:', error);
    res.status(400).json({ success: false, message: error.message || 'Error al actualizar tipo de entrada' });
  }
};

export const deleteTicketType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const ticketType = await TicketType.findById(id);
    if (!ticketType) {
      res.status(404).json({ success: false, message: 'Tipo de entrada no encontrado' });
      return;
    }

    // Safety check: Don't allow deletion if tickets are already registered
    const ticketsCount = await Ticket.countDocuments({ ticketTypeId: id });
    if (ticketsCount > 0) {
      res.status(400).json({
        success: false,
        message: `No se puede eliminar "${ticketType.name}" porque existen ${ticketsCount} tickets registrados con este tipo. Puedes desactivarlo para que no aparezca en nuevos registros.`,
        ticketsCount,
      });
      return;
    }

    await TicketType.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Tipo de entrada "${ticketType.name}" eliminado correctamente`,
    });
  } catch (error: any) {
    console.error('Error al eliminar tipo de entrada:', error);
    res.status(500).json({ success: false, message: error.message || 'Error interno del servidor' });
  }
};