import { Request, Response } from 'express';
import { Rank } from '../models/Rank.js';
import { User } from '../models/User.js';

export const getRanks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ranks = await Rank.find().sort({ level: -1 });
    res.json({ success: true, ranks });
  } catch (error: any) {
    console.error('Error al obtener rangos:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

export const createRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, slug, level, color, badgeText, description, isActive } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'El nombre del rango es obligatorio.' });
      return;
    }

    const cleanName = name.trim();
    const cleanSlug = (slug || cleanName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const existingName = await Rank.findOne({ name: cleanName });
    if (existingName) {
      res.status(400).json({ success: false, message: `Ya existe un rango con el nombre "${cleanName}".` });
      return;
    }

    const existingSlug = await Rank.findOne({ slug: cleanSlug });
    if (existingSlug) {
      res.status(400).json({ success: false, message: `Ya existe un rango con el slug "${cleanSlug}".` });
      return;
    }

    const rank = new Rank({
      name: cleanName,
      slug: cleanSlug,
      level: typeof level === 'number' ? level : 1,
      color: color || '#f59e0b',
      badgeText: badgeText ? badgeText.trim().toUpperCase() : '',
      description: description ? description.trim() : '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    await rank.save();

    res.status(201).json({
      success: true,
      message: `Rango "${rank.name}" creado exitosamente.`,
      rank,
    });
  } catch (error: any) {
    console.error('Error al crear rango:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al crear rango' });
  }
};

export const updateRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, slug, level, color, badgeText, description, isActive } = req.body;

    const rank = await Rank.findById(id);
    if (!rank) {
      res.status(404).json({ success: false, message: 'Rango no encontrado.' });
      return;
    }

    if (name && name.trim()) {
      const cleanName = name.trim();
      const existingName = await Rank.findOne({ name: cleanName, _id: { $ne: id } });
      if (existingName) {
        res.status(400).json({ success: false, message: `Ya existe otro rango con el nombre "${cleanName}".` });
        return;
      }
      rank.name = cleanName;
    }

    if (slug && slug.trim()) {
      const cleanSlug = slug
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const existingSlug = await Rank.findOne({ slug: cleanSlug, _id: { $ne: id } });
      if (existingSlug) {
        res.status(400).json({ success: false, message: `Ya existe otro rango con el slug "${cleanSlug}".` });
        return;
      }
      rank.slug = cleanSlug;
    }

    if (typeof level === 'number') rank.level = level;
    if (color && typeof color === 'string') rank.color = color.trim();
    if (badgeText !== undefined) rank.badgeText = badgeText.trim().toUpperCase();
    if (description !== undefined) rank.description = description.trim();
    if (typeof isActive === 'boolean') rank.isActive = isActive;

    await rank.save();

    // Also update cached rank name on users assigned to this rank
    if (name) {
      await User.updateMany({ rankId: rank._id }, { rank: rank.name });
    }

    res.json({
      success: true,
      message: `Rango "${rank.name}" actualizado exitosamente.`,
      rank,
    });
  } catch (error: any) {
    console.error('Error al actualizar rango:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al actualizar rango' });
  }
};

export const deleteRank = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const rank = await Rank.findById(id);
    if (!rank) {
      res.status(404).json({ success: false, message: 'Rango no encontrado.' });
      return;
    }

    // Unlink users from this rank
    await User.updateMany({ rankId: rank._id }, { $set: { rankId: null, rank: '' } });

    await Rank.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Rango "${rank.name}" eliminado correctamente.`,
    });
  } catch (error: any) {
    console.error('Error al eliminar rango:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al eliminar rango' });
  }
};
