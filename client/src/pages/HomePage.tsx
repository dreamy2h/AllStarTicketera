import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  QrCode,
  LayoutDashboard,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  Users,
  History,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { api } from '../services/api.js';
import { EventItem } from '../types/index.js';
import { useTheme } from '../context/ThemeContext.js';

export const HomePage: React.FC = () => {
  const { logoSrc } = useTheme();
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [cancelledEvents, setCancelledEvents] = useState<EventItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<'all' | 'completed' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await api.getEventsCategorized();
        setUpcomingEvents(data.upcoming || []);
        setPastEvents(data.past || []);
        setCancelledEvents(data.cancelled || []);
      } catch (err) {
        console.error('Error fetching categorized events:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filteredHistory = historyFilter === 'completed'
    ? pastEvents
    : historyFilter === 'cancelled'
    ? cancelledEvents
    : [...pastEvents, ...cancelledEvents].sort(
        (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
      );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-allstar-gold text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plataforma Premium de Eventos & Cruceros</span>
        </div>

        <div className="py-2 flex flex-col items-center justify-center">
          <img
            src={logoSrc}
            alt="All Star Team"
            className="h-24 sm:h-36 w-auto object-contain filter drop-shadow-[0_0_30px_rgba(255,170,0,0.35)] hover:scale-105 transition-transform duration-300"
          />
          <h1 className="text-xl sm:text-2xl font-bold font-luxury tracking-widest text-slate-900 dark:text-white uppercase mt-3">
            PLATAFORMA OFICIAL DE <span className="gold-gradient-text">TICKETS & EVENTOS</span>
          </h1>
        </div>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Sistema integral de registro con pases de abordaje de alta resolución, detección de socios referidores,
          scanner con cámara web en puerta y métricas de asistencia en vivo.
        </p>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a
            href="#proximos-eventos"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-sm shadow-gold active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Próximos Eventos ({upcomingEvents.length})</span>
          </a>

          <a
            href="#historial"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:border-slate-700/80 dark:text-white font-bold text-sm active:scale-95 transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Historial ({pastEvents.length + cancelledEvents.length})</span>
          </a>

          <Link
            to="/admin"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:border-slate-700/80 dark:text-white font-bold text-sm active:scale-95 transition-all shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4 text-amber-600 dark:text-allstar-gold" />
            <span>Panel de Socios & Admin</span>
          </Link>
        </div>
      </div>

      {/* SECTION 1: Próximos Eventos (Active & Upcoming only) */}
      <div id="proximos-eventos" className="space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-2xl font-bold font-luxury text-slate-900 dark:text-white">Próximos Eventos</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Eventos vigentes y disponibles para registro e invitaciones
            </p>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 w-fit">
            {upcomingEvents.length} {upcomingEvents.length === 1 ? 'evento activo' : 'eventos activos'}
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Cargando eventos...</div>
        ) : upcomingEvents.length === 0 ? (
          <div className="p-8 card-luxury rounded-2xl text-center space-y-3">
            <Calendar className="w-10 h-10 text-amber-500/50 mx-auto" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">No hay próximos eventos programados</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Actualmente no hay convocatorias abiertas. Consulta el historial a continuación para revisar las ediciones pasadas.
            </p>
            <a
              href="#historial"
              className="inline-flex items-center space-x-1.5 text-xs text-amber-600 dark:text-allstar-gold font-bold hover:underline"
            >
              <span>Ver Historial de Eventos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map((event) => {
              const eventDate = new Date(event.eventDate).toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });

              return (
                <div
                  key={event._id}
                  className="card-luxury rounded-3xl p-6 sm:p-7 border border-amber-500/30 dark:border-allstar-gold/30 hover:border-amber-500 dark:hover:border-allstar-gold transition-all duration-300 flex flex-col justify-between group shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase px-3 py-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-allstar-gold font-bold">
                        {event.city}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {event.capacityLimit ? `${event.capacityLimit} Cupos Máx` : 'Cupo Ilimitado'}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-luxury text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-allstar-gold transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-amber-600 dark:text-allstar-gold shrink-0" />
                        <span className="capitalize">{eventDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-amber-600 dark:text-allstar-gold shrink-0" />
                        <span>{event.venueName} • {event.venueAddress}</span>
                      </div>
                    </div>

                    {/* Expositores */}
                    {event.guestLeaders && event.guestLeaders.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block mb-1">
                          Líderes Invitados:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {event.guestLeaders.map((leader, i) => (
                            <span
                              key={i}
                              className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
                            >
                              {leader.split('(')[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Links & Quick Referral Testing */}
                  <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 space-y-3">
                    <Link
                      to={`/eventos/${event.slug}`}
                      className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-allstar-gradient text-black font-extrabold text-sm shadow-gold hover:opacity-95 transition-all"
                    >
                      <span>Abrir Landing de Registro</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    {/* Test Referral Links */}
                    <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1.5">
                      <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 block font-semibold">
                        Probar con Socio Referidor:
                      </span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <Link
                          to={`/eventos/${event.slug}?ref=zamyr`}
                          className="px-2 py-1 rounded bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-600/40 dark:hover:bg-sky-900 transition-colors font-mono"
                        >
                          ?ref=zamyr
                        </Link>
                        <Link
                          to={`/eventos/${event.slug}?ref=andrea`}
                          className="px-2 py-1 rounded bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-600/40 dark:hover:bg-sky-900 transition-colors font-mono"
                        >
                          ?ref=andrea
                        </Link>
                        <Link
                          to={`/eventos/${event.slug}?ref=carlos`}
                          className="px-2 py-1 rounded bg-sky-100 text-sky-800 border border-sky-300 hover:bg-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-600/40 dark:hover:bg-sky-900 transition-colors font-mono"
                        >
                          ?ref=carlos
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Historial de Eventos (Past & Cancelled) */}
      <div id="historial" className="space-y-6 scroll-mt-24 pt-8 border-t border-slate-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-2xl font-bold font-luxury text-slate-900 dark:text-white">Historial de Eventos</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registro histórico de convocatorias pasadas y eventos finalizados o cancelados
            </p>
          </div>

          {/* Filter buttons */}
          <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs font-semibold">
            <button
              onClick={() => setHistoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                historyFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Todos ({pastEvents.length + cancelledEvents.length})
            </button>
            <button
              onClick={() => setHistoryFilter('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                historyFilter === 'completed'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Finalizados ({pastEvents.length})
            </button>
            <button
              onClick={() => setHistoryFilter('cancelled')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                historyFilter === 'cancelled'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Cancelados ({cancelledEvents.length})
            </button>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-8 card-luxury rounded-2xl text-center text-slate-500 dark:text-slate-400">
            No hay eventos en este historial.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredHistory.map((event) => {
              const isEventCancelled = event.status === 'cancelled';
              const eventDate = new Date(event.eventDate).toLocaleDateString('es-ES', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={event._id}
                  className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                    isEventCancelled
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 opacity-90'
                      : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-bold">
                        {event.city}
                      </span>
                      {isEventCancelled ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 font-bold border border-rose-300 dark:border-rose-700/50">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Cancelado</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Finalizado</span>
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2">
                      {event.title}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="capitalize">{eventDate}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{event.venueName}</span>
                      </div>
                    </div>

                    {isEventCancelled && event.cancellationReason && (
                      <p className="text-[11px] text-rose-700 dark:text-rose-400 italic bg-rose-100/60 dark:bg-rose-900/20 p-2 rounded-lg border border-rose-200 dark:border-rose-800/30">
                        Motivo: {event.cancellationReason}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-200/60 dark:border-white/5">
                    <Link
                      to={`/eventos/${event.slug}`}
                      className="text-xs text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-allstar-gold font-bold flex items-center justify-between transition-colors"
                    >
                      <span>Ver ficha del evento</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-white/10">
        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-allstar-gold w-fit">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Boarding Pass de Alta Resolución</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Pase de abordaje digital diseñado con la estética de cruceros y aerolíneas de primera clase, descargable en imagen HD con `html-to-image` y listo para enviar por WhatsApp.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 w-fit">
            <QrCode className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Scanner Móvil</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Recepción en puerta rápida con cámara web/móvil, linterna integrada, sonido de confirmación y detección automática de tickets duplicados con hora exacta.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 shadow-sm space-y-2">
          <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 w-fit">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-base">Atribución de Socios & Métricas</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Seguimiento de líderes por código de referido (`?ref=zamyr`), tabla de liderazgo en vivo y exportación instantánea a Excel/CSV.
          </p>
        </div>
      </div>
    </div>
  );
};
