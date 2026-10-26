import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  slug: string;
  eventDate: Date;
  city: string;
  venueName: string;
  venueAddress: string;
  guestLeaders: string[];
  capacityLimit?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'El título del evento es obligatorio'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'El slug del evento es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    eventDate: {
      type: Date,
      required: [true, 'La fecha del evento es obligatoria'],
    },
    city: {
      type: String,
      required: [true, 'La ciudad es obligatoria'],
      trim: true,
    },
    venueName: {
      type: String,
      required: [true, 'El nombre del recinto/hotel es obligatorio'],
      trim: true,
    },
    venueAddress: {
      type: String,
      required: [true, 'La dirección del recinto es obligatoria'],
      trim: true,
    },
    guestLeaders: {
      type: [String],
      default: [],
    },
    capacityLimit: {
      type: Number,
      default: null,
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

export const Event = mongoose.model<IEvent>('Event', EventSchema);
