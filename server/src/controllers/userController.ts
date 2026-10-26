import { Request, Response } from 'express';
import { User, Permission, UserRole } from '../models/User.js';
import { Ticket } from '../models/Ticket.js';

export const getPartners = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, status } = req.query;

    const query: any = {};

    if (role && typeof role === 'string' && role !== 'all') {
      query.role = role;
    }

    if (status && typeof status === 'string' && status !== 'all') {
      query.isActive = status === 'active';
    }

    if (search && typeof search === 'string') {
      const term = search.trim();
      query.$or = [
        { fullName: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { referralCode: { $regex: term, $options: 'i' } },
        { phone: { $regex: term, $options: 'i' } },
      ];
    }

    const partners = await User.find(query).sort({ createdAt: -1 });

    // Aggregate stats per partner (total invited and checked in)
    const partnersWithStats = await Promise.all(
      partners.map(async (partner) => {
        const totalInvited = await Ticket.countDocuments({
          invitedByUserId: partner._id,
          status: { $ne: 'cancelled' },
        });

        const totalCheckedIn = await Ticket.countDocuments({
          invitedByUserId: partner._id,
          status: 'checked_in',
        });

        return {
          id: partner._id,
          _id: partner._id,
          fullName: partner.fullName,
          email: partner.email,
          role: partner.role,
          permissions: partner.permissions,
          referralCode: partner.referralCode,
          phone: partner.phone,
          isActive: partner.isActive,
          createdAt: partner.createdAt,
          stats: {
            totalInvited,
            totalCheckedIn,
          },
        };
      })
    );

    res.json({ success: true, partners: partnersWithStats });
  } catch (error) {
    console.error('Error al obtener socios/usuarios:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createPartner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, referralCode, phone, role, permissions, password } = req.body;

    if (!fullName || !email || !referralCode) {
      res.status(400).json({
        success: false,
        message: 'Nombre, email y código de referido son obligatorios.',
      });
      return;
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado.' });
      return;
    }

    const existingCode = await User.findOne({ referralCode: referralCode.toLowerCase().trim() });
    if (existingCode) {
      res.status(400).json({ success: false, message: 'El código de referido ya está en uso por otro socio.' });
      return;
    }

    const partnerRole: UserRole = role || 'partner';

    // Assign standard default permissions based on role if none provided
    let partnerPermissions: Permission[] = [];
    if (Array.isArray(permissions) && permissions.length > 0) {
      partnerPermissions = permissions;
    } else {
      if (partnerRole === 'admin') {
        partnerPermissions = [
          'invite_prospects',
          'manage_partners',
          'create_events',
          'view_metrics',
          'door_scanner',
        ];
      } else if (partnerRole === 'leader') {
        partnerPermissions = [
          'invite_prospects',
          'manage_partners',
          'view_metrics',
          'door_scanner',
        ];
      } else {
        partnerPermissions = ['invite_prospects'];
      }
    }

    // Default password if not provided
    const userPassword = password && password.trim().length >= 6 ? password.trim() : 'AllStar2026!';

    const partner = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      referralCode: referralCode.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      role: partnerRole,
      permissions: partnerPermissions,
      password: userPassword,
      isActive: true,
    });

    await partner.save();

    res.status(201).json({
      success: true,
      message: `Socio "${partner.fullName}" creado exitosamente. Contraseña asignada: ${userPassword}`,
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        role: partner.role,
        permissions: partner.permissions,
        referralCode: partner.referralCode,
        phone: partner.phone,
        isActive: partner.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error al crear socio:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al crear socio' });
  }
};

export const updatePartner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, phone, role, permissions, isActive, password } = req.body;

    const partner = await User.findById(id);
    if (!partner) {
      res.status(404).json({ success: false, message: 'Socio no encontrado.' });
      return;
    }

    if (fullName) partner.fullName = fullName.trim();
    if (phone !== undefined) partner.phone = phone.trim();
    if (role) partner.role = role;
    if (Array.isArray(permissions)) partner.permissions = permissions;
    if (typeof isActive === 'boolean') partner.isActive = isActive;
    if (password && password.trim().length >= 6) {
      partner.password = password.trim();
    }

    await partner.save();

    res.json({
      success: true,
      message: 'Información del socio actualizada correctamente.',
      partner: {
        id: partner._id,
        fullName: partner.fullName,
        email: partner.email,
        role: partner.role,
        permissions: partner.permissions,
        referralCode: partner.referralCode,
        phone: partner.phone,
        isActive: partner.isActive,
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar socio:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al actualizar socio' });
  }
};

export const checkReferralCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const user = await User.findOne({ referralCode: code.trim().toLowerCase(), isActive: true });

    if (!user) {
      res.status(404).json({ success: false, message: 'Código de referido no encontrado o inactivo.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        referralCode: user.referralCode,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error al verificar código de referido:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
