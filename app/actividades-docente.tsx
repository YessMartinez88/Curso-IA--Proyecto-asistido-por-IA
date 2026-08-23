/**
 * @archivo app/actividades-docente.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { trpc } from "@/lib/trpc";

/**
 * Implementa la operación TeacherActivitiesScreen dentro de este módulo.
 */
export default function TeacherActivitiesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ commissionId?: string; subject?: string; classroom?: string }>();
  const commissionId = Number(params.commissionId);
  const activitiesQuery = trpc.activities.teacherList.useQuery({ commissionId }, { enabled: Number.isInteger(commissionId) && commissionId > 0 });
  const activities = activitiesQuery.data ?? [];

  if (!Number.isInteger(commissionId) || commissionId <= 0) {
    return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.empty}><MaterialIcons name="assignment" size={38} color={brand.navyMid} /><Text style={styles.emptyTitle}>Seleccioná una comisión</Text><Text style={styles.emptyText}>Abrí este panel desde la pestaña Asistencia para administrar las actividades de una clase.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;
  }

  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>Actividades</Text><View style={styles.topSpacer} /></View><View style={styles.hero}><View style={styles.heroIcon}><MaterialIcons name="assignment" size={29} color={brand.navy} /></View><Text style={styles.heroEyebrow}>GESTIÓN DOCENTE</Text><Text style={styles.heroTitle}>{params.subject ?? "Mi clase"}</Text><Text style={styles.heroText}>{params.classroom ?? "Seleccioná y administrá las actividades del grupo."}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/actividad-nueva", params: { commissionId: String(commissionId), subject: params.subject ?? "" } } as Href)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Crear nueva actividad</Text><MaterialIcons name="add-task" size={22} color={brand.navy} /></Pressable><View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Publicadas</Text><Text style={styles.sectionCaption}>Revisá entregas y enviá devoluciones desde cada actividad.</Text></View><Text style={styles.count}>{activities.length}</Text></View>{activitiesQuery.isLoading ? <View style={styles.loading}><ActivityIndicator color={brand.navy} /><Text style={styles.loadingText}>Cargando actividades…</Text></View> : activities.length === 0 ? <View style={styles.emptyList}><MaterialIcons name="assignment-add" size={30} color={brand.muted} /><Text style={styles.emptyListTitle}>Todavía no publicaste actividades</Text><Text style={styles.emptyListText}>Creá una evaluación o trabajo práctico para que el grupo pueda acceder a la consigna.</Text></View> : activities.map((activity) => <Pressable key={activity.id} accessibilityRole="button" onPress={() => router.push({ pathname: "/actividad-revision", params: { activityId: String(activity.id) } } as Href)} style={({ pressed }) => [styles.activityCard, pressed && styles.pressed]}><View style={[styles.activityIcon, activity.type === "evaluation" ? styles.evaluationIcon : styles.practicalIcon]}><MaterialIcons name={activity.type === "evaluation" ? "quiz" : "folder-open"} size={21} color={activity.type === "evaluation" ? brand.navyMid : "#9A6D08"} /></View><View style={styles.activityCopy}><Text style={styles.activityTitle}>{activity.title}</Text><Text style={styles.activityDetail}>{activity.type === "evaluation" ? "Evaluación" : "Trabajo práctico"} · {activity.dueAt ? `Vence ${new Date(activity.dueAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}` : "Sin fecha límite"}</Text>{activity.attachmentName && <View style={styles.attachmentLine}><MaterialIcons name="attach-file" size={13} color={brand.navyMid} /><Text style={styles.attachmentName}>{activity.attachmentName}</Text></View>}<Text style={styles.submissionText}>{activity.submissionCount} entrega{activity.submissionCount === 1 ? "" : "s"} · {activity.pendingReviewCount} por revisar</Text></View><MaterialIcons name="chevron-right" size={23} color={brand.muted} /></Pressable>)}</ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 20, paddingBottom: 34 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 18, fontWeight: "800" },
  topSpacer: { width: 36 },
  hero: { backgroundColor: brand.navy, borderRadius: 21, padding: 21 },
  heroIcon: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 15, height: 50, justifyContent: "center", width: 50 },
  heroEyebrow: { color: "#B9C8DA", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 15 },
  heroTitle: { color: brand.white, fontSize: 24, fontWeight: "800", marginTop: 5 },
  heroText: { color: "#D8E3EE", fontSize: 12, lineHeight: 18, marginTop: 5 },
  primaryButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 16 },
  primaryText: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: brand.navy, fontSize: 17, fontWeight: "800" },
  sectionCaption: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  count: { backgroundColor: brand.navy, borderRadius: 11, color: brand.white, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  activityCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 11, padding: 13 },
  activityIcon: { alignItems: "center", borderRadius: 12, height: 45, justifyContent: "center", width: 45 },
  evaluationIcon: { backgroundColor: brand.ice },
  practicalIcon: { backgroundColor: "#FFF6D7" },
  activityCopy: { flex: 1 },
  activityTitle: { color: brand.text, fontSize: 13, fontWeight: "800", lineHeight: 18 },
  activityDetail: { color: brand.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  attachmentLine: { alignItems: "center", flexDirection: "row", gap: 3, marginTop: 4 },
  attachmentName: { color: brand.navyMid, flex: 1, fontSize: 10, fontWeight: "700" },
  submissionText: { color: brand.green, fontSize: 10, fontWeight: "800", marginTop: 5 },
  loading: { alignItems: "center", gap: 9, paddingVertical: 32 },
  loadingText: { color: brand.muted, fontSize: 12, fontWeight: "700" },
  emptyList: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 18, gap: 7, padding: 23 },
  emptyListTitle: { color: brand.navy, fontSize: 14, fontWeight: "800", textAlign: "center" },
  emptyListText: { color: brand.muted, fontSize: 11, lineHeight: 16, textAlign: "center" },
  empty: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center", padding: 28 },
  emptyTitle: { color: brand.navy, fontSize: 18, fontWeight: "800" },
  emptyText: { color: brand.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  secondaryButton: { borderColor: brand.silver, borderRadius: 12, borderWidth: 1, marginTop: 8, paddingHorizontal: 17, paddingVertical: 11 },
  secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
