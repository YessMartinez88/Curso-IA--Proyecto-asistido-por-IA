/**
 * @archivo app/index.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import { Redirect, type Href } from "expo-router";

/**
 * Implementa la operación Index dentro de este módulo.
 */
export default function Index() {
  return <Redirect href={"/login" as Href} />;
}
