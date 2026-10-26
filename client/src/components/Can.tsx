import React from 'react';
import { useAuth } from '../context/AuthContext.js';

interface CanProps {
  do?: string;
  any?: string[];
  all?: string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente declarativo para controlar visibilidad y acciones según permisos.
 * Elimina la necesidad de llenar el código de sentencias 'if'.
 *
 * Ejemplo de uso:
 * <Can do="events:create">
 *   <button onClick={abrirModal}>+ Crear Evento</button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({
  do: permissionCode,
  any: anyCodes,
  all: allCodes,
  fallback = null,
  children,
}) => {
  const { can, canAny, canAll } = useAuth();

  let hasAccess = false;

  if (permissionCode) {
    hasAccess = can(permissionCode);
  } else if (anyCodes && anyCodes.length > 0) {
    hasAccess = canAny(anyCodes);
  } else if (allCodes && allCodes.length > 0) {
    hasAccess = canAll(allCodes);
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
