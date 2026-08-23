/**
 * @archivo constants/theme.ts
 * @descripcion Constantes y configuraciones compartidas del dominio de la aplicación.
 */
/**
 * Thin re-exports so consumers don't need to know about internal theme plumbing.
 * Full implementation lives in lib/_core/theme.ts.
 */
export {
  Colors,
  Fonts,
  SchemeColors,
  ThemeColors,
  type ColorScheme,
  type ThemeColorPalette,
} from "@/lib/_core/theme";
