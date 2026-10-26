import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { JWT_SECRET, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const generateToken = (userId: string): string => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
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

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

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

    res.json({
      success: true,
      message: `¡Bienvenido(a), ${user.fullName}!`,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
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
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        referralCode: user.referralCode,
        phone: user.phone,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al consultar sesión' });
  }
};
