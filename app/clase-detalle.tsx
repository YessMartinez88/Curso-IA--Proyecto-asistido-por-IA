/**
 * @archivo app/clase-detalle.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { classSummaryForSubject, studentActivityState, type StudentActivityState } from "@/lib/student-class-demo";
import { trpc } from "@/lib/trpc";
import { classAttendanceStatus } from "@/shared/class-detail-flow";

const activityTone: Record<StudentActivityState, { label: string; color: string; background: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }> = {
  pending: { label: "Pendiente de entrega", color: "#9A6D08", background: "#FFF6D7", icon: "upload-file" },
  review: { label: "En espera de revisión", color: brand.navyMid, background: brand.ice, icon: "rate-review" },
  closed: { label: "Cerrada", color: brand.green, background: "#EAF6F1", icon: "task-alt" },
  upcoming: { label: "Próximamente", color: brand.muted, background: "#F2F4F7", icon: "event-note" },
};

/**
 * Implementa la operación ClassDetailScreen dentro de este módulo.
 */
export default function ClassDetailScreen() {
  const router = useRouter();
  const { title, detail, time } = useLocalSearchParams<{ title?: string; detail?: string; time?: string }>();
  const classSummary = useMemo(() => classSummaryForSubject(title), [title]);
  const commissionsQuery = trpc.student.commissions.useQuery();
  const commission = useMemo(() => (commissionsQuery.data ?? []).find((item) => item.subject?.toLowerCase() === title?.toLowerCase()), [commissionsQuery.data, title]);
  const attendanceQuery = trpc.student.attendanceState.useQuery({ commissionId: commission?.id ?? 1 }, { enabled: Boolean(commission) });
  const attendanceState = attendanceQuery.data;
  const sessionStatus = classAttendanceStatus({ hasCommission: Boolean(commission), hasActiveSession: Boolean(attendanceState?.activeSession) });
  const isActive = sessionStatus.tone === "active";
  const pending = classSummary?.activityCounts.pending ?? 0;
  const review = classSummary?.activityCounts.review ?? 0;
  const closed = classSummary?.activityCounts.closed ?? 0;

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>Mi clase</Text><View style={styles.topSpacer} /></View>

        <View style={styles.hero}><View style={styles.heroIcon}><MaterialIcons name="school" size={31} color={brand.navy} /></View><Text style={styles.eyebrow}>SEGUIMIENTO POR MATERIA</Text><Text style={styles.title}>{title ?? "Clase"}</Text><Text style={styles.detail}>{classSummary?.detail ?? detail ?? "Información de clase"}</Text><View style={styles.timeRow}><MaterialIcons name="schedule" size={18} color={brand.yellow} /><Text style={styles.timeText}>{classSummary?.time ?? time ?? "Horario pendiente"}</Text></View></View>

        <View style={styles.overviewGrid}>
          <OverviewCard icon="fact-check" label="Asistencia" value={`${classSummary?.attendance.rate ?? 0}%`} detail={`${classSummary?.attendance.attended ?? 0} de ${classSummary?.attendance.total ?? 0} clases`} tone="green" />
          <OverviewCard icon="grade" label="Nota actual" value={classSummary?.grade !== null && classSummary?.grade !== undefined ? String(classSummary.grade) : "—"} detail={classSummary?.gradeScale ?? "Sin nota"} tone="yellow" />
        </View>

        <View style={[styles.statusCard, isActive ? styles.statusActive : styles.statusIdle]}><View style={[styles.statusDot, isActive ? styles.statusDotActive : styles.statusDotIdle]} /><View style={styles.statusCopy}><Text style={[styles.statusTitle, isActive ? styles.statusTitleActive : styles.statusTitleIdle]}>{sessionStatus.label}</Text><Text style={styles.statusText}>{isActive ? "El docente abrió la clase y podés registrar tu presencia." : "La asistencia se habilita cuando el docente abre una sesión QR para esta materia."}</Text></View></View>
        <Pressable disabled={!isActive} accessibilityRole="button" onPress={() => router.push("/(tabs)/asistencia" as Href)} style={({ pressed }) => [styles.primaryButton, !isActive && styles.primaryButtonDisabled, pressed && styles.pressed]}><Text style={styles.primaryText}>{isActive ? "Registrar asistencia" : "Esperando QR del docente"}</Text><MaterialIcons name={isActive ? "qr-code-scanner" : "schedule"} size={22} color={brand.navy} /></Pressable>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Actividades de la clase</Text><Text style={styles.sectionCaption}>Entregas, revisión y calificaciones de {title ?? "esta materia"}.</Text></View></View>
        <View style={styles.activitySummary}><SummaryChip label="Pendientes" value={pending} tone="pending" /><SummaryChip label="En revisión" value={review} tone="review" /><SummaryChip label="Cerradas" value={closed} tone="closed" /></View>

        {(classSummary?.activities ?? []).map((item) => {
          const state = studentActivityState(item);
          const tone = activityTone[state];
          return <Pressable key={item.id} accessibilityRole="button" onPress={() => router.push(`/academico-detalle?id=${item.id}` as Href)} style={({ pressed }) => [styles.activityCard, pressed && styles.pressed]}><View style={[styles.activityIcon, { backgroundColor: tone.background }]}><MaterialIcons name={tone.icon} size={21} color={tone.color} /></View><View style={styles.activityCopy}><Text style={styles.activityTitle}>{item.title}</Text><Text style={styles.activityDetail}>{item.dateLabel}</Text>{item.dueLabel && <Text style={[styles.activityDue, { color: tone.color }]}>{item.dueLabel}</Text>}</View><View style={[styles.activityChip, { backgroundColor: tone.background }]}><Text style={[styles.activityChipText, { color: tone.color }]}>{tone.label}</Text></View><MaterialIcons name="chevron-right" size={20} color={brand.muted} /></Pressable>;
        })}

        <View style={styles.infoCard}><View style={styles.infoLine}><MaterialIcons name="history" size={20} color={brand.navyMid} /><View><Text style={styles.infoLabel}>Último registro de asistencia</Text><Text style={styles.infoValue}>{classSummary?.latestAttendance ? `${classSummary.latestAttendance.date} · ${classSummary.latestAttendance.status === "present" ? "Presente" : classSummary.latestAttendance.status === "late" ? "Tarde" : classSummary.latestAttendance.status === "justified" ? "Justificada" : "Ausente"}` : "Todavía no hay registros"}</Text></View></View><View style={styles.infoLine}><MaterialIcons name="person-outline" size={20} color={brand.navyMid} /><View><Text style={styles.infoLabel}>Docente y aula</Text><Text style={styles.infoValue}>{commission?.teacherName ?? classSummary?.detail ?? detail ?? "Por confirmar"}</Text></View></View></View>
      </ScrollView>
    </ScreenContainer>
  );
}

/**
 * Implementa la operación OverviewCard dentro de este módulo.
 */
function OverviewCard({ icon, label, value, detail, tone }: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string; value: string; detail: string; tone: "green" | "yellow" }) {
  const color = tone === "green" ? brand.green : "#9A6D08";
  const background = tone === "green" ? "#EAF6F1" : "#FFF6D7";
  return <View style={styles.overviewCard}><View style={[styles.overviewIcon, { backgroundColor: background }]}><MaterialIcons name={icon} size={20} color={color} /></View><Text style={styles.overviewLabel}>{label}</Text><Text style={[styles.overviewValue, { color }]}>{value}</Text><Text style={styles.overviewDetail}>{detail}</Text></View>;
}

/**
 * Implementa la operación SummaryChip dentro de este módulo.
 */
function SummaryChip({ label, value, tone }: { label: string; value: number; tone: "pending" | "review" | "closed" }) {
  const toneConfig = activityTone[tone];
  return <View style={[styles.summaryChip, { backgroundColor: toneConfig.background }]}><Text style={[styles.summaryValue, { color: toneConfig.color }]}>{value}</Text><Text style={[styles.summaryLabel, { color: toneConfig.color }]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  content: { gap: 15, padding: 20, paddingBottom: 34 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 19, fontWeight: "700" },
  topSpacer: { width: 36 },
  hero: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 22, padding: 23 },
  heroIcon: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 18, height: 56, justifyContent: "center", width: 56 },
  eyebrow: { color: "#B9C8DA", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 16 },
  title: { color: brand.white, fontSize: 25, fontWeight: "800", marginTop: 7, textAlign: "center" },
  detail: { color: "#D8E3EE", fontSize: 13, lineHeight: 19, marginTop: 7, textAlign: "center" },
  timeRow: { alignItems: "center", flexDirection: "row", gap: 6, marginTop: 16 },
  timeText: { color: brand.white, fontSize: 13, fontWeight: "800" },
  overviewGrid: { flexDirection: "row", gap: 10 },
  overviewCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, flex: 1, minHeight: 125, padding: 13 },
  overviewIcon: { alignItems: "center", borderRadius: 10, height: 37, justifyContent: "center", width: 37 },
  overviewLabel: { color: brand.muted, fontSize: 10, fontWeight: "700", marginTop: 9 },
  overviewValue: { fontSize: 23, fontWeight: "800", marginTop: 2 },
  overviewDetail: { color: brand.muted, fontSize: 10, lineHeight: 14, marginTop: 2 },
  statusCard: { alignItems: "flex-start", borderRadius: 16, flexDirection: "row", gap: 10, padding: 15 },
  statusActive: { backgroundColor: "#EAF6F1" },
  statusIdle: { backgroundColor: brand.ice },
  statusDot: { borderRadius: 5, height: 10, marginTop: 4, width: 10 },
  statusDotActive: { backgroundColor: brand.green },
  statusDotIdle: { backgroundColor: brand.muted },
  statusCopy: { flex: 1 },
  statusTitle: { fontSize: 13, fontWeight: "800" },
  statusTitleActive: { color: brand.green },
  statusTitleIdle: { color: brand.navyMid },
  statusText: { color: brand.muted, fontSize: 12, lineHeight: 17, marginTop: 4 },
  primaryButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 16 },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryText: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  sectionHeader: { marginTop: 4 },
  sectionTitle: { color: brand.navy, fontSize: 17, fontWeight: "800" },
  sectionCaption: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  activitySummary: { flexDirection: "row", gap: 8 },
  summaryChip: { alignItems: "center", borderRadius: 12, flex: 1, minHeight: 58, paddingHorizontal: 5, paddingVertical: 8 },
  summaryValue: { fontSize: 17, fontWeight: "800" },
  summaryLabel: { fontSize: 9, fontWeight: "800", marginTop: 2, textAlign: "center" },
  activityCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 10, padding: 12 },
  activityIcon: { alignItems: "center", borderRadius: 11, height: 42, justifyContent: "center", width: 42 },
  activityCopy: { flex: 1 },
  activityTitle: { color: brand.text, fontSize: 12, fontWeight: "800", lineHeight: 17 },
  activityDetail: { color: brand.muted, fontSize: 10, lineHeight: 14, marginTop: 3 },
  activityDue: { fontSize: 10, fontWeight: "800", marginTop: 3 },
  activityChip: { borderRadius: 8, maxWidth: 82, paddingHorizontal: 6, paddingVertical: 5 },
  activityChipText: { fontSize: 9, fontWeight: "800", lineHeight: 12, textAlign: "center" },
  infoCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, gap: 14, padding: 16 },
  infoLine: { alignItems: "center", flexDirection: "row", gap: 10 },
  infoLabel: { color: brand.muted, fontSize: 10, fontWeight: "700" },
  infoValue: { color: brand.text, fontSize: 12, lineHeight: 17, marginTop: 3 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
