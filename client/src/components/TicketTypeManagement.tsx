import React, { useEffect, useState } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Loader2,
  DollarSign,
  Users,
  Ticket,
  Calendar,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { api } from '../services/api.js';
import { EventItem, TicketTypeItem } from '../types/index.js';

interface TicketTypeManagementProps {
  initialEventId?: string;
  onRefreshParent?: () => void;
}

export const TicketTypeManagement: React.FC<TicketTypeManagementProps> = ({
  initialEventId,
  onRefreshParent,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(initialEventId || '');
  const [ticketTypes, setTicketTypes] = useState<TicketTypeItem[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isLoadingTypes, setIsLoadingTypes] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingType, setEditingType] = useState<TicketTypeItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    maxQuantity: '',
    description: '',
    isActive: true,
  });

  // Load events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoadingEvents(true);
        const data = await api.getEvents();
        setEvents(data);
        if (data.length > 0) {
          const defaultId = initialEventId || data[0]._id;
          setSelectedEventId(defaultId);
        }
      } catch (err: any) {
        setActionError(err.message || 'Error al cargar eventos');
      } finally {
        setIsLoadingEvents(false);
      }
    };
    loadEvents();
  }, [initialEventId]);

  // Load ticket types whenever selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return;
    loadTicketTypes(selectedEventId);
  }, [selectedEventId]);

  const loadTicketTypes = async (eventId: string) => {
    try {
      setIsLoadingTypes(true);
      setActionError(null);
      const types = await api.getTicketTypes(eventId);
      setTicketTypes(types);
    } catch (err: any) {
      setActionError(err.message || 'Error al cargar tipos de entrada');
    } finally {
      setIsLoadingTypes(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      price: 0,
      maxQuantity: '',
      description: '',
      isActive: true,
    });
    setActionError(null);
    setShowCreateModal(true);
  };

  const openEditModal = (t: TicketTypeItem) => {
    setEditingType(t);
    setFormData({
      name: t.name,
      price: t.price,
      maxQuantity: t.maxQuantity !== null && t.maxQuantity !== undefined ? String(t.maxQuantity) : '',
      description: t.description || '',
      isActive: t.isActive !== undefined ? t.isActive : true,
    });
    setActionError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      setActionError(null);

      await api.createTicketType({
        eventId: selectedEventId,
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : null,
        description: formData.description.trim(),
        isActive: formData.isActive,
      });

      setShowCreateModal(false);
      setActionSuccess('¡Tipo de entrada creado exitosamente!');
      setTimeout(() => setActionSuccess(null), 4000);
      loadTicketTypes(selectedEventId);
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setActionError(err.message || 'Error al crear tipo de entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    try {
      setIsSubmitting(true);
      setActionError(null);

      await api.updateTicketType(editingType._id, {
        name: formData.name.trim(),
        price: Number(formData.price) || 0,
        maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : null,
        description: formData.description.trim(),
        isActive: formData.isActive,
      });

      setEditingType(null);
      setActionSuccess('¡Tipo de entrada actualizado exitosamente!');
      setTimeout(() => setActionSuccess(null), 4000);
      loadTicketTypes(selectedEventId);
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setActionError(err.message || 'Error al actualizar tipo de entrada');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el tipo de entrada "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeletingId(id);
      setActionError(null);
      await api.deleteTicketType(id);
      setActionSuccess(`Tipo de entrada "${name}" eliminado.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadTicketTypes(selectedEventId);
      if (onRefreshParent) onRefreshParent();
    } catch (err: any) {
      setActionError(err.message || 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (t: TicketTypeItem) => {
    try {
      const updatedStatus = t.isActive === false ? true : false;
      await api.updateTicketType(t._id, { isActive: updatedStatus });
      loadTicketTypes(selectedEventId);
    } catch (err: any) {
      setActionError(err.message || 'Error al cambiar estado');
    }
  };

  const selectedEvent = events.find((e) => e._id === selectedEventId);

  const totalSold = ticketTypes.reduce((acc, t) => acc + (t.ticketsSold || 0), 0);
  const totalCapacityConfigured = ticketTypes.reduce(
    (acc, t) => acc + (t.maxQuantity !== null && t.maxQuantity !== undefined ? t.maxQuantity : 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header and Event Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl card-luxury border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-allstar-gold border border-amber-500/30">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase text-amber-600 dark:text-allstar-gold tracking-widest">
                Catálogo de Entradas
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-luxury text-slate-900 dark:text-white">
              Mantenedor de Tipos de Entrada
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Configura precios, cupos máximos y accesos especiales por evento.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Event Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              disabled={isLoadingEvents}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 shadow-sm"
            >
              {events.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.title} ({e.city}) {e.status === 'cancelled' ? '[CANCELADO]' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* New Ticket Type Button */}
          <button
            onClick={openCreateModal}
            disabled={!selectedEventId}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Tipo de Entrada</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="font-bold">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="font-bold">✕</button>
        </div>
      )}

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Tipos de Entrada
            </span>
            <span className="text-2xl font-bold font-luxury text-slate-900 dark:text-white">
              {ticketTypes.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-allstar-gold">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Tickets Emitidos (Vendidos)
            </span>
            <span className="text-2xl font-bold font-luxury text-emerald-600 dark:text-emerald-400">
              {totalSold}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
              Cupo Específico Sumado
            </span>
            <span className="text-2xl font-bold font-luxury text-sky-600 dark:text-sky-400">
              {totalCapacityConfigured > 0 ? `${totalCapacityConfigured} Cupos` : 'Sin Límite'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ticket Types Table / Cards */}
      <div className="card-luxury rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Ticket className="w-4 h-4 text-amber-600 dark:text-allstar-gold" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Listado de Entradas para: <span className="text-amber-600 dark:text-allstar-gold">{selectedEvent?.title || 'Evento'}</span>
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {ticketTypes.length} {ticketTypes.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        {isLoadingTypes ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            <span className="text-xs">Cargando tipos de entrada...</span>
          </div>
        ) : ticketTypes.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <Tag className="w-8 h-8 mx-auto opacity-40 text-amber-500" />
            <p className="text-sm">No hay tipos de entrada configurados para este evento.</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-allstar-gradient text-black font-bold text-xs uppercase"
            >
              Crear Primera Entrada
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-3 px-4">Nombre de la Entrada</th>
                  <th className="py-3 px-4">Precio (USD)</th>
                  <th className="py-3 px-4">Cupo Máximo</th>
                  <th className="py-3 px-4">Vendidos / Disponibles</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {ticketTypes.map((t) => {
                  const sold = t.ticketsSold || 0;
                  const max = t.maxQuantity;
                  const isSoldOut = max !== null && max !== undefined && sold >= max;
                  const pct = max ? Math.min(100, Math.round((sold / max) * 100)) : 0;

                  return (
                    <tr
                      key={t._id}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Name & Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {t.name}
                        </div>
                        {t.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {t.description}
                          </div>
                        )}
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        {t.price === 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[11px]">
                            Gratis ($0)
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-allstar-gold">
                            ${t.price} USD
                          </span>
                        )}
                      </td>

                      {/* Max Quantity */}
                      <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                        {max !== null && max !== undefined ? (
                          <span>{max} cupos</span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">Ilimitado</span>
                        )}
                      </td>

                      {/* Sold / Available */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 font-mono">
                            <span className="font-bold text-slate-900 dark:text-white">{sold} emitidos</span>
                            {max && (
                              <span className="text-slate-400 text-[11px]">
                                / {max - sold} libres
                              </span>
                            )}
                          </div>
                          {max && (
                            <div className="w-32 bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  pct >= 90
                                    ? 'bg-rose-500'
                                    : pct >= 60
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleActive(t)}
                          className="flex items-center space-x-1.5 focus:outline-none"
                          title="Hacer clic para activar/desactivar"
                        >
                          {t.isActive !== false ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                              Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                              Inactivo
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10 dark:hover:bg-slate-700 transition-colors"
                            title="Editar tipo de entrada"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id, t.name)}
                            disabled={deletingId === t._id}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30 dark:hover:bg-rose-500/25 transition-colors disabled:opacity-50"
                            title="Eliminar tipo de entrada"
                          >
                            {deletingId === t._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Crear Tipo de Entrada */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-allstar-navy-800 rounded-3xl border border-amber-500/30 dark:border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 dark:bg-allstar-navy-900 border-b border-slate-200 dark:border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Crear Nuevo Tipo de Entrada
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Nombre de la Entrada *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Invitado General, Pase VIP, Socio Calificado..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Precio (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">0 = Gratuito</span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Cupo Máximo (Opcional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Sin límite"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Vacío = Ilimitado</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Descripción / Beneficios
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Incluye acceso a sala principal y cóctel de bienvenida..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveNew"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="isActiveNew" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Activar de inmediato para registro
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Editar Tipo de Entrada */}
      {editingType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-allstar-navy-800 rounded-3xl border border-amber-500/30 dark:border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 dark:bg-allstar-navy-900 border-b border-slate-200 dark:border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit2 className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Editar Tipo de Entrada
                </h3>
              </div>
              <button
                onClick={() => setEditingType(null)}
                className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Nombre de la Entrada *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Precio (USD) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Cupo Máximo
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Sin límite"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Descripción / Beneficios
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveEdit"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <label htmlFor="isActiveEdit" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Entrada Activa para el Registro
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingType(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-bold uppercase transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Actualizar Entrada'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
