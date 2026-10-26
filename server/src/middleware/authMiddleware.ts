import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser, Permission, UserRole } from '../models/User.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'allstar_super_secret_jwt_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
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
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No autorizado. Se requiere iniciar sesión.',
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'El usuario asociado a este token no existe o ha sido desactivado.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token de sesión inválido o expirado.',
    });
  }
};

// Middleware to enforce specific permissions
export const requirePermission = (permission: Permission) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Autenticación requerida.' });
      return;
    }

    // Admins have all permissions implicitly
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user has explicit permission
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Acceso denegado. No tienes el permiso requerido: "${permission}".`,
    });
  };
};

// Middleware to enforce specific roles
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Autenticación requerida.' });
      return;
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Acceso restringido para el rol "${req.user.role}".`,
    });
  };
};
