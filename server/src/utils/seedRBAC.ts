import mongoose from 'mongoose';
import { Permission } from '../models/Permission.js';
import { Role } from '../models/Role.js';
import { User } from '../models/User.js';

async function seedRBAC() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/allstar_tickets';
  await mongoose.connect(uri);
  console.log('Connected to Mongo');

  const permCount = await Permission.countDocuments();
  if (permCount === 0) {
    console.log('Seeding permissions...');
    const permissionsData = [
      { code: 'events:view', name: 'Ver Eventos y Aforos', category: 'Eventos', description: 'Permite visualizar detalles y cupos de eventos.' },
      { code: 'events:create', name: 'Crear y Editar Eventos', category: 'Eventos', description: 'Permite publicar cumbres y configurar entradas.' },
      { code: 'prospects:invite', name: 'Invitar Prospectos & Pases', category: 'Socios', description: 'Permite usar el enlace de referido propio y emitir pases.' },
      { code: 'partners:manage', name: 'Gestionar y Crear Socios', category: 'Socios', description: 'Acceso al mantenedor de socios para dar de alta miembros.' },
      { code: 'roles:manage', name: 'Gestionar Roles y Permisos', category: 'Seguridad', description: 'Crear nuevos roles y configurar matriz de permisos.' },
      { code: 'scanner:access', name: 'Operar Scanner en Puerta', category: 'Acceso', description: 'Validar códigos QR de entrada y hacer check-in.' },
      { code: 'metrics:view', name: 'Ver Analíticas Globales', category: 'Reportes', description: 'Ver estadísticas en tiempo real y tabla de liderazgo.' },
      { code: 'metrics:export', name: 'Exportar Lista a CSV/Excel', category: 'Reportes', description: 'Descargar listado completo de asistentes.' }
    ];
    await Permission.insertMany(permissionsData);
  }

  const allPerms = await Permission.find();
  const permMap = new Map();
  allPerms.forEach(p => permMap.set(p.code, p._id));

  const roleCount = await Role.countDocuments();
  if (roleCount === 0) {
    console.log('Seeding roles...');
    const adminRole = await Role.create({
      name: 'Administrador Global',
      slug: 'admin',
      description: 'Acceso total sin restricciones a todas las funciones y configuraciones.',
      permissions: allPerms.map(p => p._id),
      isSystem: true
    });

    const leaderRole = await Role.create({
      name: 'Líder de Organización',
      slug: 'leader',
      description: 'Líder con permiso para registrar socios en su equipo, invitar y ver métricas.',
      permissions: [
        permMap.get('prospects:invite'),
        permMap.get('partners:manage'),
        permMap.get('events:view'),
        permMap.get('scanner:access'),
        permMap.get('metrics:view'),
        permMap.get('metrics:export')
      ].filter(Boolean),
      isSystem: true
    });

    const partnerRole = await Role.create({
      name: 'Socio Promotor',
      slug: 'partner',
      description: 'Socio general enfocado en prospección, invitaciones y emisión de pases.',
      permissions: [
        permMap.get('prospects:invite'),
        permMap.get('events:view')
      ].filter(Boolean),
      isSystem: true
    });

    await Role.create({
      name: 'Coordinador de Puerta',
      slug: 'reception_staff',
      description: 'Equipo de recepción asignado únicamente a escanear tickets en puerta.',
      permissions: [
        permMap.get('scanner:access'),
        permMap.get('events:view')
      ].filter(Boolean),
      isSystem: false
    });

    // Link existing users to roles
    await User.updateOne({ email: 'zamyr@allstarticket.com' }, { roleId: adminRole._id, role: 'admin' });
    await User.updateOne({ email: 'andrea.gomez@allstarticket.com' }, { roleId: leaderRole._id, role: 'leader' });
    await User.updateOne({ email: 'carlos.m@allstarticket.com' }, { roleId: partnerRole._id, role: 'partner' });
    await User.updateOne({ email: 'sofia.v@allstarticket.com' }, { roleId: partnerRole._id, role: 'partner' });
  }

  console.log('RBAC Seed Complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seedRBAC().catch(err => {
  console.error(err);
  process.exit(1);
});
