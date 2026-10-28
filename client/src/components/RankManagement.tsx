import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { RankItem, CreateRankPayload, UpdateRankPayload } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const RankManagement: React.FC = () => {
  const { canManageRanks } = useAuth();
  const [ranks, setRanks] = useState<RankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRank, setEditingRank] = useState<RankItem | null>(null);

  // Form states for creating rank
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [level, setLevel] = useState<number>(1);
  const [color, setColor] = useState('#84cc16');
  const [badgeText, setBadgeText] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Form states for editing rank
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editLevel, setEditLevel] = useState<number>(1);
  const [editColor, setEditColor] = useState('#84cc16');
  const [editBadgeText, setEditBadgeText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Preset Colors matching official leadership badges
  const presetColors = [
    { label: 'Verde Lima', hex: '#84cc16' },
    { label: 'Azul Cielo', hex: '#0ea5e9' },
    { label: 'Naranjo', hex: '#f97316' },
    { label: 'Rojo', hex: '#ef4444' },
    { label: 'Púrpura Claro', hex: '#a855f7' },
    { label: 'Gris Ejecutivo', hex: '#475569' },
    { label: 'Azul Real', hex: '#2563eb' },
    { label: 'Naranjo Intenso', hex: '#ea580c' },
    { label: 'Púrpura Profundo', hex: '#7c3aed' },
    { label: 'Rojo Oscuro', hex: '#b91c1c' },
    { label: 'Verde Esmeralda', hex: '#15803d' },
    { label: 'Dorado All Star', hex: '#eab308' },
  ];

  const fetchRanks = async () => {
    try {
      setIsLoading(true);
      const data = await api.getRanks();
      setRanks(data);
    } catch (err: any) {
      console.error('Error fetching ranks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanks();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(autoSlug);
  };

  const handleResetCreateForm = () => {
    setName('');
    setSlug('');
    setLevel(ranks.length > 0 ? Math.max(...ranks.map((r) => r.level)) + 1 : 1);
    setColor('#84cc16');
    setBadgeText('');
    setDescription('');
    setIsActive(true);
    setModalError(null);
    setShowCreateModal(false);
  };

  const handleStartEdit = (rank: RankItem) => {
    setEditingRank(rank);
    setEditName(rank.name);
    setEditSlug(rank.slug);
    setEditLevel(rank.level);
    setEditColor(rank.color || '#84cc16');
    setEditBadgeText(rank.badgeText || '');
    setEditDescription(rank.description || '');
    setEditIsActive(rank.isActive);
    setModalError(null);
  };

  const handleResetEditForm = () => {
    setEditingRank(null);
    setModalError(null);
  };

  const handleCreateRank = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim()) {
      setModalError('El nombre del rango es obligatorio.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateRankPayload = {
        name: name.trim(),
        slug: slug.trim() || undefined,
        level: Number(level) || 1,
        color,
        badgeText: badgeText.trim().toUpperCase(),
        description: description.trim(),
        isActive,
      };

      const res = await api.createRank(payload);
      setSuccessBanner(res.message);
      handleResetCreateForm();
      fetchRanks();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      setModalError(err.message || 'Error al crear rango');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRank) return;
    setModalError(null);

    try {
      setIsSubmitting(true);
      const payload: UpdateRankPayload = {
        name: editName.trim(),
        slug: editSlug.trim(),
        level: Number(editLevel) || 1,
        color: editColor,
        badgeText: editBadgeText.trim().toUpperCase(),
        description: editDescription.trim(),
        isActive: editIsActive,
      };

      const res = await api.updateRank(editingRank._id, payload);
      setSuccessBanner(res.message);
      handleResetEditForm();
      fetchRanks();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      setModalError(err.message || 'Error al actualizar rango');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRank = async (rank: RankItem) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar el rango "${rank.name}"? Los socios que lo tengan quedarán sin rango asignado.`
    );
    if (!confirmDelete) return;

    try {
      const res = await api.deleteRank(rank._id);
      setSuccessBanner(res.message);
      fetchRanks();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar rango');
    }
  };

  if (!canManageRanks) {
    return (
      <div className="bg-white dark:bg-allstar-navy-800 rounded-3xl p-8 text-center max-w-lg mx-auto border border-rose-500/30 shadow-lg">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-xl font-bold font-luxury text-slate-900 dark:text-white">Acceso Restringido</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
          Este mantenedor está reservado para el rol de <strong className="text-rose-500">Administrador</strong> o usuarios con el permiso{' '}
          <strong className="text-amber-600 dark:text-allstar-gold">"ranks:manage"</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-allstar-navy-800 border border-slate-200 dark:border-allstar-gold/20 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
            <h2 className="text-xl font-extrabold font-luxury text-slate-900 dark:text-white">
              Catálogo de Rangos Corporativos
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Administra los títulos oficiales de liderazgo que pueden alcanzar y ostentar los socios de la organización.
          </p>
        </div>

        <button
          onClick={() => {
            handleResetCreateForm();
            setLevel(ranks.length > 0 ? Math.max(...ranks.map((r) => r.level)) + 1 : 1);
            setShowCreateModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 transition-all flex items-center justify-center space-x-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Rango</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Ranks Hierarchy Grid */}
      <div className="bg-white dark:bg-allstar-navy-800 rounded-2xl border border-slate-200 dark:border-allstar-gold/20 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-allstar-navy-900">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
            Estructura Jerárquica de Títulos ({ranks.length} Rangos)
          </span>
          <span className="text-[11px] font-mono text-amber-600 dark:text-allstar-gold font-semibold">
            Nivel 11 (Máximo) ➔ Nivel 1 (Inicial)
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto mb-3" />
            <span className="text-xs font-mono">Cargando catálogo de rangos...</span>
          </div>
        ) : ranks.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold">No hay rangos corporativos registrados.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {ranks.map((rank) => (
              <div
                key={rank._id}
                className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Rank Badge & Info */}
                <div className="flex items-center space-x-3.5">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-white text-xs shadow-md shrink-0 border border-white/20"
                    style={{ backgroundColor: rank.color || '#f59e0b' }}
                  >
                    {rank.badgeText || rank.level}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                        {rank.name}
                      </h4>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: rank.color || '#f59e0b' }}
                      >
                        Nivel {rank.level}
                      </span>
                      {!rank.isActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      <span>slug: {rank.slug}</span>
                      {rank.description && <span className="hidden md:inline">• {rank.description}</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <button
                    onClick={() => handleStartEdit(rank)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white transition-colors"
                    title="Editar rango"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRank(rank)}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:hover:bg-rose-900 dark:text-rose-400 transition-colors"
                    title="Eliminar rango"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Crear Nuevo Rango */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-allstar-navy-800 rounded-3xl border border-amber-500/30 dark:border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 dark:bg-allstar-navy-900 border-b border-slate-200 dark:border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Crear Nuevo Rango</h3>
              </div>
              <button
                onClick={handleResetCreateForm}
                className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRank} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Nombre Oficial del Rango *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ej: Marketing Director, Regional Director..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Abreviación / Badge Text
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value.toUpperCase())}
                    placeholder="Ej: MD, SMD, BOD..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white uppercase font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Nivel Jerárquico *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={level}
                    onChange={(e) => setLevel(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>
              </div>

              {/* Color Selector */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                  Color Representativo del Rango
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>

                {/* Preset Swatches */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {presetColors.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setColor(c.hex)}
                      className="w-6 h-6 rounded-lg border border-white/30 shadow-sm transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {color.toLowerCase() === c.hex.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Descripción (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre requisitos o privilegios de este rango..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleResetCreateForm}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50 transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Guardando...' : 'Crear Rango'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Modificar Rango */}
      {editingRank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-allstar-navy-800 rounded-3xl border border-amber-500/30 dark:border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 dark:bg-allstar-navy-900 border-b border-slate-200 dark:border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Modificar Rango</h3>
              </div>
              <button
                onClick={handleResetEditForm}
                className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRank} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Nombre del Rango
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Abreviación / Badge
                  </label>
                  <input
                    type="text"
                    value={editBadgeText}
                    onChange={(e) => setEditBadgeText(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white uppercase font-mono focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Nivel Jerárquico
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editLevel}
                    onChange={(e) => setEditLevel(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">
                  Color Representativo
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 dark:border-slate-700 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {presetColors.map((c) => (
                    <button
                      type="button"
                      key={c.hex}
                      onClick={() => setEditColor(c.hex)}
                      className="w-6 h-6 rounded-lg border border-white/30 shadow-sm transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: c.hex }}
                      title={c.label}
                    >
                      {editColor.toLowerCase() === c.hex.toLowerCase() && (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                />
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Estado del Rango</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {editIsActive ? 'Visible en selectores de socios' : 'Oculto para asignaciones'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editIsActive
                      ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/40'
                      : 'bg-rose-50 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/40'
                  }`}
                >
                  {editIsActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={handleResetEditForm}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50 transition-all"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
