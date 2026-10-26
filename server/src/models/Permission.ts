import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  code: string;
  name: string;
  category: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    code: {
      type: String,
      required: [true, 'El código del permiso es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'El nombre legible del permiso es obligatorio'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'La categoría del permiso es obligatoria'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Permission = mongoose.model<IPermission>('Permission', PermissionSchema);
