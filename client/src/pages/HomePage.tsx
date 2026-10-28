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
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api.js';
import { EventItem } from '../types/index.js';
import { useTheme } from '../context/ThemeContext.js';

export const HomePage: React.FC = () => {
  const { logoSrc } = useTheme();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const list = await api.getEvents();
        setEvents(list);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-allstar-gold text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
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
            href="#eventos"
            className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-sm shadow-gold active:scale-95 transition-all"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Eventos Disponibles</span>
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

      {/* Active Events Section */}
      <div id="eventos" className="space-y-6 scroll-mt-24">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-luxury text-slate-900 dark:text-white">Eventos Activos</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selecciona un evento para ver su landing pública o probar referidos</p>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">Cargando eventos...</div>
        ) : events.length === 0 ? (
          <div className="p-8 card-luxury rounded-2xl text-center text-slate-500 dark:text-slate-400">
            No hay eventos activos registrados.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((event) => {
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
