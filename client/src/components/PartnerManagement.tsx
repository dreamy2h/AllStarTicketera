import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  Check,
  Copy,
  Edit2,
  Lock,
  Sparkles,
  AlertCircle,
  X,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { User, RoleItem, CreatePartnerPayload } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const PartnerManagement: React.FC = () => {
  const { user: currentUser, canManagePartners } = useAuth();
  const [partners, setPartners] = useState<User[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<User | null>(null);

  // Form states for creating partner
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newReferralCode, setNewReferralCode] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRoleId, setNewRoleId] = useState<string>('');
  const [newPassword, setNewPassword] = useState('AllStar2026!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchPartners = async () => {
    try {
      setIsLoading(true);
      const [partnersData, rolesData] = await Promise.all([
        api.getPartners({
          search: searchTerm || undefined,
          role: selectedRole !== 'all' ? selectedRole : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        }),
        api.getRoles(),
      ]);
      setPartners(partnersData);
      setAvailableRoles(rolesData);

      if (rolesData.length > 0 && !newRoleId) {
        // Pre-select 'partner' role or first role
        const defaultRole = rolesData.find((r) => r.slug === 'partner') || rolesData[0];
        setNewRoleId(defaultRole._id);
      }
    } catch (err: any) {
      console.error('Error fetching partners and roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [searchTerm, selectedRole, selectedStatus]);

  const handleCreatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!newFullName.trim() || !newEmail.trim() || !newReferralCode.trim() || !newRoleId) {
      setModalError('Nombre, correo, código de referido y rol son obligatorios.');
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedRoleDoc = availableRoles.find((r) => r._id === newRoleId);

      const payload: CreatePartnerPayload = {
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        referralCode: newReferralCode.trim().toLowerCase(),
        phone: newPhone.trim(),
        roleId: newRoleId,
        role: selectedRoleDoc?.slug || 'partner',
        password: newPassword,
      };

      const res = await api.createPartner(payload);
      setSuccessBanner(res.message);
      setShowCreateModal(false);

      // Reset form
      setNewFullName('');
      setNewEmail('');
      setNewReferralCode('');
      setNewPhone('');
      setNewPassword('AllStar2026!');

      fetchPartners();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      setModalError(err.message || 'Error al registrar socio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    try {
      setIsSubmitting(true);
      await api.updatePartner(editingPartner._id, {
        fullName: editingPartner.fullName,
        phone: editingPartner.phone,
        roleId: editingPartner.roleId,
        role: editingPartner.role,
        isActive: editingPartner.isActive,
      });

      setEditingPartner(null);
      fetchPartners();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar socio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = (code: string) => {
    const origin = window.location.origin;
    const testLink = `${origin}/eventos/cumbre-cruceros-2026?ref=${code}`;
    navigator.clipboard.writeText(testLink);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!canManagePartners) {
    return (
      <div className="card-luxury rounded-3xl p-8 text-center max-w-lg mx-auto border border-rose-500/30">
        <Lock className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold font-luxury text-white">Acceso Restringido</h3>
        <p className="text-xs text-slate-400 mt-2">
          No tienes el permiso <strong className="text-rose-300">"partners:manage"</strong> para acceder al mantenedor de socios.
          Comunícate con un administrador o líder de tu organización.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & New Partner Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-allstar-gold uppercase tracking-wider font-bold">
              ESTRUCTURA DE EQUIPO
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-luxury text-white">
            Mantenedor de Socios
          </h2>
          <p className="text-xs text-slate-400">
            Crea nuevos socios, asigna roles desde la base de datos y gestiona los códigos de referido.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-bold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 active:scale-95 transition-all w-fit"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Socio</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card-luxury rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo, código..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-allstar-gold"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Dynamic Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-allstar-gold"
          >
            <option value="all">Todos los Roles</option>
            {availableRoles.map((r) => (
              <option key={r._id} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-allstar-gold"
          >
            <option value="all">Todos los Estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="card-luxury rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/60 border-b border-white/10 text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">Socio / Contacto</th>
                <th className="py-3 px-4 font-semibold">Código Referido</th>
                <th className="py-3 px-4 font-semibold">Rol Asignado</th>
                <th className="py-3 px-4 font-semibold text-center">Invitados</th>
                <th className="py-3 px-4 font-semibold text-center">Estado</th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Cargando lista de socios...
                  </td>
                </tr>
              ) : partners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron socios registrados.
                  </td>
                </tr>
              ) : (
                partners.map((partner) => (
                  <tr key={partner._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white flex items-center space-x-2">
                        <span>{partner.fullName}</span>
                        {partner._id === currentUser?.id && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-allstar-gold/20 text-allstar-gold font-mono">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{partner.email}</div>
                      {partner.phone && <div className="text-[11px] text-slate-500">{partner.phone}</div>}
                    </td>

                    {/* Referral Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                          @{partner.referralCode}
                        </span>
                        <button
                          onClick={() => handleCopyCode(partner.referralCode)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Copiar enlace de referido"
                        >
                          {copiedCode === partner.referralCode ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Role Display */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-allstar-gold font-mono">
                        <Shield className="w-3 h-3 text-allstar-gold" />
                        <span>{partner.roleName || partner.role}</span>
                      </span>
                    </td>

                    {/* Invited stats */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="font-bold text-white text-sm">
                        {partner.stats?.totalInvited || 0}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono">
                        {partner.stats?.totalCheckedIn || 0} check-in
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      {partner.isActive ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Activo
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setEditingPartner({ ...partner })}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Modificar rol y estado"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Nuevo Socio */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-allstar-navy-800 rounded-3xl border border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-allstar-navy-900 border-b border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-allstar-gold" />
                <h3 className="font-bold text-white text-base">Registrar Nuevo Socio</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                  Nombre Completo del Socio *
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="Ej: Gabriel Martínez"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="gabriel@allstarticket.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                    Código de Referido Único *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">@</span>
                    <input
                      type="text"
                      required
                      value={newReferralCode}
                      onChange={(e) => setNewReferralCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="gabriel"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono lowercase focus:outline-none focus:border-allstar-gold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+57 310 987 6543"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                    Rol Asignado *
                  </label>
                  <select
                    value={newRoleId}
                    onChange={(e) => setNewRoleId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold font-medium"
                  >
                    {availableRoles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name} ({r.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                  Contraseña Inicial de Acceso
                </label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-allstar-gold"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-allstar-gold to-amber-600 text-black font-bold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Socio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Rol del Socio */}
      {editingPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-allstar-navy-800 rounded-3xl border border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-allstar-navy-900 border-b border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-allstar-gold" />
                <h3 className="font-bold text-white text-base">Modificar Socio & Rol</h3>
              </div>
              <button
                onClick={() => setEditingPartner(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePartner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={editingPartner.fullName}
                  onChange={(e) => setEditingPartner({ ...editingPartner, fullName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-allstar-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                  Rol Asignado
                </label>
                <select
                  value={editingPartner.roleId || ''}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const rDoc = availableRoles.find((r) => r._id === selId);
                    setEditingPartner({
                      ...editingPartner,
                      roleId: selId,
                      role: rDoc?.slug || editingPartner.role,
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-allstar-gold"
                >
                  {availableRoles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name} ({r.slug})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active / Inactive switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-700">
                <div>
                  <span className="text-xs font-bold text-white block">Estado de la Cuenta</span>
                  <span className="text-[11px] text-slate-400">
                    {editingPartner.isActive ? 'El socio puede acceder al panel' : 'Acceso revocado temporalmente'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPartner({ ...editingPartner, isActive: !editingPartner.isActive })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    editingPartner.isActive
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {editingPartner.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-allstar-gold text-black font-bold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50"
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
