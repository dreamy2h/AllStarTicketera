import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IRole } from './Role.js';
import { IPermission } from './Permission.js';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  roleId?: Types.ObjectId | IRole;
  role: string; // Slug representation: 'admin' | 'leader' | 'partner' or custom
  customPermissions?: Types.ObjectId[] | IPermission[];
  referralCode: string;
  phone?: string;
  rankId?: Types.ObjectId | any;
  rank?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'El nombre completo es obligatorio'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      minlength: 6,
      select: false,
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      index: true,
    },
    role: {
      type: String,
      default: 'partner',
      trim: true,
      index: true,
    },
    customPermissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
    referralCode: {
      type: String,
      required: [true, 'El código de referido es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    rankId: {
      type: Schema.Types.ObjectId,
      ref: 'Rank',
      index: true,
      default: null,
    },
    rank: {
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

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
