/**
 * @archivo lib/_core/nativewind-pressable.ts
 * @descripcion Utilidad de infraestructura base del proyecto y su entorno de ejecución.
 */
// NativeWind + Pressable: className can swallow onPress. Disable className mapping globally.
import { Pressable } from "react-native";
import { remapProps } from "nativewind";

remapProps(Pressable, { className: false });
