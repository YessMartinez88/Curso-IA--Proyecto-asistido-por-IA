/**
 * @archivo components/role-selector.tsx
 * @descripcion Componente reutilizable de interfaz para la aplicación móvil.
 */
import { Pressable, StyleSheet, Text, View } from "react-native";

import { brand, rolePresentation, type DemoRole } from "@/constants/brand";

const roles: DemoRole[] = ["alumno", "docente", "administrativo"];

/**
 * Implementa la operación RoleSelector dentro de este módulo.
 */
export function RoleSelector({ role, onChange }: { role: DemoRole; onChange: (role: DemoRole) => void }) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {roles.map((item) => {
        const selected = item === role;
        return (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            key={item}
            onPress={() => onChange(item)}
            style={({ pressed }) => [styles.item, selected && styles.itemActive, pressed && styles.pressed]}
          >
            <Text style={[styles.label, selected && styles.labelActive]}>{rolePresentation[item].label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "stretch",
    backgroundColor: brand.ice,
    borderColor: brand.silver,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  item: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    minHeight: 38,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  itemActive: {
    backgroundColor: brand.white,
    shadowColor: brand.navy,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  label: {
    color: brand.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  labelActive: {
    color: brand.navy,
  },
  pressed: {
    opacity: 0.72,
  },
});

