import React, { useState } from 'react';
import { Calendar, Plus, Trash2, X, Sparkles, AlertCircle, Compass } from 'lucide-react';
import { CreateEventPayload } from '../types/index.js';
import { api } from '../services/api.js';

interface CreateEventModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('18:30');
  const [city, setCity] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [guestLeadersInput, setGuestLeadersInput] = useState('');
  const [capacityLimit, setCapacityLimit] = useState<string>('300');

  // Ticket tiers
  const [ticketTypes, setTicketTypes] = useState<
    { name: string; price: number; maxQuantity?: number }[]
  >([
    { name: 'Invitado General (Free Pass)', price: 0, maxQuantity: 200 },
    { name: 'Socio Calificado', price: 20, maxQuantity: 80 },
    { name: 'VIP Boarding & Coctel Exclusivo', price: 60, maxQuantity: 20 },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      const generated = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  const handleAddTicketType = () => {
    setTicketTypes([...ticketTypes, { name: 'Nueva Entrada', price: 0 }]);
  };

  const handleRemoveTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleTicketTypeChange = (
    index: number,
    field: 'name' | 'price' | 'maxQuantity',
    value: string | number
  ) => {
    const updated = [...ticketTypes];
    (updated[index] as any)[field] = value;
    setTicketTypes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !slug.trim() || !eventDate || !city.trim() || !venueName.trim() || !venueAddress.trim()) {
      setError('Por favor completa todos los campos requeridos del evento.');
      return;
    }

    try {
      setIsLoading(true);

      const combinedDateTime = new Date(`${eventDate}T${eventTime || '18:00'}:00`);

      const guestLeaders = guestLeadersInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload: CreateEventPayload = {
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        eventDate: combinedDateTime.toISOString(),
        city: city.trim(),
        venueName: venueName.trim(),
        venueAddress: venueAddress.trim(),
        guestLeaders,
        capacityLimit: capacityLimit ? parseInt(capacityLimit, 10) : null,
        ticketTypes: ticketTypes.map((t) => ({
          name: t.name.trim(),
          price: Number(t.price) || 0,
          maxQuantity: t.maxQuantity ? Number(t.maxQuantity) : undefined,
        })),
      };

      await api.createEvent(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear evento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-allstar-navy-800 rounded-3xl border border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-allstar-navy-900 border-b border-allstar-gold/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-allstar-gold" />
            <h3 className="font-bold text-white text-base">Crear Nueva Cumbre / Evento</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title & Slug */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
              Título del Evento *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ej: Cumbre de Liderazgo & Cruceros Medellín 2026"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
              URL Amigable (Slug) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                /eventos/
              </span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="cumbre-medellin-2026"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-24 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-allstar-gold"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                Fecha del Evento *
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                Hora de Inicio (24h) *
              </label>
              <input
                type="time"
                required
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
              />
            </div>
          </div>

          {/* City & Venue */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                Ciudad / Destino *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Medellín / El Poblado"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                Recinto / Hotel *
              </label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Hotel InterContinental Gran Salón"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
              Dirección Completa del Recinto *
            </label>
            <input
              type="text"
              required
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="Calle 16 # 28-51, Variante Las Palmas"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
            />
          </div>

          {/* Guest Leaders & Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                Líderes Expositores (Separados por coma)
              </label>
              <input
                type="text"
                value={guestLeadersInput}
                onChange={(e) => setGuestLeadersInput(e.target.value)}
                placeholder="Zamyr Pedreros, Camila Ríos, Roberto Silva"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                Aforo Máx. (Cupos)
              </label>
              <input
                type="number"
                min="1"
                value={capacityLimit}
                onChange={(e) => setCapacityLimit(e.target.value)}
                placeholder="300"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
              />
            </div>
          </div>

          {/* Ticket Types Config */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Tipos de Entrada Disponibles
              </label>
              <button
                type="button"
                onClick={handleAddTicketType}
                className="text-xs text-allstar-gold hover:underline flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Tipo</span>
              </button>
            </div>

            <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-white/10">
              {ticketTypes.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={t.name}
                    onChange={(e) => handleTicketTypeChange(idx, 'name', e.target.value)}
                    placeholder="Nombre de entrada"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-allstar-gold"
                  />
                  <div className="relative w-24">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      min="0"
                      value={t.price}
                      onChange={(e) => handleTicketTypeChange(idx, 'price', e.target.value)}
                      placeholder="Precio"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-5 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-allstar-gold font-mono"
                    />
                  </div>
                  {ticketTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTicketType(idx)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 transition-colors"
                      title="Eliminar tipo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-bold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Publicando...' : 'Publicar Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
