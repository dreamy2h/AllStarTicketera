import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Permission } from '../models/Permission.js';
import { Role } from '../models/Role.js';
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

    console.log('🌱 Sembrando catálogo dinámico de Permisos y Roles en MongoDB...');

    // 1. Catálogo de Permisos
    const permissionsData = [
      // Eventos
      {
        code: 'events:view',
        name: 'Ver Eventos y Aforos',
        category: 'Eventos',
        description: 'Permite visualizar detalles, recintos y cupos de los eventos.',
      },
      {
        code: 'events:create',
        name: 'Crear y Editar Eventos',
        category: 'Eventos',
        description: 'Permite publicar cumbres, configurar fechas, lugares y tipos de ticket.',
      },
      // Socios
      {
        code: 'prospects:invite',
        name: 'Invitar Prospectos & Pases',
        category: 'Socios',
        description: 'Permite usar el enlace de referido propio y emitir pases de abordaje.',
      },
      {
        code: 'partners:manage',
        name: 'Gestionar y Crear Socios',
        category: 'Socios',
        description: 'Permite acceder al mantenedor de socios y dar de alta nuevos miembros.',
      },
      {
        code: 'roles:manage',
        name: 'Gestionar Roles y Permisos',
        category: 'Seguridad',
        description: 'Permite crear nuevos roles y reasignar matriz de permisos.',
      },
      // Control de Puerta
      {
        code: 'scanner:access',
        name: 'Operar Scanner en Puerta',
        category: 'Acceso',
        description: 'Permite validar códigos QR de entrada y hacer check-in con cámara.',
      },
      // Analítica y Reportes
      {
        code: 'metrics:view',
        name: 'Ver Analíticas Globales',
        category: 'Reportes',
        description: 'Permite ver estadísticas en tiempo real y tabla de liderazgo.',
      },
      {
        code: 'metrics:export',
        name: 'Exportar Lista a CSV/Excel',
        category: 'Reportes',
        description: 'Permite descargar el listado completo de asistentes con datos de contacto.',
      },
    ];

    const permissions = await Permission.insertMany(permissionsData);
    const permMap = new Map<string, mongoose.Types.ObjectId>();
    permissions.forEach((p) => permMap.set(p.code, p._id as mongoose.Types.ObjectId));

    // 2. Roles del Sistema
    const adminRole = await Role.create({
      name: 'Administrador Global',
      slug: 'admin',
      description: 'Acceso total sin restricciones a todas las funciones y configuraciones.',
      permissions: Array.from(permMap.values()),
      isSystem: true,
    });

    const leaderRole = await Role.create({
      name: 'Líder de Organización',
      slug: 'leader',
      description: 'Líder con permiso para registrar socios en su equipo, invitar y ver métricas.',
      permissions: [
        permMap.get('prospects:invite')!,
        permMap.get('partners:manage')!,
        permMap.get('events:view')!,
        permMap.get('scanner:access')!,
        permMap.get('metrics:view')!,
        permMap.get('metrics:export')!,
      ],
      isSystem: true,
    });

    const partnerRole = await Role.create({
      name: 'Socio Promotor',
      slug: 'partner',
      description: 'Socio general enfocado en prospección, invitaciones y emisión de pases.',
      permissions: [
        permMap.get('prospects:invite')!,
        permMap.get('events:view')!,
      ],
      isSystem: true,
    });

    const staffRole = await Role.create({
      name: 'Coordinador de Puerta',
      slug: 'reception_staff',
      description: 'Equipo de recepción asignado únicamente a escanear tickets en puerta.',
      permissions: [
        permMap.get('scanner:access')!,
        permMap.get('events:view')!,
      ],
      isSystem: false,
    });

    // 3. Usuarios con referencia a Roles
    const defaultPassword = 'AllStar2026!';

    const users = await User.create([
      {
        fullName: 'Zamyr Pedreros',
        email: 'zamyr@allstarticket.com',
        password: defaultPassword,
        roleId: adminRole._id,
        role: 'admin',
        referralCode: 'zamyr',
        phone: '+57 300 123 4567',
        isActive: true,
      },
      {
        fullName: 'Andrea Gómez',
        email: 'andrea.gomez@allstarticket.com',
        password: defaultPassword,
        roleId: leaderRole._id,
        role: 'leader',
        referralCode: 'andrea',
        phone: '+57 311 987 6543',
        isActive: true,
      },
      {
        fullName: 'Carlos Mendoza',
        email: 'carlos.m@allstarticket.com',
        password: defaultPassword,
        roleId: partnerRole._id,
        role: 'partner',
        referralCode: 'carlos',
        phone: '+1 786 555 0192',
        isActive: true,
      },
      {
        fullName: 'Sofía Valenzuela',
        email: 'sofia.v@allstarticket.com',
        password: defaultPassword,
        roleId: partnerRole._id,
        role: 'partner',
        referralCode: 'sofia',
        phone: '+52 55 4123 8899',
        isActive: true,
      },
    ]);

    const zamyrUser = users[0];
    const andreaUser = users[1];
    const carlosUser = users[2];

    // 4. Evento Principal
    const eventDate = new Date();
    eventDate.setDate(eventDate.getDate() + 30);
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

    // 5. Tipos de Ticket
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

    // 6. Muestra de Tickets
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
    console.log(`   - ${permissions.length} Permisos creados en la colección 'permissions'`);
    console.log(`   - 4 Roles creados en la colección 'roles' (Admin, Líder, Socio, Coordinador Puerta)`);
    console.log(`   - 4 Usuarios con roles dinámicos asignados (Contraseña: ${defaultPassword})`);
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
