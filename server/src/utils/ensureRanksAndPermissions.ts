import mongoose from 'mongoose';
import { Permission } from '../models/Permission.js';
import { Role } from '../models/Role.js';
import { Rank } from '../models/Rank.js';

export const initialRanks = [
  {
    name: 'Marketing Director',
    slug: 'marketing-director',
    level: 1,
    color: '#84cc16', // Light Green
    badgeText: 'MD',
    description: 'Primer rango de liderazgo en la organización All Star.',
  },
  {
    name: 'Senior Mkt. Director',
    slug: 'senior-mkt-director',
    level: 2,
    color: '#0ea5e9', // Sky Blue
    badgeText: 'SMD',
    description: 'Segundo rango de liderazgo y expansión de equipo.',
  },
  {
    name: 'Regional Director',
    slug: 'regional-director',
    level: 3,
    color: '#f97316', // Orange-yellow
    badgeText: 'RD',
    description: 'Líder regional con estructura sólida y volumen creciente.',
  },
  {
    name: 'National Director',
    slug: 'national-director',
    level: 4,
    color: '#ef4444', // Red
    badgeText: 'ND',
    description: 'Liderazgo nacional con presencia en múltiples ciudades.',
  },
  {
    name: 'International Director',
    slug: 'international-director',
    level: 5,
    color: '#a855f7', // Light Purple
    badgeText: 'ID',
    description: 'Líder internacional con equipo de impacto global.',
  },
  {
    name: 'Executive Director',
    slug: 'executive-director',
    level: 6,
    color: '#475569', // Dark Gray
    badgeText: 'ED',
    description: 'Dirección ejecutiva de alto nivel en la organización.',
  },
  {
    name: 'Board of Directors',
    slug: 'board-of-directors',
    level: 7,
    color: '#2563eb', // Royal Blue
    badgeText: 'BOD',
    description: 'Miembro de la Junta Directiva (Board of Directors).',
  },
  {
    name: 'Ambassador B.O.D.',
    slug: 'ambassador-bod',
    level: 8,
    color: '#ea580c', // Orange
    badgeText: 'AMB',
    description: 'Embajador Board of Directors.',
  },
  {
    name: 'Premier Ambassador B.O.D.',
    slug: 'premier-ambassador-bod',
    level: 9,
    color: '#7c3aed', // Purple
    badgeText: 'PAMB',
    description: 'Primer Embajador Premier Board of Directors.',
  },
  {
    name: 'Global Ambassador B.O.D.',
    slug: 'global-ambassador-bod',
    level: 10,
    color: '#b91c1c', // Crimson / Dark Red
    badgeText: 'GAMB',
    description: 'Embajador Global Board of Directors.',
  },
  {
    name: 'Royal Ambassador B.O.D.',
    slug: 'royal-ambassador-bod',
    level: 11,
    color: '#15803d', // Green
    badgeText: 'RAMB',
    description: 'Máximo rango de honor y liderazgo: Royal Ambassador B.O.D.',
  },
];

export const ensureRanksAndPermissions = async (): Promise<void> => {
  try {
    // 1. Ensure permission 'ranks:manage' exists
    let ranksPerm = await Permission.findOne({ code: 'ranks:manage' });
    if (!ranksPerm) {
      ranksPerm = await Permission.create({
        code: 'ranks:manage',
        name: 'Gestionar Rangos Corporativos',
        category: 'Socios',
        description: 'Permite crear, ordenar y editar los rangos y títulos de liderazgo de los socios.',
      });
      console.log('✅ Permiso "ranks:manage" creado en la base de datos.');
    }

    // 2. Ensure admin role has 'ranks:manage' permission
    const adminRoles = await Role.find({
      $or: [{ slug: 'admin' }, { isSystem: true, name: /admin/i }],
    });

    for (const role of adminRoles) {
      const permIds = (role.permissions || []).map((p: any) => p.toString());
      if (!permIds.includes(ranksPerm._id.toString())) {
        role.permissions.push(ranksPerm._id as any);
        await role.save();
        console.log(`✅ Permiso "ranks:manage" asociado al rol ${role.name}.`);
      }
    }

    // 3. Ensure ranks exist in Rank collection
    const ranksCount = await Rank.countDocuments();
    if (ranksCount === 0) {
      console.log('🌱 Sembrando los 11 rangos corporativos iniciales...');
      await Rank.insertMany(initialRanks);
      console.log('✅ Rangos corporativos sembrados exitosamente.');
    }
  } catch (error) {
    console.error('⚠️ Error al asegurar rangos y permisos:', error);
  }
};
