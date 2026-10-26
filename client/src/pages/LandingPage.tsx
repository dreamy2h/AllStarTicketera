import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  AlertCircle,
  Award,
} from 'lucide-react';
import { api } from '../services/api.js';
import { EventItem, TicketTypeItem, TicketItem } from '../types/index.js';
import { BoardingPass } from '../components/BoardingPass.js';

export const LandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref') || '';

  const [event, setEvent] = useState<EventItem | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [referrer, setReferrer] = useState<{ id: string; fullName: string; referralCode: string } | null>(null);
  const [stats, setStats] = useState<{ registeredCount: number; capacityLimit: number | null; isSoldOut: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Success state with created ticket
  const [createdTicket, setCreatedTicket] = useState<TicketItem | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getEventBySlug(slug, refCode);
        setEvent(data.event);
        setTicketTypes(data.ticketTypes);
        setReferrer(data.referrer || null);
        setStats(data.stats);

        // Pre-select first ticket type (usually Free / General)
        if (data.ticketTypes.length > 0) {
          setSelectedTicketTypeId(data.ticketTypes[0]._id);
        }
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el evento');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [slug, refCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!attendeeName.trim() || !attendeeEmail.trim() || !selectedTicketTypeId || !event) {
      setFormError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.registerTicket({
        eventId: event._id,
        ticketTypeId: selectedTicketTypeId,
        attendeeName: attendeeName.trim(),
        attendeeEmail: attendeeEmail.trim(),
        attendeePhone: attendeePhone.trim(),
        referralCode: refCode || undefined,
      });

      setCreatedTicket(res.ticket);

      // Celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#d4af37', '#f3e5ab', '#10b981', '#ffffff'],
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al completar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-12 h-12 border-4 border-allstar-gold/30 border-t-allstar-gold rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold font-luxury text-white">Preparando tu experiencia...</h2>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 max-w-md mx-auto">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold font-luxury text-white mb-2">Evento No Encontrado</h2>
        <p className="text-slate-400 text-sm mb-6">
          El evento que buscas no está disponible o el enlace ha expirado.
        </p>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl bg-allstar-gold text-black font-bold text-sm shadow-gold"
        >
          Explorar Eventos Disponibles
        </Link>
      </div>
    );
  }

  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Registration Success View with Boarding Pass */}
      {createdTicket ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="text-center max-w-xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>¡Registro Confirmado con Éxito!</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-luxury text-white">
              Tu Pase de Abordaje Oficial
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              Descárgalo como imagen de alta resolución o ábrelo directamente en tu WhatsApp para tenerlo listo al llegar.
            </p>
          </div>

          {/* Boarding Pass Component */}
          <BoardingPass ticket={createdTicket} showActions={true} />

          <div className="text-center pt-4">
            <button
              onClick={() => {
                setCreatedTicket(null);
                setAttendeeName('');
                setAttendeeEmail('');
                setAttendeePhone('');
              }}
              className="text-xs text-slate-400 hover:text-allstar-gold underline transition-colors"
            >
              ← Registrar a otro invitado
            </button>
          </div>
        </div>
      ) : (
        /* Event Hero + Registration Form */
        <div className="space-y-10">
          {/* Host Referrer Banner */}
          {referrer && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-sky-950/60 border border-sky-500/40 flex items-center justify-between flex-wrap gap-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 font-bold text-sm">
                  {referrer.fullName.charAt(0)}
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 block font-bold">
                    Invitación VIP Exclusiva de tu Socio Anfitrión:
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {referrer.fullName} <span className="text-xs font-mono text-sky-300">(@{referrer.referralCode})</span>
                  </span>
                </div>
              </div>

              <div className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 text-xs font-semibold">
                Pase de Cortesía Activado
              </div>
            </div>
          )}

          {/* Hero Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-allstar-gold/15 border border-allstar-gold/30 text-allstar-gold text-xs font-mono font-bold tracking-widest uppercase">
              <Compass className="w-3.5 h-3.5" />
              <span>Experiencia de Liderazgo & Estilo de Vida</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-luxury text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300 pt-2">
              <div className="flex items-center space-x-1.5 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-allstar-gold" />
                <span className="capitalize">{formattedDate}</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/10">
                <Clock className="w-4 h-4 text-allstar-gold" />
                <span>{formattedTime} HRS</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-white/[0.04] px-3.5 py-1.5 rounded-xl border border-white/10">
                <MapPin className="w-4 h-4 text-allstar-gold" />
                <span>{event.venueName} • {event.city}</span>
              </div>
            </div>
          </div>

          {/* Guest Leaders Section */}
          {event.guestLeaders && event.guestLeaders.length > 0 && (
            <div className="card-luxury rounded-3xl p-6 sm:p-8 border border-allstar-gold/25">
              <div className="text-center mb-6">
                <span className="text-[11px] font-mono text-allstar-gold uppercase tracking-[0.2em] font-bold block mb-1">
                  EXPOSITORES CONFIRMADOS
                </span>
                <h3 className="text-xl font-bold font-luxury text-white">Líderes de la Industria & Cruceros</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {event.guestLeaders.map((leader, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center space-x-3 hover:border-allstar-gold/40 transition-colors"
                  >
                    <div className="p-2.5 rounded-xl bg-allstar-gold/15 text-allstar-gold border border-allstar-gold/30">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">{leader}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Líder Invitado</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Registration Form Card */}
          <div className="max-w-xl mx-auto card-luxury rounded-3xl p-6 sm:p-8 border border-allstar-gold/30 shadow-gold">
            <div className="text-center mb-6">
              <span className="text-[11px] font-mono text-allstar-gold uppercase tracking-widest font-bold block mb-1">
                REGISTRO OFICIAL
              </span>
              <h2 className="text-2xl font-bold font-luxury text-white">Asegura tu Pase de Abordaje</h2>
              <p className="text-xs text-slate-400 mt-1">
                Ingreso con código QR digital intransferible en puerta.
              </p>
            </div>

            {stats?.isSoldOut ? (
              <div className="p-6 rounded-2xl bg-rose-500/20 border border-rose-500 text-center space-y-2">
                <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Aforo Completo</h3>
                <p className="text-xs text-slate-300">
                  Lo sentimos, se ha alcanzado la capacidad máxima de este evento.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Attendee Name */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-semibold">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Ej: Laura Sofía Daniels"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold transition-colors"
                  />
                </div>

                {/* Attendee Email */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-semibold">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="laura@ejemplo.com"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold transition-colors"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recibirás tu pase de abordaje y QR por correo transaccional.
                  </p>
                </div>

                {/* Attendee WhatsApp */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1.5 font-semibold">
                    WhatsApp / Móvil (Recomendado)
                  </label>
                  <input
                    type="tel"
                    value={attendeePhone}
                    onChange={(e) => setAttendeePhone(e.target.value)}
                    placeholder="+57 300 123 4567"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold transition-colors"
                  />
                </div>

                {/* Ticket Types Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                    Selecciona tu Tipo de Entrada *
                  </label>
                  <div className="space-y-2">
                    {ticketTypes.map((type) => (
                      <label
                        key={type._id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                          selectedTicketTypeId === type._id
                            ? 'bg-allstar-gold/15 border-allstar-gold shadow-gold text-white'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="ticketType"
                            value={type._id}
                            checked={selectedTicketTypeId === type._id}
                            onChange={() => setSelectedTicketTypeId(type._id)}
                            className="text-allstar-gold focus:ring-allstar-gold"
                          />
                          <div>
                            <span className="font-semibold text-sm block">{type.name}</span>
                            <span className="text-[11px] text-slate-400 block">
                              Acceso al auditorio y validación rápida
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-allstar-gold font-mono">
                            {type.price === 0 ? 'GRATIS' : `$${type.price} USD`}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-allstar-gold via-amber-500 to-allstar-gold text-black font-extrabold text-base uppercase tracking-wider shadow-gold hover:opacity-95 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-5 h-5 text-black" />
                    <span>
                      {isSubmitting ? 'Generando Pase de Abordaje...' : 'Confirmar Registro & Obtener Pase'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 text-center pt-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Acceso verificado por AllStar Ticket Platform</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
