export type UserRole = 'admin' | 'leader' | 'partner';

export type Permission =
  | 'invite_prospects'
  | 'manage_partners'
  | 'create_events'
  | 'view_metrics'
  | 'door_scanner';

export interface User {
  _id: string;
  id?: string;
  fullName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  referralCode: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
  stats?: {
    totalInvited: number;
    totalCheckedIn: number;
  };
}

export interface EventItem {
  _id: string;
  title: string;
  slug: string;
  eventDate: string;
  city: string;
  venueName: string;
  venueAddress: string;
  guestLeaders: string[];
  capacityLimit?: number | null;
  isActive: boolean;
  createdAt?: string;
}

export interface TicketTypeItem {
  _id: string;
  eventId: string;
  name: string;
  price: number;
  maxQuantity?: number | null;
}

export type TicketStatus = 'registered' | 'checked_in' | 'cancelled';

export interface TicketItem {
  _id: string;
  ticketCode: string;
  eventId: EventItem | string;
  ticketTypeId: TicketTypeItem | string;
  invitedByUserId?: User | string | null;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  status: TicketStatus;
  checkedInAt?: string | null;
  createdAt: string;
}

export interface PartnerStat {
  partnerName: string;
  referralCode: string;
  totalInvited: number;
  checkedIn: number;
}

export interface TicketTypeStat {
  typeName: string;
  total: number;
  checkedIn: number;
}

export interface EventStatsData {
  totalRegistered: number;
  checkedInCount: number;
  attendanceRate: number;
  capacityLimit: number | null;
  remainingCapacity: number | null;
  partnerLeaderboard: PartnerStat[];
  ticketTypeBreakdown: TicketTypeStat[];
}

export interface RegisterTicketPayload {
  eventId: string;
  ticketTypeId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  referralCode?: string;
}

export interface CheckInResponse {
  success: boolean;
  message: string;
  alreadyUsed?: boolean;
  checkedInAt?: string;
  ticket?: TicketItem;
}

export interface CreatePartnerPayload {
  fullName: string;
  email: string;
  referralCode: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  password?: string;
}

export interface UpdatePartnerPayload {
  fullName?: string;
  phone?: string;
  role?: UserRole;
  permissions?: Permission[];
  isActive?: boolean;
  password?: string;
}

export interface CreateEventPayload {
  title: string;
  slug: string;
  eventDate: string;
  city: string;
  venueName: string;
  venueAddress: string;
  guestLeaders: string[];
  capacityLimit?: number | null;
  ticketTypes?: { name: string; price: number; maxQuantity?: number }[];
}
