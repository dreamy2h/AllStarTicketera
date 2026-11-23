import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITicketType extends Document {
  eventId: Types.ObjectId;
  name: string;
  price: number;
  maxQuantity?: number | null;
  description?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'El evento es obligatorio'],
    },
    name: {
      type: String,
      required: [true, 'El nombre de la entrada es obligatorio'],
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    maxQuantity: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: '',
      trim: true,
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

export const TicketType = mongoose.model<ITicketType>('TicketType', TicketTypeSchema);
