import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Event } from '../models/Event.js';
import { TicketType } from '../models/TicketType.js';
import { Ticket } from '../models/Ticket.js';

dotenv.config();

export const seedDatabase = async (): Promise<void> => {
  try {
    const existingEventsCount = await Event.countDocuments();
    if (existingEventsCount > 0) {
      console.log('ℹ️ La base de datos ya contiene información. Omitiendo seed inicial.');
      return;
    }

    console.log('🌱 Sembrando datos iniciales con roles, permisos y usuarios...');

    const defaultPassword = 'AllStar2026!';

    // 1. Usuarios con Roles y Permisos Granulares
    const users = await User.create([
      {
        fullName: 'Zamyr Pedreros',
        email: 'zamyr@allstarticket.com',
        password: defaultPassword,
        role: 'admin',
        permissions: [
          'invite_prospects',
          'manage_partners',
          'create_events',
          'view_metrics',
          'door_scanner',
        ],
        referralCode: 'zamyr',
        phone: '+57 300 123 4567',
        isActive: true,
      },
      {
        fullName: 'Andrea Gómez',
        email: 'andrea.gomez@allstarticket.com',
        password: defaultPassword,
        role: 'leader',
        permissions: [
          'invite_prospects',
          'manage_partners',
          'view_metrics',
          'door_scanner',
        ],
        referralCode: 'andrea',
        phone: '+57 311 987 6543',
        isActive: true,
      },
      {
        fullName: 'Carlos Mendoza',
        email: 'carlos.m@allstarticket.com',
        password: defaultPassword,
        role: 'partner',
        permissions: ['invite_prospects'],
        referralCode: 'carlos',
        phone: '+1 786 555 0192',
        isActive: true,
      },
      {
        fullName: 'Sofía Valenzuela',
        email: 'sofia.v@allstarticket.com',
        password: defaultPassword,
        role: 'partner',
        permissions: ['invite_prospects'],
        referralCode: 'sofia',
        phone: '+52 55 4123 8899',
        isActive: true,
      },
    ]);

    const zamyrUser = users[0];
    const andreaUser = users[1];
    const carlosUser = users[2];

    // 2. Evento Principal
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 30); // 30 days from now
    eventDate.setHours(18, 30, 0, 0);

    const mainEvent = await Event.create({
      title: 'Cumbre All-Star de Liderazgo, Viajes y Cruceros 2026',
      slug: 'cumbre-cruceros-2026',
      eventDate,
      city: 'Cancún / Riviera Maya',
      venueName: 'Grand Hyatt Convention Center & Marina',
      venueAddress: 'Blvd. Kukulcan Km 10.5, Zona Hotelera',
      guestLeaders: [
        'Zamyr Pedreros (Presidential Director)',
        'Andrea Gómez (Executive Ambassador)',
        'Carlos Mendoza (Diamond Cruiser)',
      ],
      capacityLimit: 350,
      isActive: true,
    });

    // 3. Tipos de Ticket
    const ticketTypes = await TicketType.create([
      {
        eventId: mainEvent._id,
        name: 'Invitado General (Free Pass)',
        price: 0,
        maxQuantity: 250,
      },
      {
        eventId: mainEvent._id,
        name: 'Socio Calificado',
        price: 25,
        maxQuantity: 100,
      },
      {
        eventId: mainEvent._id,
        name: 'VIP First Class & Coctel Privado',
        price: 75,
        maxQuantity: 50,
      },
    ]);

    const freePass = ticketTypes[0];
    const vipPass = ticketTypes[2];

    // 4. Muestra de Tickets
    const demoCheckedInTime = new Date();
    demoCheckedInTime.setMinutes(demoCheckedInTime.getMinutes() - 15);

    await Ticket.create([
      {
        ticketCode: 'ALLSTAR-849382',
        eventId: mainEvent._id,
        ticketTypeId: freePass._id,
        invitedByUserId: zamyrUser._id,
        attendeeName: 'Mateo Restrepo',
        attendeeEmail: 'mateo.restrepo@example.com',
        attendeePhone: '+57 301 222 3344',
        status: 'registered',
      },
      {
        ticketCode: 'ALLSTAR-7K9M2P',
        eventId: mainEvent._id,
        ticketTypeId: vipPass._id,
        invitedByUserId: andreaUser._id,
        attendeeName: 'Laura Daniels',
        attendeeEmail: 'laura.daniels@example.com',
        attendeePhone: '+1 305 444 8899',
        status: 'checked_in',
        checkedInAt: demoCheckedInTime,
      },
      {
        ticketCode: 'ALLSTAR-3H8W4N',
        eventId: mainEvent._id,
        ticketTypeId: freePass._id,
        invitedByUserId: carlosUser._id,
        attendeeName: 'Felipe Sandoval',
        attendeeEmail: 'felipe.s@example.com',
        attendeePhone: '+52 998 123 4567',
        status: 'registered',
      },
    ]);

    console.log('✅ Seed completado con éxito:');
    console.log(`   - 4 Socios/Admins creados con contraseña: "${defaultPassword}"`);
    console.log(`     • Zamyr Pedreros: role 'admin' (todos los permisos)`);
    console.log(`     • Andrea Gómez: role 'leader' (permisos: invitar, crear socios, métricas, scanner)`);
    console.log(`     • Carlos Mendoza: role 'partner' (permiso: invitar prospectos)`);
    console.log(`     • Sofía Valenzuela: role 'partner' (permiso: invitar prospectos)`);
  } catch (error) {
    console.error('❌ Error al sembrar datos:', error);
  }
};

// If run directly via command line
if (process.argv[1]?.includes('seedData')) {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/allstar_tickets';
  mongoose
    .connect(mongoUri)
    .then(async () => {
      await seedDatabase();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
