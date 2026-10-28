import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { IRole } from '../models/Role.js';
import { IPermission } from '../models/Permission.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'allstar_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  userPermissions?: string[];
}

export const protect = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.query && typeof req.query.token === 'string') {
      token = req.query.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No autorizado. Se requiere iniciar sesión.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id)
      .populate({
        path: 'roleId',
        populate: { path: 'permissions' },
      })
      .populate('customPermissions');

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'El usuario no existe o ha sido desactivado.',
      });
      return;
    }

    // Aggregate all permission codes from role and custom permissions
    const permissionSet = new Set<string>();

    if (user.roleId && typeof user.roleId === 'object') {
      const role = user.roleId as IRole;
      if (Array.isArray(role.permissions)) {
        role.permissions.forEach((perm: any) => {
          if (perm && perm.code) {
            permissionSet.add(perm.code.toLowerCase());
          }
        });
      }
    }

    if (Array.isArray(user.customPermissions)) {
      user.customPermissions.forEach((perm: any) => {
        if (perm && perm.code) {
          permissionSet.add(perm.code.toLowerCase());
        }
      });
    }

    req.user = user;
    req.userPermissions = Array.from(permissionSet);
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token de sesión inválido o expirado.',
    });
  }
};

// Declarative middleware to protect endpoints by dynamic permission code
export const requirePermission = (permissionCode: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Autenticación requerida.' });
      return;
    }

    // Admins have all permissions implicitly
    if (req.user.role === 'admin' || req.userPermissions?.includes('*')) {
      return next();
    }

    const targetCode = permissionCode.toLowerCase();
    if (req.userPermissions && req.userPermissions.includes(targetCode)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Acceso denegado. Se requiere el permiso: "${permissionCode}".`,
      requiredPermission: permissionCode,
    });
  };
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Autenticación requerida.' });
      return;
    }

    if (req.user.role === 'admin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Acceso restringido para el rol "${req.user.role}".`,
    });
  };
};
