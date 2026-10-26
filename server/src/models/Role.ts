import mongoose, { Document, Schema, Types } from 'mongoose';
import { IPermission } from './Permission.js';

export interface IRole extends Document {
  name: string;
  slug: string;
  description: string;
  permissions: Types.ObjectId[] | IPermission[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: [true, 'El nombre del rol es obligatorio'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'El slug del rol es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
