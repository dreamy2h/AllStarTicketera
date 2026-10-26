import mongoose, { Document, Schema, Types } from 'mongoose';

export type TicketStatus = 'registered' | 'checked_in' | 'cancelled';

export interface ITicket extends Document {
  ticketCode: string;
  eventId: Types.ObjectId;
  ticketTypeId: Types.ObjectId;
  invitedByUserId?: Types.ObjectId | null;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  status: TicketStatus;
  checkedInAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    ticketCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'El evento es obligatorio'],
      index: true,
    },
    ticketTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'TicketType',
      required: [true, 'El tipo de entrada es obligatorio'],
    },
    invitedByUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    attendeeName: {
      type: String,
      required: [true, 'El nombre del asistente es obligatorio'],
      trim: true,
    },
    attendeeEmail: {
      type: String,
      required: [true, 'El correo del asistente es obligatorio'],
      lowercase: true,
      trim: true,
      index: true,
    },
    attendeePhone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['registered', 'checked_in', 'cancelled'],
      default: 'registered',
      index: true,
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Ticket = mongoose.model<ITicket>('Ticket', TicketSchema);
