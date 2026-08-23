/**
 * @archivo lib/demo-role-context.tsx
 * @descripcion Utilidad, proveedor o fuente de datos compartida por las pantallas.
 */
import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import { type DemoRole } from "@/constants/brand";

type DemoRoleContextValue = {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  activeQrToken: string | null;
  setActiveQrToken: (token: string | null) => void;
};

const DemoRoleContext = createContext<DemoRoleContextValue | null>(null);

/**
 * Implementa la operación DemoRoleProvider dentro de este módulo.
 */
export function DemoRoleProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<DemoRole>("alumno");
  const [activeQrToken, setActiveQrToken] = useState<string | null>(null);
  const value = useMemo(() => ({ role, setRole, activeQrToken, setActiveQrToken }), [activeQrToken, role]);

  return <DemoRoleContext.Provider value={value}>{children}</DemoRoleContext.Provider>;
}

/**
 * Expone el hook useDemoRole y encapsula su estado o comportamiento reutilizable.
 */
export function useDemoRole() {
  const context = useContext(DemoRoleContext);
  if (!context) {
    throw new Error("useDemoRole debe utilizarse dentro de DemoRoleProvider");
  }
  return context;
}
