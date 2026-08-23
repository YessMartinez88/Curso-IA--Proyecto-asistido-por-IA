/**
 * @archivo app/(tabs)/perfil.tsx
 * @descripcion Pantalla principal de una pestaña del flujo móvil por rol.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand, rolePresentation } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";

/**
 * Implementa la operación ProfileScreen dentro de este módulo.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { role } = useDemoRole();
  const presentation = rolePresentation[role];
  const profileName = role === "alumno" ? "Sofía Ramírez" : role === "docente" ? "Laura Méndez" : "Martina Costa";
  const profileDetail = role === "alumno" ? "Tecnicatura en Informática · Legajo 2024-018" : role === "docente" ? "Docente · Departamento de Desarrollo" : "Secretaría académica · Instituto de Informática";

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>CUENTA</Text>
        <Text style={styles.title}>Perfil</Text>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{presentation.shortLabel}</Text></View>
          <Text style={styles.name}>{profileName}</Text>
          <Text style={styles.detail}>{profileDetail}</Text>
          <View style={styles.roleChip}><MaterialIcons name="verified-user" size={15} color={brand.navyMid} /><Text style={styles.roleChipText}>Rol activo: {presentation.label}</Text></View>
        </View>

        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.settingsCard}>
          <Setting icon="notifications-none" title="Notificaciones" detail="Recordatorios y novedades" />
          <View style={styles.divider} />
          <Setting icon="security" title="Seguridad" detail="Sesión y dispositivos" />
          <View style={styles.divider} />
          <Setting icon="help-outline" title="Ayuda" detail="Preguntas frecuentes" />
        </View>

        <Pressable accessibilityRole="button" onPress={() => router.replace("/login")} style={({ pressed }) => [styles.logout, pressed && styles.pressed]}><MaterialIcons name="switch-account" size={20} color={brand.red} /><Text style={styles.logoutText}>Cambiar identidad demo</Text></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Implementa la operación Setting dentro de este módulo.
 */
function Setting({ icon, title, detail }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; title: string; detail: string }) {
  return <View style={styles.setting}><View style={styles.settingIcon}><MaterialIcons name={icon} size={20} color={brand.navyMid} /></View><View style={styles.settingCopy}><Text style={styles.settingTitle}>{title}</Text><Text style={styles.settingDetail}>{detail}</Text></View></View>;
}

const styles = StyleSheet.create({
  content: { gap: 17, padding: 20, paddingBottom: 30 },
  kicker: { color: brand.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8, marginTop: 6 },
  title: { color: brand.navy, fontSize: 28, fontWeight: "700", letterSpacing: -0.5, marginTop: -13 },
  profileCard: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 20, padding: 23 },
  avatar: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  avatarText: { color: brand.navy, fontSize: 18, fontWeight: "800" },
  name: { color: brand.white, fontSize: 20, fontWeight: "700", marginTop: 12 },
  detail: { color: "#C9D7E7", fontSize: 12, lineHeight: 17, marginTop: 5, textAlign: "center" },
  roleChip: { alignItems: "center", backgroundColor: "#EAF1F8", borderRadius: 11, flexDirection: "row", gap: 6, marginTop: 15, paddingHorizontal: 10, paddingVertical: 7 },
  roleChipText: { color: brand.navyMid, fontSize: 11, fontWeight: "700" },
  sectionTitle: { color: brand.navy, fontSize: 16, fontWeight: "700", marginTop: 4 },
  settingsCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, overflow: "hidden" },
  setting: { alignItems: "center", flexDirection: "row", gap: 12, minHeight: 68, paddingHorizontal: 14 },
  settingIcon: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 10, height: 38, justifyContent: "center", width: 38 },
  settingCopy: { flex: 1 },
  settingTitle: { color: brand.text, fontSize: 14, fontWeight: "700" },
  settingDetail: { color: brand.muted, fontSize: 11, marginTop: 3 },
  divider: { backgroundColor: brand.silver, height: 1, marginLeft: 64 },
  logout: { alignItems: "center", borderColor: "#F5CDCD", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 50, marginTop: 4 },
  logoutText: { color: brand.red, fontSize: 14, fontWeight: "700" },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
});
