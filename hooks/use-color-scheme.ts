/**
 * @archivo hooks/use-color-scheme.ts
 * @descripcion Hook reutilizable para encapsular estado o comportamiento de interfaz.
 */
import { useThemeContext } from "@/lib/theme-provider";

/**
 * Expone el hook useColorScheme y encapsula su estado o comportamiento reutilizable.
 */
export function useColorScheme() {
  return useThemeContext().colorScheme;
}
