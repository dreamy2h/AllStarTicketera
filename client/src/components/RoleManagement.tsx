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
          <div className="col-span-3 py-12 text-center text-slate-500 dark:text-slate-400">
            Cargando roles y permisos desde MongoDB...
          </div>
        ) : (
          roles.map((role) => {
            const rolePermIds = role.permissions.map((p) => (typeof p === 'object' ? p._id : p));

            return (
              <div
                key={role._id}
                className="card-luxury rounded-3xl p-6 border border-amber-500/25 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-allstar-gold/40 transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md bg-white dark:bg-slate-900/80"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-allstar-gold border border-amber-500/30 font-bold">
                      slug: {role.slug}
                    </span>
                    {role.isSystem ? (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/90 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 font-semibold shadow-xs">
                        Sistema
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar rol"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-amber-600 dark:text-allstar-gold shrink-0" />
                      <span>{role.name}</span>
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {role.description || 'Sin descripción asignada.'}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                    <Users className="w-3.5 h-3.5 text-amber-600 dark:text-sky-400" />
                    <span>
                      <strong className="text-slate-900 dark:text-white">{role.userCount || 0}</strong> usuarios con este rol
                    </span>
                  </div>

                  {/* Permissions count & pills */}
                  <div className="pt-2 border-t border-slate-200/80 dark:border-white/10">
                    <div className="flex justify-between items-center text-xs mb-2">
                      <span className="font-mono uppercase text-[10px] text-amber-800 dark:text-slate-400 font-bold tracking-wider">
                        Permisos ({role.permissions.length} de {permissions.length})
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {role.permissions.map((p, idx) => {
                        const permObj = typeof p === 'object' ? p : permissions.find((item) => item._id === p);
                        return (
                          <span
                            key={idx}
                            className="text-[10.5px] px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 text-amber-950 dark:bg-slate-800/90 dark:border-white/10 dark:text-slate-200 font-medium transition-colors shadow-2xs"
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
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-50 via-amber-100/50 to-orange-50 hover:from-amber-100 hover:to-orange-100 active:scale-[0.99] border border-amber-300/80 hover:border-amber-400 text-amber-950 font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-600 dark:text-allstar-gold" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-allstar-navy-800 rounded-3xl border border-amber-500/30 dark:border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 dark:bg-allstar-navy-900 border-b border-slate-200 dark:border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Crear Nuevo Rol en MongoDB</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Nombre del Rol *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: Líder Regional Diamante"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                    Slug Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    placeholder="lider_regional"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white font-mono placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Descripción del Rol
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe qué responsabilidades tiene este rol en el equipo"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                />
              </div>

              {/* Dynamic Permissions Grouped By Category */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                  Asignar Permisos por Categoría:
                </label>

                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-2">
                      <span className="text-xs font-mono uppercase font-bold text-amber-700 dark:text-allstar-gold tracking-wider">
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
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:bg-allstar-gold/15 dark:border-allstar-gold/40 dark:text-white font-semibold shadow-xs'
                                  : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-white/10'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleCreatePermission(p._id)}
                                className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                              />
                              <div>
                                <span className="text-xs font-bold block">{p.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
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

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50 transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-allstar-navy-800 rounded-3xl border border-amber-500/30 dark:border-allstar-gold/40 shadow-2xl overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-50 dark:bg-allstar-navy-900 border-b border-slate-200 dark:border-allstar-gold/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-600 dark:text-allstar-gold" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Editar Permisos de: {editingRole.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingRole(null)}
                className="p-1.5 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-700 dark:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Nombre del Rol
                </label>
                <input
                  type="text"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Descripción
                </label>
                <input
                  type="text"
                  value={editingRole.description || ''}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-allstar-gold"
                />
              </div>

              {/* Checkboxes per Category */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-semibold">
                  Permisos Habilitados para este Rol:
                </label>

                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-2">
                      <span className="text-xs font-mono uppercase font-bold text-amber-700 dark:text-allstar-gold tracking-wider">
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
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-950 dark:bg-allstar-gold/15 dark:border-allstar-gold/40 dark:text-white font-semibold shadow-xs'
                                  : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:border-amber-300 dark:hover:border-white/10'
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
                                className="mt-0.5 rounded text-amber-500 focus:ring-amber-500 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                              />
                              <div>
                                <span className="text-xs font-bold block">{p.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
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

              <div className="pt-4 flex justify-end space-x-3 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingRole(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-allstar-gradient text-black font-extrabold text-xs uppercase tracking-wider shadow-gold hover:opacity-95 disabled:opacity-50 transition-all"
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
