import {
  EventItem,
  TicketTypeItem,
  TicketItem,
  EventStatsData,
  RegisterTicketPayload,
  CheckInResponse,
  User,
  CreatePartnerPayload,
  UpdatePartnerPayload,
  CreateEventPayload,
  RoleItem,
  PermissionItem,
  CreateRolePayload,
  UpdateRolePayload,
  RankItem,
  CreateRankPayload,
  UpdateRankPayload,
} from '../types/index.js';

const API_BASE = '/api';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('allstar_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Sesión no válida');
    return data;
  },

  // Eventos
  async getEvents(): Promise<EventItem[]> {
    const res = await fetch(`${API_BASE}/events`);
    const data = await res.json();
    return data.events || [];
  },

  async getEventBySlug(
    slug: string,
    ref?: string
  ): Promise<{
    event: EventItem;
    ticketTypes: TicketTypeItem[];
    referrer?: { id: string; fullName: string; referralCode: string } | null;
    stats: { registeredCount: number; capacityLimit: number | null; isSoldOut: boolean };
  }> {
    const url = ref
      ? `${API_BASE}/events/${slug}?ref=${encodeURIComponent(ref)}`
      : `${API_BASE}/events/${slug}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Evento no encontrado');
    }
    return res.json();
  },

  async createEvent(payload: CreateEventPayload): Promise<{ event: EventItem }> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear evento');
    return data;
  },

  async getEventStats(eventId: string): Promise<{ event: any; stats: EventStatsData }> {
    const res = await fetch(`${API_BASE}/events/${eventId}/stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener estadísticas');
    return res.json();
  },

  async getEventAttendees(
    eventId: string,
    params?: { search?: string; partnerId?: string; status?: string }
  ): Promise<{ attendees: TicketItem[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.partnerId) searchParams.set('partnerId', params.partnerId);
    if (params?.status) searchParams.set('status', params.status);

    const res = await fetch(`${API_BASE}/events/${eventId}/attendees?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Error al listar asistentes');
    return res.json();
  },

  getExportCsvUrl(eventId: string): string {
    return `${API_BASE}/events/${eventId}/export`;
  },

  // Tickets
  async registerTicket(payload: RegisterTicketPayload): Promise<{ ticket: TicketItem; message: string }> {
    const res = await fetch(`${API_BASE}/tickets/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Error al procesar registro');
    }
    return data;
  },

  async checkInTicket(ticketCode: string): Promise<CheckInResponse> {
    const res = await fetch(`${API_BASE}/tickets/check-in`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticketCode }),
    });
    const data = await res.json();
    return data;
  },

  async getTicketByCode(code: string): Promise<{ ticket: TicketItem }> {
    const res = await fetch(`${API_BASE}/tickets/${code}`);
    if (!res.ok) throw new Error('Ticket no encontrado');
    return res.json();
  },

  // Mantenedor de Socios / Usuarios
  async getPartners(params?: { search?: string; role?: string; status?: string }): Promise<User[]> {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role) searchParams.set('role', params.role);
    if (params?.status) searchParams.set('status', params.status);

    const res = await fetch(`${API_BASE}/users?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.partners || [];
  },

  async createPartner(payload: CreatePartnerPayload): Promise<{ partner: User; message: string }> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al registrar socio');
    return data;
  },

  async updatePartner(id: string, payload: UpdatePartnerPayload): Promise<{ partner: User; message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar socio');
    return data;
  },

  async checkReferral(code: string): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/users/referral/${code}`);
    if (!res.ok) throw new Error('Código no válido');
    return res.json();
  },

  // Roles & Permisos Dinámicos
  async getRoles(): Promise<RoleItem[]> {
    const res = await fetch(`${API_BASE}/roles`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.roles || [];
  },

  async getPermissions(): Promise<{ permissions: PermissionItem[]; grouped: Record<string, PermissionItem[]> }> {
    const res = await fetch(`${API_BASE}/roles/permissions`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data;
  },

  async createRole(payload: CreateRolePayload): Promise<{ role: RoleItem; message: string }> {
    const res = await fetch(`${API_BASE}/roles`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear rol');
    return data;
  },

  async updateRole(id: string, payload: UpdateRolePayload): Promise<{ role: RoleItem; message: string }> {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar rol');
    return data;
  },

  async deleteRole(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/roles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar rol');
    return data;
  },

  // Mantenedor de Rangos Corporativos
  async getRanks(): Promise<RankItem[]> {
    const res = await fetch(`${API_BASE}/ranks`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.ranks || [];
  },

  async createRank(payload: CreateRankPayload): Promise<{ rank: RankItem; message: string }> {
    const res = await fetch(`${API_BASE}/ranks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al crear rango');
    return data;
  },

  async updateRank(id: string, payload: UpdateRankPayload): Promise<{ rank: RankItem; message: string }> {
    const res = await fetch(`${API_BASE}/ranks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar rango');
    return data;
  },

  async deleteRank(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/ranks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar rango');
    return data;
  },
};
