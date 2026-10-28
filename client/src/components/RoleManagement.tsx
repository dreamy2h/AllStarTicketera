import React, { useState, useEffect } from 'react';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Lock,
  Sparkles,
  AlertCircle,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { RoleItem, PermissionItem, CreateRolePayload } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

export const RoleManagement: React.FC = () => {
  const { canManageRoles } = useAuth();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, PermissionItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);

  // Form states for creating role
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [rolesData, permsData] = await Promise.all([
        api.getRoles(),
        api.getPermissions(),
      ]);
      setRoles(rolesData);
      setPermissions(permsData.permissions);
      setGroupedPermissions(permsData.grouped);
    } catch (err: any) {
      console.error('Error al cargar roles y permisos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9_-]/g, '_')
      .replace(/^_+|_+$/g, '');
    setSlug(autoSlug);
  };

  const handleToggleCreatePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!name.trim() || !slug.trim()) {
      setModalError('Nombre y slug del rol son obligatorios.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload: CreateRolePayload = {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
        permissions: selectedPermissions,
      };

      const res = await api.createRole(payload);
      setSuccessBanner(res.message);
      setShowCreateModal(false);

      setName('');
      setSlug('');
      setDescription('');
      setSelectedPermissions([]);

      fetchData();
      setTimeout(() => setSuccessBanner(null), 5000);
    } catch (err: any) {
      setModalError(err.message || 'Error al crear rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    try {
      setIsSubmitting(true);
      // Extract IDs from permissions
      const permissionIds = editingRole.permissions.map((p) =>
        typeof p === 'object' ? p._id : p
      );

      await api.updateRole(editingRole._id, {
        name: editingRole.name,
        description: editingRole.description,
        permissions: permissionIds,
      });

      setEditingRole(null);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar permisos del rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role: RoleItem) => {
    if (!window.confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) return;

    try {
      await api.deleteRole(role._id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar rol');
    }
  };

  if (!canManageRoles) {
    return (
      <div className="card-luxury rounded-3xl p-8 text-center max-w-lg mx-auto border border-rose-500/30">
        <Lock className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold font-luxury text-white">Acceso Restringido</h3>
        <p className="text-xs text-slate-400 mt-2">
          Se requiere el permiso <strong className="text-rose-300">"roles:manage"</strong> para administrar roles y permisos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-allstar-gold uppercase tracking-wider font-bold">
              SEGURIDAD & ROLES DINÁMICOS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-luxury text-white">
            Matriz de Roles y Permisos (RBAC)
          </h2>
          <p className="text-xs text-slate-400">
            Define roles personalizados y asigna permisos sin modificar una sola línea de código fuente.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 active:scale-95 transition-all w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Rol</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Roles Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-3 py-12 text-center text-slate-400">
            Cargando roles y permisos desde MongoDB...
          </div>
        ) : (
          roles.map((role) => {
            const rolePermIds = role.permissions.map((p) => (typeof p === 'object' ? p._id : p));

            return (
              <div
                key={role._id}
                className="card-luxury rounded-3xl p-6 border border-white/10 hover:border-allstar-gold/40 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-allstar-gold/15 text-allstar-gold font-bold">
                      slug: {role.slug}
                    </span>
                    {role.isSystem ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        Sistema
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-allstar-gold" />
                      <span>{role.name}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {role.description || 'Sin descripción asignada.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-300 pt-1">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span>
                      <strong>{role.userCount || 0}</strong> usuarios con este rol
                    </span>
                  </div>

                  {/* Permissions count & pills */}
                  <div className="pt-2 border-t border-white/10">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-mono uppercase text-[10px] text-slate-400">
                        Permisos ({role.permissions.length} de {permissions.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                      {role.permissions.map((p, idx) => {
                        const permObj = typeof p === 'object' ? p : permissions.find((item) => item._id === p);
                        return (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-slate-300 font-mono"
                          >
                            {permObj ? permObj.name : 'Permiso'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setEditingRole({ ...role })}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-allstar-gold" />
                    <span>Configurar Permisos del Rol</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Crear Nuevo Rol */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-allstar-navy-800 rounded-3xl border border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-allstar-navy-900 border-b border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-allstar-gold" />
                <h3 className="font-bold text-white text-base">Crear Nuevo Rol en MongoDB</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                    Nombre del Rol *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Líder Regional Diamante"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-allstar-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                    Slug Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="lider_regional"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-allstar-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                  Descripción del Rol
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué responsabilidades tiene este rol en el equipo"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-allstar-gold"
                />
              </div>

              {/* Dynamic Permissions Grouped By Category */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                  Asignar Permisos por Categoría:
                </label>

                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                      <span className="text-xs font-mono uppercase font-bold text-allstar-gold tracking-wider">
                        📁 {category}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {perms.map((p) => {
                          const isChecked = selectedPermissions.includes(p._id);
                          return (
                            <label
                              key={p._id}
                              className={`flex items-start space-x-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-allstar-gold/15 border-allstar-gold/40 text-white'
                                  : 'bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/10'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCreatePermission(p._id)}
                                className="mt-0.5 rounded text-allstar-gold focus:ring-allstar-gold bg-slate-800 border-slate-700"
                              />
                              <div>
                                <span className="text-xs font-bold block">{p.name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {p.code}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear Rol en MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Permisos del Rol */}
      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-allstar-navy-800 rounded-3xl border border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-allstar-navy-900 border-b border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-allstar-gold" />
                <h3 className="font-bold text-white text-base">
                  Editar Permisos de: {editingRole.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-allstar-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-1 font-semibold">
                  Descripción
                </label>
                <input
                  type="text"
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-allstar-gold"
                />
              </div>

              {/* Checkboxes per Category */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 mb-2 font-semibold">
                  Permisos Habilitados para este Rol:
                </label>

                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                      <span className="text-xs font-mono uppercase font-bold text-allstar-gold tracking-wider">
                        📁 {category}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {perms.map((p) => {
                          const currentIds = editingRole.permissions.map((item) =>
                            typeof item === 'object' ? item._id : item
                          );
                          const isChecked = currentIds.includes(p._id);

                          return (
                            <label
                              key={p._id}
                              className={`flex items-start space-x-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                                isChecked
                                  ? 'bg-allstar-gold/15 border-allstar-gold/40 text-white'
                                  : 'bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/10'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  const updated = isChecked
                                    ? currentIds.filter((id) => id !== p._id)
                                    : [...currentIds, p._id];
                                  setEditingRole({ ...editingRole, permissions: updated });
                                }}
                                className="mt-0.5 rounded text-allstar-gold focus:ring-allstar-gold bg-slate-800 border-slate-700"
                              />
                              <div>
                                <span className="text-xs font-bold block">{p.name}</span>
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {p.code}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-allstar-gold text-black font-bold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50"
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
