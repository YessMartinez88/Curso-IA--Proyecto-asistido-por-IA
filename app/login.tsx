/**
 * @archivo app/login.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand, type DemoRole, rolePresentation } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";

const demoRoles: DemoRole[] = ["alumno", "docente", "administrativo"];

const demoIdentity: Record<DemoRole, { name: string; description: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }> = {
  alumno: {
    name: "Sofía Ramírez",
    description: "Clases, agenda, asistencia y seguimiento académico",
    icon: "school",
  },
  docente: {
    name: "Laura Méndez",
    description: "Comisiones, clase activa y control de asistencia",
    icon: "co-present",
  },
  administrativo: {
    name: "Martina Costa",
    description: "Comisiones, operación académica e incidencias",
    icon: "admin-panel-settings",
  },
};

/**
 * Implementa la operación LoginScreen dentro de este módulo.
 */
export default function LoginScreen() {
  const router = useRouter();
  const { setRole } = useDemoRole();

  /**
   * Implementa la operación enterDemo dentro de este módulo.
   */
  const enterDemo = (role: DemoRole) => {
    setRole(role);
    router.replace("/(tabs)");
  };

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <View style={styles.content}>
        <View style={styles.brandBlock}>
          <View style={styles.logo}>
            <MaterialIcons name="how-to-reg" size={34} color={brand.navy} />
          </View>
          <Text style={styles.eyebrow}>INSTITUTO DE INFORMÁTICA</Text>
          <Text style={styles.title}>Asistencia</Text>
          <Text style={styles.subtitle}>Elegí una identidad para recorrer las vistas y recorridos principales del prototipo.</Text>
        </View>

        <View style={styles.demoCard}>
          <View style={styles.demoHeading}>
            <View style={styles.demoIcon}>
              <MaterialIcons name="science" size={20} color={brand.navyMid} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.demoTitle}>Recorrer prototipo</Text>
              <Text style={styles.demoText}>Los datos son demostrativos y permiten probar cada rol sin cargar una cuenta real.</Text>
            </View>
          </View>

          {demoRoles.map((role) => {
            const identity = demoIdentity[role];
            return (
              <Pressable
                key={role}
                accessibilityRole="button"
                accessibilityLabel={`Entrar como ${rolePresentation[role].label}: ${identity.name}`}
                onPress={() => enterDemo(role)}
                style={({ pressed }) => [styles.demoRole, pressed && styles.pressed]}
              >
                <View style={styles.roleAvatar}>
                  <Text style={styles.roleInitial}>{rolePresentation[role].shortLabel}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.roleTitle}>Entrar como {rolePresentation[role].label}</Text>
                  <Text style={styles.roleName}>{identity.name}</Text>
                  <Text style={styles.roleDetail}>{identity.description}</Text>
                </View>
                <MaterialIcons name={identity.icon} size={22} color={brand.navyMid} />
                <MaterialIcons name="chevron-right" size={21} color={brand.muted} />
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <MaterialIcons name="info-outline" size={16} color={brand.muted} />
          <Text style={styles.footerText}>Modo demostración · Podés volver a cambiar de perfil desde la pestaña Perfil.</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: 18, justifyContent: "center", padding: 20 },
  brandBlock: { alignItems: "center", paddingHorizontal: 18 },
  logo: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 20, height: 70, justifyContent: "center", width: 70 },
  eyebrow: { color: brand.muted, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginTop: 17 },
  title: { color: brand.navy, fontSize: 34, fontWeight: "800", letterSpacing: -1, marginTop: 4 },
  subtitle: { color: brand.muted, fontSize: 13, lineHeight: 19, marginTop: 8, textAlign: "center" },
  demoCard: { backgroundColor: brand.ice, borderRadius: 20, gap: 9, padding: 14 },
  demoHeading: { alignItems: "flex-start", flexDirection: "row", gap: 10, marginBottom: 3 },
  demoIcon: { alignItems: "center", backgroundColor: brand.white, borderRadius: 11, height: 38, justifyContent: "center", width: 38 },
  flex: { flex: 1 },
  demoTitle: { color: brand.navy, fontSize: 15, fontWeight: "800" },
  demoText: { color: brand.muted, fontSize: 10, lineHeight: 14, marginTop: 3 },
  demoRole: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 10, minHeight: 76, paddingHorizontal: 11, paddingVertical: 10 },
  roleAvatar: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 16, height: 32, justifyContent: "center", width: 32 },
  roleInitial: { color: brand.navy, fontSize: 10, fontWeight: "800" },
  roleTitle: { color: brand.text, fontSize: 12, fontWeight: "800" },
  roleName: { color: brand.navyMid, fontSize: 11, fontWeight: "700", marginTop: 2 },
  roleDetail: { color: brand.muted, fontSize: 10, lineHeight: 13, marginTop: 2 },
  footer: { alignItems: "center", flexDirection: "row", gap: 7, justifyContent: "center", paddingHorizontal: 10 },
  footerText: { color: brand.muted, flex: 1, fontSize: 10, lineHeight: 14, textAlign: "center" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
