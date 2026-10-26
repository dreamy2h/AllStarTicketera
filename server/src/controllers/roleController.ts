import { Request, Response } from 'express';
import { Role } from '../models/Role.js';
import { Permission } from '../models/Permission.js';
import { User } from '../models/User.js';

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await Role.find().populate('permissions').sort({ isSystem: -1, name: 1 });

    // Aggregate user counts per role
    const rolesWithCounts = await Promise.all(
      roles.map(async (role) => {
        const userCount = await User.countDocuments({
          $or: [{ roleId: role._id }, { role: role.slug }],
        });
        return {
          _id: role._id,
          name: role.name,
          slug: role.slug,
          description: role.description,
          permissions: role.permissions,
          isSystem: role.isSystem,
          userCount,
        };
      })
    );

    res.json({ success: true, roles: rolesWithCounts });
  } catch (error) {
    console.error('Error al listar roles:', error);
    res.status(500).json({ success: false, message: 'Error interno al consultar roles' });
  }
};

export const getPermissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const permissions = await Permission.find().sort({ category: 1, name: 1 });

    // Group permissions by category for visual tables
    const grouped = permissions.reduce((acc: Record<string, any[]>, perm) => {
      const cat = perm.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(perm);
      return acc;
    }, {});

    res.json({
      success: true,
      permissions,
      grouped,
    });
  } catch (error) {
    console.error('Error al listar permisos:', error);
    res.status(500).json({ success: false, message: 'Error interno al consultar permisos' });
  }
};

export const createRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, description, permissions } = req.body;

    if (!name || !slug) {
      res.status(400).json({ success: false, message: 'El nombre y slug del rol son obligatorios.' });
      return;
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');

    const existing = await Role.findOne({ slug: cleanSlug });
    if (existing) {
      res.status(400).json({ success: false, message: `Ya existe un rol con el slug "${cleanSlug}".` });
      return;
    }

    const role = new Role({
      name: name.trim(),
      slug: cleanSlug,
      description: description || '',
      permissions: Array.isArray(permissions) ? permissions : [],
      isSystem: false,
    });

    await role.save();
    const populated = await Role.findById(role._id).populate('permissions');

    res.status(201).json({
      success: true,
      message: `Rol "${role.name}" creado exitosamente.`,
      role: populated,
    });
  } catch (error: any) {
    console.error('Error al crear rol:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al crear rol' });
  }
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      res.status(404).json({ success: false, message: 'Rol no encontrado' });
      return;
    }

    if (name) role.name = name.trim();
    if (description !== undefined) role.description = description.trim();
    if (Array.isArray(permissions)) role.permissions = permissions;

    await role.save();
    const populated = await Role.findById(role._id).populate('permissions');

    res.json({
      success: true,
      message: `Rol "${role.name}" actualizado correctamente.`,
      role: populated,
    });
  } catch (error: any) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al actualizar rol' });
  }
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);

    if (!role) {
      res.status(404).json({ success: false, message: 'Rol no encontrado' });
      return;
    }

    if (role.isSystem) {
      res.status(400).json({
        success: false,
        message: 'No se pueden eliminar los roles base del sistema (Admin, Líder, Socio).',
      });
      return;
    }

    // Check if any users are assigned to this role
    const assignedUsers = await User.countDocuments({
      $or: [{ roleId: role._id }, { role: role.slug }],
    });

    if (assignedUsers > 0) {
      res.status(400).json({
        success: false,
        message: `No se puede eliminar este rol porque tiene ${assignedUsers} socios asignados. Reasígnalos primero.`,
      });
      return;
    }

    await Role.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Rol "${role.name}" eliminado correctamente.`,
    });
  } catch (error) {
    console.error('Error al eliminar rol:', error);
    res.status(500).json({ success: false, message: 'Error interno al eliminar rol' });
  }
};
