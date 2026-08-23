/**
 * @archivo components/hello-wave.tsx
 * @descripcion Componente reutilizable de interfaz para la aplicación móvil.
 */
import Animated from "react-native-reanimated";

/**
 * Implementa la operación HelloWave dentro de este módulo.
 */
export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          "50%": { transform: [{ rotate: "25deg" }] },
        },
        animationIterationCount: 4,
        animationDuration: "300ms",
      }}
    >
      👋
    </Animated.Text>
  );
}
