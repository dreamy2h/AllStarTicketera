import { Request, Response } from 'express';
import { User } from '../models/User.js';
import { Role } from '../models/Role.js';
import { Rank } from '../models/Rank.js';
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
        { rank: { $regex: term, $options: 'i' } },
      ];
    }

    const partners = await User.find(query)
      .populate({
        path: 'roleId',
        populate: { path: 'permissions' },
      })
      .populate('rankId')
      .sort({ createdAt: -1 });

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

        const roleObj = partner.roleId as any;
        const rankObj = partner.rankId as any;

        return {
          id: partner._id,
          _id: partner._id,
          fullName: partner.fullName,
          email: partner.email,
          role: partner.role,
          roleId: roleObj?._id,
          roleName: roleObj?.name || partner.role,
          permissions: roleObj?.permissions || [],
          referralCode: partner.referralCode,
          phone: partner.phone,
          rankId: rankObj?._id || null,
          rank: rankObj?.name || partner.rank || '',
          rankBadge: rankObj?.badgeText || '',
          rankColor: rankObj?.color || '',
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
    const { fullName, email, referralCode, phone, role, roleId, rankId, password } = req.body;

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

    // Resolve Role model
    let targetRoleId = roleId;
    let targetRoleSlug = role || 'partner';

    if (roleId) {
      const foundRole = await Role.findById(roleId);
      if (foundRole) {
        targetRoleSlug = foundRole.slug;
      }
    } else {
      const foundRole = await Role.findOne({ slug: targetRoleSlug });
      if (foundRole) {
        targetRoleId = foundRole._id;
      }
    }

    // Resolve Rank model if specified
    let targetRankId = null;
    let targetRankName = '';
    if (rankId) {
      const foundRank = await Rank.findById(rankId);
      if (foundRank) {
        targetRankId = foundRank._id;
        targetRankName = foundRank.name;
      }
    }

    const userPassword = password && password.trim().length >= 6 ? password.trim() : 'AllStar2026!';

    const partner = new User({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      referralCode: referralCode.toLowerCase().trim(),
      phone: phone ? phone.trim() : '',
      role: targetRoleSlug,
      roleId: targetRoleId,
      rankId: targetRankId,
      rank: targetRankName,
      password: userPassword,
      isActive: true,
    });

    await partner.save();

    const populated = await User.findById(partner._id)
      .populate({
        path: 'roleId',
        populate: { path: 'permissions' },
      })
      .populate('rankId');

    res.status(201).json({
      success: true,
      message: `Socio "${partner.fullName}" creado exitosamente. Contraseña asignada: ${userPassword}`,
      partner: populated,
    });
  } catch (error: any) {
    console.error('Error al crear socio:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al crear socio' });
  }
};

export const updatePartner = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, email, referralCode, phone, role, roleId, rankId, isActive, password } = req.body;

    const partner = await User.findById(id);
    if (!partner) {
      res.status(404).json({ success: false, message: 'Socio no encontrado.' });
      return;
    }

    if (fullName) partner.fullName = fullName.trim();

    // Update and validate Email
    if (email && email.toLowerCase().trim() !== partner.email) {
      const cleanEmail = email.toLowerCase().trim();
      const existingEmail = await User.findOne({ email: cleanEmail, _id: { $ne: id } });
      if (existingEmail) {
        res.status(400).json({ success: false, message: 'El correo electrónico ya está registrado por otro socio.' });
        return;
      }
      partner.email = cleanEmail;
    }

    // Update and validate Referral Code
    if (referralCode && referralCode.toLowerCase().trim() !== partner.referralCode) {
      const cleanCode = referralCode.toLowerCase().trim();
      const existingCode = await User.findOne({ referralCode: cleanCode, _id: { $ne: id } });
      if (existingCode) {
        res.status(400).json({ success: false, message: 'El código de referido ya está en uso por otro socio.' });
        return;
      }
      partner.referralCode = cleanCode;
    }

    if (phone !== undefined) partner.phone = phone.trim();

    if (roleId) {
      partner.roleId = roleId;
      const foundRole = await Role.findById(roleId);
      if (foundRole) partner.role = foundRole.slug;
    } else if (role) {
      partner.role = role;
      const foundRole = await Role.findOne({ slug: role });
      if (foundRole) partner.roleId = foundRole._id;
    }

    // Update Rank
    if (rankId !== undefined) {
      if (rankId) {
        const foundRank = await Rank.findById(rankId);
        if (foundRank) {
          partner.rankId = foundRank._id as any;
          partner.rank = foundRank.name;
        } else {
          partner.rankId = null as any;
          partner.rank = '';
        }
      } else {
        partner.rankId = null as any;
        partner.rank = '';
      }
    }

    if (typeof isActive === 'boolean') partner.isActive = isActive;
    if (password && password.trim().length >= 6) {
      partner.password = password.trim();
    }

    await partner.save();

    const populated = await User.findById(partner._id)
      .populate({
        path: 'roleId',
        populate: { path: 'permissions' },
      })
      .populate('rankId');

    res.json({
      success: true,
      message: 'Información del socio actualizada correctamente.',
      partner: populated,
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
