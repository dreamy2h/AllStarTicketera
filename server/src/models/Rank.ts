import mongoose, { Document, Schema } from 'mongoose';

export interface IRank extends Document {
  name: string;
  slug: string;
  level: number;
  color: string;
  badgeText?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RankSchema = new Schema<IRank>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del rango es obligatorio'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'El slug del rango es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    level: {
      type: Number,
      required: [true, 'El nivel del rango es obligatorio'],
      default: 1,
    },
    color: {
      type: String,
      default: '#f59e0b',
      trim: true,
    },
    badgeText: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Rank = mongoose.model<IRank>('Rank', RankSchema);
