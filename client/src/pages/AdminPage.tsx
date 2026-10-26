import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  UserPlus,
  RefreshCw,
  AlertCircle,
  X,
  Share2,
  Users,
  BarChart3,
  Lock,
  Plus,
  UserCheck,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { api } from '../services/api.js';
import {
  EventItem,
  TicketItem,
  User as PartnerUser,
  EventStatsData,
  TicketTypeItem,
} from '../types/index.js';
import { EventStats } from '../components/EventStats.js';
import { AttendeeTable } from '../components/AttendeeTable.js';
import { ManualTicketModal } from '../components/ManualTicketModal.js';
import { BoardingPass } from '../components/BoardingPass.js';
import { PartnerManagement } from '../components/PartnerManagement.js';
import { RoleManagement } from '../components/RoleManagement.js';
import { CreateEventModal } from '../components/CreateEventModal.js';
import { Can } from '../components/Can.js';
import { useAuth } from '../context/AuthContext.js';

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'metrics' | 'partners' | 'roles' | 'my_invites'>('metrics');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [stats, setStats] = useState<EventStatsData | null>(null);
  const [attendees, setAttendees] = useState<TicketItem[]>([]);
  const [partners, setPartners] = useState<PartnerUser[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [previewTicket, setPreviewTicket] = useState<TicketItem | null>(null);

  // Load initial events and partners
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const eventsData = await api.getEvents();
        setEvents(eventsData);

        if (eventsData.length > 0) {
          setSelectedEventId(eventsData[0]._id);
        }

        if (currentUser) {
          try {
            const partnersData = await api.getPartners();
            setPartners(partnersData);
          } catch (e) {
            // Non-critical if user doesn't have partners:manage
          }
        }
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos del panel');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [currentUser]);

  // Fetch event specific data whenever selected event changes
  useEffect(() => {
    if (!selectedEventId) return;
    fetchEventData(selectedEventId);
  }, [selectedEventId]);

  const fetchEventData = async (eventId: string) => {
    try {
      setIsRefreshing(true);
      const currentEvent = events.find((e) => e._id === eventId);

      if (currentUser) {
        const [statsRes, attendeesRes, eventDetails] = await Promise.all([
          api.getEventStats(eventId).catch(() => null),
          api.getEventAttendees(eventId).catch(() => ({ attendees: [], count: 0 })),
          currentEvent ? api.getEventBySlug(currentEvent.slug).catch(() => null) : Promise.resolve(null),
        ]);

        if (statsRes) setStats(statsRes.stats);
        if (attendeesRes) setAttendees(attendeesRes.attendees);
        if (eventDetails) setTicketTypes(eventDetails.ticketTypes);
      } else {
        if (currentEvent) {
          const eventDetails = await api.getEventBySlug(currentEvent.slug);
          setTicketTypes(eventDetails.ticketTypes);
        }
      }
    } catch (err: any) {
      console.error('Error fetching event metrics:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    if (selectedEventId) {
      fetchEventData(selectedEventId);
    }
  };

  const activeEvent = events.find((e) => e._id === selectedEventId);

  // Filter attendees for "my_invites" tab
  const myAttendees = attendees.filter((t) => {
    if (!currentUser) return false;
    const ref = typeof t.invitedByUserId === 'object' ? t.invitedByUserId : null;
    return ref && ref._id === currentUser.id;
  });

  if (!currentUser) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 max-w-lg mx-auto py-12">
        <div className="w-16 h-16 rounded-3xl bg-allstar-gold/20 border-2 border-allstar-gold/40 flex items-center justify-center text-allstar-gold mb-6 shadow-gold">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold font-luxury text-white mb-3">
          Acceso Privado para Socios
        </h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          Para acceder a las métricas en tiempo real, emitir tickets para tus invitados o gestionar la estructura de socios, por favor inicia sesión con tus credenciales.
        </p>
        <Link
          to="/login"
          className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-extrabold text-sm uppercase tracking-wider shadow-gold hover:opacity-95 transition-all"
        >
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-allstar-gold/20">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-allstar-gold uppercase tracking-widest font-bold">
              PLATAFORMA PRIVADA • {currentUser.roleName || currentUser.role}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-luxury text-white">
            Panel de Control & Organización
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hola <strong className="text-white">{currentUser.fullName}</strong> (@{currentUser.referralCode}). Monitorea tus invitados y administra tu equipo.
          </p>
        </div>

        {/* Global Action Controls with Declarative <Can> guards */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Abrir Scanner en Puerta: Declarative RBAC permission */}
          <Can do="scanner:access">
            <Link
              to="/scanner"
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <QrCode className="w-4 h-4" />
              <span>Abrir Scanner</span>
            </Link>
          </Can>

          {/* Create Event Button: Declarative without manual ifs */}
          <Can do="events:create">
            <button
              onClick={() => setShowCreateEventModal(true)}
              className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Evento</span>
            </button>
          </Can>

          {/* Emit Manual Ticket Button: Available for all partners */}
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-bold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 active:scale-95 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Emitir Pase a Invitado</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors disabled:opacity-50"
            title="Refrescar métricas en vivo"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-allstar-gold' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <Can do="metrics:view">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'metrics'
                ? 'bg-allstar-gold text-black shadow-gold'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas Globales</span>
          </button>
        </Can>

        {/* Mantenedor de Socios Tab: Declarative <Can do="partners:manage"> */}
        <Can do="partners:manage">
          <button
            onClick={() => setActiveTab('partners')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'partners'
                ? 'bg-allstar-gold text-black shadow-gold'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Mantenedor de Socios</span>
          </button>
        </Can>

        {/* Roles & Permisos Tab: Declarative <Can do="roles:manage"> */}
        <Can do="roles:manage">
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roles'
                ? 'bg-allstar-gold text-black shadow-gold'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Roles & Permisos (RBAC)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-600/40 font-mono">
              MongoDB
            </span>
          </button>
        </Can>

        {/* My Invites Tab */}
        <button
          onClick={() => setActiveTab('my_invites')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'my_invites'
              ? 'bg-allstar-gold text-black shadow-gold'
              : 'text-slate-300 hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Mis Invitados Directos ({myAttendees.length})</span>
        </button>
      </div>

      {/* TAB 1: Métricas & Asistentes */}
      {activeTab === 'metrics' && (
        <div className="space-y-8">
          {activeEvent && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-allstar-gold/15 text-allstar-gold border border-allstar-gold/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-mono uppercase block">Evento Seleccionado:</span>
                  <span className="text-base font-bold text-white">{activeEvent.title}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                {events.length > 1 && (
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-allstar-gold"
                  >
                    {events.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.title} ({e.city})
                      </option>
                    ))}
                  </select>
                )}
                <a
                  href={`/eventos/${activeEvent.slug}?ref=${currentUser.referralCode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-allstar-gold hover:underline font-bold"
                >
                  Mi Enlace Personal ↗
                </a>
              </div>
            </div>
          )}

          {stats ? (
            <EventStats stats={stats} />
          ) : (
            <div className="p-8 text-center text-slate-400 card-luxury rounded-2xl">
              Cargando estadísticas del evento...
            </div>
          )}

          <div className="space-y-4">
            <h2 className="text-lg font-bold font-luxury text-white">Todos los Asistentes al Evento</h2>
            <AttendeeTable
              attendees={attendees}
              partners={partners}
              eventId={selectedEventId}
              onRefresh={handleRefresh}
              onSelectTicketForPass={(ticket) => setPreviewTicket(ticket)}
            />
          </div>
        </div>
      )}

      {/* TAB 2: Mantenedor de Socios */}
      {activeTab === 'partners' && (
        <Can do="partners:manage" fallback={<p className="text-rose-400">Acceso no autorizado.</p>}>
          <PartnerManagement />
        </Can>
      )}

      {/* TAB 3: Gestor de Roles y Permisos (MongoDB) */}
      {activeTab === 'roles' && (
        <Can do="roles:manage" fallback={<p className="text-rose-400">Acceso no autorizado.</p>}>
          <RoleManagement />
        </Can>
      )}

      {/* TAB 4: Mis Invitados Directos */}
      {activeTab === 'my_invites' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-white text-base">Tus Invitados Registrados</h3>
              <p className="text-xs text-slate-300">
                Prospectos que se inscribieron con tu código de referido <strong className="text-sky-300">@{currentUser.referralCode}</strong>.
              </p>
            </div>
            <button
              onClick={() => setShowManualModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase"
            >
              + Agregar Invitado
            </button>
          </div>

          <AttendeeTable
            attendees={myAttendees}
            partners={partners}
            eventId={selectedEventId}
            onRefresh={handleRefresh}
            onSelectTicketForPass={(ticket) => setPreviewTicket(ticket)}
          />
        </div>
      )}

      {/* Modals */}
      {showManualModal && activeEvent && (
        <ManualTicketModal
          eventId={selectedEventId}
          ticketTypes={ticketTypes}
          partners={partners.length > 0 ? partners : [currentUser]}
          onClose={() => setShowManualModal(false)}
          onSuccess={() => handleRefresh()}
        />
      )}

      {showCreateEventModal && (
        <CreateEventModal
          onClose={() => setShowCreateEventModal(false)}
          onSuccess={async () => {
            const list = await api.getEvents();
            setEvents(list);
            if (list.length > 0) setSelectedEventId(list[list.length - 1]._id);
          }}
        />
      )}

      {previewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-3xl my-8 relative">
            <button
              onClick={() => setPreviewTicket(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 border border-slate-600 transition-colors shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <BoardingPass ticket={previewTicket} showActions={true} />
          </div>
        </div>
      )}
    </div>
  );
};
