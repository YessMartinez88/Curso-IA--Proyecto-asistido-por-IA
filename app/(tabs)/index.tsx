/**
 * @archivo app/(tabs)/index.tsx
 * @descripcion Pantalla principal de una pestaña del flujo móvil por rol.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, type Href } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand, getRoleActionRoute, rolePresentation } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";
import { studentClassSummaries, type StudentClassSummary } from "@/lib/student-class-demo";

/**
 * Implementa la operación Stat dentro de este módulo.
 */
function Stat({ label, value, tone = "navy" }: { label: string; value: string; tone?: "navy" | "yellow" | "green" }) {
  const color = tone === "yellow" ? brand.yellow : tone === "green" ? brand.green : brand.navy;
  return <View style={styles.stat}><Text style={[styles.statValue, { color }]}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

/**
 * Implementa la operación StudentClassCard dentro de este módulo.
 */
function StudentClassCard({ item, onPress }: { item: StudentClassSummary; onPress: () => void }) {
  const secondaryStatus = item.activityCounts.review > 0
    ? `${item.activityCounts.review} en revisión`
    : item.activityCounts.closed > 0
      ? `${item.activityCounts.closed} cerrada${item.activityCounts.closed > 1 ? "s" : ""}`
      : "Sin entregas en curso";

  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.classCard, pressed && styles.pressed]}>
      <View style={styles.classIcon}><MaterialIcons name="menu-book" size={22} color={brand.navyMid} /></View>
      <View style={styles.classCopy}>
        <View style={styles.classHeading}><Text style={styles.classTitle}>{item.subject}</Text><Text style={styles.classTime}>{item.time}</Text></View>
        <Text style={styles.classDetail}>{item.detail}</Text>
        <View style={styles.classMeta}>
          <View style={styles.attendanceMini}><MaterialIcons name="fact-check" size={14} color={brand.green} /><Text style={styles.attendanceMiniText}>{item.attendance.rate}% asistencia</Text></View>
          <Text style={styles.statusMini}>{item.activityCounts.pending > 0 ? `${item.activityCounts.pending} pendiente${item.activityCounts.pending > 1 ? "s" : ""}` : secondaryStatus}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={brand.muted} />
    </Pressable>
  );
}

/**
 * Implementa la operación StudentHome dentro de este módulo.
 */
function StudentHome() {
  const router = useRouter();
  const classes = studentClassSummaries();

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View><Text style={styles.eyebrow}>MIÉRCOLES, 14 DE AGOSTO</Text><Text style={styles.title}>Hola, Sofía</Text></View>
          <View style={styles.avatar}><Text style={styles.avatarText}>AL</Text></View>
        </View>

        <View style={styles.reminder}><View style={styles.reminderIcon}><MaterialIcons name="tips-and-updates" size={21} color={brand.navyMid} /></View><View style={styles.reminderCopy}><Text style={styles.reminderTitle}>Recordatorio</Text><Text style={styles.reminderText}>El TP de Modelado de Bases de Datos vence el viernes.</Text></View></View>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Mis clases</Text><Text style={styles.sectionCaption}>Elegí una materia para ver su asistencia y seguimiento.</Text></View><Text style={styles.countBadge}>{classes.length}</Text></View>
        <View style={styles.classList}>{classes.map((item) => <StudentClassCard key={item.subject} item={item} onPress={() => router.push({ pathname: "/clase-detalle", params: { title: item.subject, detail: item.detail, time: item.time } } as Href)} />)}</View>

        <Pressable accessibilityRole="button" onPress={() => router.push("/(tabs)/agenda" as Href)} style={({ pressed }) => [styles.agendaLink, pressed && styles.pressed]}><View style={styles.agendaIcon}><MaterialIcons name="calendar-month" size={22} color={brand.navyMid} /></View><View style={styles.agendaCopy}><Text style={styles.agendaTitle}>Agenda de 14 días</Text><Text style={styles.agendaText}>Consultá próximas clases, aulas y horarios.</Text></View><MaterialIcons name="chevron-right" size={23} color={brand.muted} /></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push("/historial" as Href)} style={({ pressed }) => [styles.agendaLink, pressed && styles.pressed]}><View style={styles.agendaIcon}><MaterialIcons name="fact-check" size={22} color={brand.navyMid} /></View><View style={styles.agendaCopy}><Text style={styles.agendaTitle}>Registro de asistencia</Text><Text style={styles.agendaText}>Consultá tus presentes, ausencias y justificaciones.</Text></View><MaterialIcons name="chevron-right" size={23} color={brand.muted} /></Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Implementa la operación RoleHome dentro de este módulo.
 */
function RoleHome() {
  const router = useRouter();
  const { role } = useDemoRole();
  const presentation = rolePresentation[role];
  const roleContent = role === "docente"
    ? { eyebrow: "MIÉRCOLES, 14 DE AGOSTO", title: "Buen día, Laura", subject: "Programación II · 2° B", detail: "18:30 · Aula 204", action: "Abrir clase", icon: "play-circle-outline" as const, stats: [["Comisiones", "3", "navy"], ["A revisar", "5", "yellow"], ["Asistencia", "88%", "green"]] as const, note: "Tenés 5 entregas pendientes de revisión." }
    : { eyebrow: "OPERACIÓN ACADÉMICA", title: "Buen día, Martina", subject: "24 comisiones activas", detail: "2 incidencias requieren revisión", action: "Gestionar comisiones", icon: "assignment" as const, stats: [["Alumnos", "386", "navy"], ["Docentes", "28", "navy"], ["Incidencias", "2", "yellow"]] as const, note: "Hay 2 justificaciones pendientes de resolución." };
  const actionPath = getRoleActionRoute(role) as Href;

  return <ScreenContainer className="flex-1" containerClassName="bg-background"><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topRow}><View><Text style={styles.eyebrow}>{roleContent.eyebrow}</Text><Text style={styles.title}>{roleContent.title}</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{presentation.shortLabel}</Text></View></View><View style={styles.heroCard}><View style={styles.cardDot} /><Text style={styles.cardEyebrow}>PRÓXIMA ACCIÓN</Text><Text style={styles.cardTitle}>{roleContent.subject}</Text><View style={styles.detailRow}><MaterialIcons name="location-on" size={17} color={brand.yellow} /><Text style={styles.cardDetail}>{roleContent.detail}</Text></View><Pressable accessibilityRole="button" onPress={() => router.push(actionPath)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>{roleContent.action}</Text><MaterialIcons name={roleContent.icon} size={21} color={brand.navy} /></Pressable></View><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Vista rápida</Text><Text style={styles.roleLabel}>{presentation.label}</Text></View><View style={styles.statsRow}>{roleContent.stats.map(([label, value, tone]) => <Stat key={label} label={label} value={value} tone={tone} />)}</View><View style={styles.notice}><MaterialIcons name="tips-and-updates" size={22} color={brand.navyMid} /><View style={styles.noticeCopy}><Text style={styles.noticeTitle}>Para vos</Text><Text style={styles.noticeText}>{roleContent.note}</Text></View></View><Pressable accessibilityRole="button" onPress={() => router.push(actionPath)} style={({ pressed }) => [styles.todayCard, pressed && styles.pressed]}><View style={styles.timeBadge}><Text style={styles.timeText}>18:30</Text></View><View style={styles.todayCopy}><Text style={styles.todayTitle}>{role === "docente" ? "Programación II · 2° B" : "Revisión de incidencias"}</Text><Text style={styles.todayDetail}>{role === "docente" ? "Aula 204 · 32 alumnos" : "Secretaría académica"}</Text></View><MaterialIcons name="chevron-right" size={24} color={brand.muted} /></Pressable></ScrollView></ScreenContainer>;
}

/**
 * Implementa la operación HomeScreen dentro de este módulo.
 */
export default function HomeScreen() {
  const { role } = useDemoRole();
  return role === "alumno" ? <StudentHome /> : <RoleHome />;
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 20, paddingBottom: 28 },
  topRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  eyebrow: { color: brand.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  title: { color: brand.navy, fontSize: 28, fontWeight: "700", letterSpacing: -0.6, marginTop: 4 },
  avatar: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 22, height: 44, justifyContent: "center", width: 44 },
  avatarText: { color: brand.white, fontSize: 13, fontWeight: "700" },
  reminder: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 17, flexDirection: "row", gap: 11, padding: 14 },
  reminderIcon: { alignItems: "center", backgroundColor: brand.white, borderRadius: 11, height: 40, justifyContent: "center", width: 40 },
  reminderCopy: { flex: 1 },
  reminderTitle: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  reminderText: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  sectionTitle: { color: brand.navy, fontSize: 17, fontWeight: "700" },
  sectionCaption: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  countBadge: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 12, color: brand.white, fontSize: 11, fontWeight: "800", justifyContent: "center", minHeight: 24, minWidth: 24, overflow: "hidden", paddingHorizontal: 7, textAlign: "center", textAlignVertical: "center" },
  classList: { gap: 10 },
  classCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, flexDirection: "row", gap: 11, padding: 13 },
  classIcon: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 12, height: 45, justifyContent: "center", width: 45 },
  classCopy: { flex: 1 },
  classHeading: { alignItems: "baseline", flexDirection: "row", gap: 7, justifyContent: "space-between" },
  classTitle: { color: brand.text, flex: 1, fontSize: 14, fontWeight: "800" },
  classTime: { color: brand.navyMid, fontSize: 11, fontWeight: "800" },
  classDetail: { color: brand.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  classMeta: { alignItems: "center", flexDirection: "row", gap: 8, marginTop: 7 },
  attendanceMini: { alignItems: "center", flexDirection: "row", gap: 3 },
  attendanceMiniText: { color: brand.green, fontSize: 10, fontWeight: "800" },
  statusMini: { color: "#9A6D08", flex: 1, fontSize: 10, fontWeight: "700", textAlign: "right" },
  agendaLink: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, padding: 13 },
  agendaIcon: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 11, height: 42, justifyContent: "center", width: 42 },
  agendaCopy: { flex: 1 },
  agendaTitle: { color: brand.navy, fontSize: 14, fontWeight: "700" },
  agendaText: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  heroCard: { backgroundColor: brand.navy, borderRadius: 20, overflow: "hidden", padding: 22 },
  cardDot: { backgroundColor: brand.yellow, borderRadius: 7, height: 14, position: "absolute", right: 21, top: 21, width: 14 },
  cardEyebrow: { color: "#B8C8DB", fontSize: 11, fontWeight: "700", letterSpacing: 0.9 },
  cardTitle: { color: brand.white, fontSize: 23, fontWeight: "700", lineHeight: 29, marginTop: 8, maxWidth: "84%" },
  detailRow: { alignItems: "center", flexDirection: "row", gap: 5, marginTop: 12 },
  cardDetail: { color: "#D8E2EE", fontSize: 14, fontWeight: "500" },
  primaryButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", marginTop: 22, minHeight: 52, paddingHorizontal: 17 },
  primaryText: { color: brand.navy, fontSize: 15, fontWeight: "800" },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  roleLabel: { color: brand.muted, fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10 },
  stat: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 15, borderWidth: 1, flex: 1, minHeight: 90, padding: 13 },
  statValue: { fontSize: 23, fontWeight: "800", letterSpacing: -0.4 },
  statLabel: { color: brand.muted, fontSize: 11, fontWeight: "600", marginTop: 7 },
  notice: { alignItems: "flex-start", backgroundColor: brand.ice, borderRadius: 16, flexDirection: "row", gap: 11, padding: 15 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: brand.navy, fontSize: 13, fontWeight: "700" },
  noticeText: { color: brand.muted, fontSize: 13, lineHeight: 18, marginTop: 3 },
  todayCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, padding: 14 },
  timeBadge: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 10, height: 42, justifyContent: "center", width: 53 },
  timeText: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  todayCopy: { flex: 1 },
  todayTitle: { color: brand.text, fontSize: 14, fontWeight: "700" },
  todayDetail: { color: brand.muted, fontSize: 12, marginTop: 4 },
});
