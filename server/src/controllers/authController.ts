import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { IRole } from '../models/Role.js';
import { JWT_SECRET, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

const extractPermissionCodes = (user: any): string[] => {
  const codes = new Set<string>();
  if (user.roleId && typeof user.roleId === 'object') {
    const role = user.roleId as IRole;
    if (Array.isArray(role.permissions)) {
      role.permissions.forEach((perm: any) => {
        if (perm && perm.code) codes.add(perm.code.toLowerCase());
      });
    }
  }
  if (Array.isArray(user.customPermissions)) {
    user.customPermissions.forEach((perm: any) => {
      if (perm && perm.code) codes.add(perm.code.toLowerCase());
    });
  }
  // Admin fallback
  if (user.role === 'admin') codes.add('*');
  return Array.from(codes);
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Por favor proporciona correo electrónico y contraseña.',
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate({
        path: 'roleId',
        populate: { path: 'permissions' },
      })
      .populate('customPermissions');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Esta cuenta ha sido desactivada. Comunícate con la administración.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas. Verifica tu correo y contraseña.',
      });
      return;
    }

    const token = generateToken(user._id.toString());
    const permissions = extractPermissionCodes(user);
    const roleObj = user.roleId as IRole | undefined;

    res.json({
      success: true,
      message: `¡Bienvenido(a), ${user.fullName}!`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        roleName: roleObj ? roleObj.name : user.role,
        roleId: roleObj?._id,
        permissions,
        referralCode: user.referralCode,
        phone: user.phone,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno al autenticar.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'No autenticado' });
      return;
    }

    const user = req.user;
    const permissions = req.userPermissions || extractPermissionCodes(user);
    const roleObj = user.roleId as IRole | undefined;

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        roleName: roleObj ? roleObj.name : user.role,
        roleId: roleObj?._id,
        permissions,
        referralCode: user.referralCode,
        phone: user.phone,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al consultar sesión' });
  }
};
