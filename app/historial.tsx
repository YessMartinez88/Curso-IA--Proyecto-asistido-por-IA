/**
 * @archivo app/historial.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { trpc } from "@/lib/trpc";
import { toStudentJustificationStatus } from "@/shared/justification-flow";
import {
  attendanceFilterLabels,
  attendanceRecords,
  attendanceStatusLabels,
  attendanceSummary,
  canRequestJustification,
  filterAttendanceRecords,
  type AttendanceFilter,
  type AttendanceRecord,
  type AttendanceStatus,
} from "@/lib/student-attendance-demo";

const filters: AttendanceFilter[] = ["all", "present", "late", "absent", "justified"];

const statusAppearance: Record<AttendanceStatus, { color: string; background: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }> = {
  present: { color: brand.green, background: "#EAF6F1", icon: "check-circle" },
  late: { color: "#AF7600", background: "#FFF6D7", icon: "schedule" },
  absent: { color: brand.red, background: "#FBEAEA", icon: "cancel" },
  justified: { color: brand.navyMid, background: brand.ice, icon: "verified" },
};

/**
 * Implementa la operación HistoryScreen dentro de este módulo.
 */
export default function HistoryScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<AttendanceFilter>("all");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const attendanceHistoryQuery = trpc.student.attendanceHistory.useQuery();
  const justificationsQuery = trpc.justifications.studentList.useQuery();
  const combinedRecords = useMemo(() => {
    const persisted = (attendanceHistoryQuery.data ?? []).map((record) => {
      const date = record.recordedAt ? new Date(record.recordedAt) : new Date();
      return {
        id: `qr-${record.id}`,
        subject: record.subject,
        classroom: record.classroom,
        date: date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" }).replace(".", ""),
        time: date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
        status: record.status,
        source: "QR",
        justificationStatus: "none" as const,
      } satisfies AttendanceRecord;
    });
    const statusByReference = new Map((justificationsQuery.data ?? []).map((item) => [item.recordReference, toStudentJustificationStatus(item.status)]));
    return [...persisted, ...attendanceRecords].map((record) => {
      const justificationStatus = statusByReference.get(record.id);
      return justificationStatus ? { ...record, justificationStatus } : record;
    });
  }, [attendanceHistoryQuery.data, justificationsQuery.data]);
  const records = useMemo(() => filterAttendanceRecords(combinedRecords, filter), [combinedRecords, filter]);
  const summary = attendanceSummary(combinedRecords);
  const targetRecord = combinedRecords.find(canRequestJustification);

  /**
   * Implementa la operación openJustification dentro de este módulo.
   */
  function openJustification(record: AttendanceRecord) {
    router.push(`/justificacion?recordId=${record.id}` as Href);
  }

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}>
      <FlatList
        contentContainerStyle={styles.content}
        data={records}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.topBar}>
              <Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable>
              <Text style={styles.headerTitle}>Historial</Text>
              <View style={styles.topSpacer} />
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryLeft}><Text style={styles.summaryEyebrow}>ASISTENCIA DEL PERÍODO</Text><Text style={styles.summaryRate}>{summary.rate}%</Text><Text style={styles.summaryCaption}>{summary.attended} registros de {summary.total} con presencia</Text></View>
              <View style={styles.summaryCircle}><MaterialIcons name="fact-check" size={31} color={brand.yellow} /></View>
            </View>

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Mis registros</Text><Text style={styles.sectionHelper}>Últimos movimientos</Text></View>
            <View style={styles.filterRow}>
              {filters.map((item) => {
                const active = filter === item;
                return <Pressable key={item} onPress={() => setFilter(item)} style={({ pressed }) => [styles.filter, active && styles.filterActive, pressed && styles.pressed]}><Text style={[styles.filterText, active && styles.filterTextActive]}>{attendanceFilterLabels[item]}</Text></Pressable>;
              })}
            </View>

            {selectedRecord && <RecordDetail record={selectedRecord} onClose={() => setSelectedRecord(null)} onJustify={() => openJustification(selectedRecord)} />}
          </View>
        }
        renderItem={({ item }) => {
          const appearance = statusAppearance[item.status];
          return (
            <Pressable onPress={() => setSelectedRecord(item)} style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}>
              <View style={styles.dateBox}><Text style={styles.dateDay}>{item.date.slice(0, 2)}</Text><Text style={styles.dateMonth}>{item.date.slice(3, 6)}</Text></View>
              <View style={styles.recordCopy}><Text style={styles.subject}>{item.subject}</Text><Text style={styles.recordDetail}>{item.classroom} · {item.time}</Text></View>
              <View style={[styles.statusChip, { backgroundColor: appearance.background }]}><MaterialIcons name={appearance.icon} size={14} color={appearance.color} /><Text style={[styles.statusText, { color: appearance.color }]}>{attendanceStatusLabels[item.status]}</Text></View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><MaterialIcons name="event-note" size={26} color={brand.muted} /><Text style={styles.emptyText}>No hay registros para este filtro.</Text></View>}
        ListFooterComponent={targetRecord ? <Pressable onPress={() => openJustification(targetRecord)} style={({ pressed }) => [styles.justifyButton, pressed && styles.pressed]}><MaterialIcons name="add-circle-outline" size={21} color={brand.navy} /><Text style={styles.justifyButtonText}>Justificar una inasistencia</Text></Pressable> : null}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

/**
 * Implementa la operación RecordDetail dentro de este módulo.
 */
function RecordDetail({ record, onClose, onJustify }: { record: AttendanceRecord; onClose: () => void; onJustify: () => void }) {
  const appearance = statusAppearance[record.status];
  const justificationLabel = record.justificationStatus === "pending" ? "Justificación en revisión" : record.justificationStatus === "accepted" ? "Justificación aceptada" : "Sin justificación registrada";
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailTop}><Text style={styles.detailTitle}>Detalle del registro</Text><Pressable accessibilityLabel="Cerrar detalle" onPress={onClose} style={({ pressed }) => [styles.closeIcon, pressed && styles.pressed]}><MaterialIcons name="close" size={20} color={brand.muted} /></Pressable></View>
      <View style={styles.detailLine}><Text style={styles.detailLabel}>Estado</Text><View style={[styles.statusChip, { backgroundColor: appearance.background }]}><MaterialIcons name={appearance.icon} size={14} color={appearance.color} /><Text style={[styles.statusText, { color: appearance.color }]}>{attendanceStatusLabels[record.status]}</Text></View></View>
      <View style={styles.detailLine}><Text style={styles.detailLabel}>Registro</Text><Text style={styles.detailValue}>{record.source} · {record.time}</Text></View>
      <View style={styles.detailLine}><Text style={styles.detailLabel}>Justificación</Text><Text style={styles.detailValue}>{justificationLabel}</Text></View>
      {canRequestJustification(record) && <Pressable onPress={onJustify} style={({ pressed }) => [styles.detailAction, pressed && styles.pressed]}><Text style={styles.detailActionText}>Crear justificación</Text><MaterialIcons name="arrow-forward" size={19} color={brand.navy} /></Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 10, padding: 20, paddingBottom: 34 },
  headerStack: { gap: 16, marginBottom: 4 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 19, fontWeight: "700" },
  topSpacer: { width: 36 },
  summaryCard: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 20, flexDirection: "row", justifyContent: "space-between", padding: 20 },
  summaryLeft: { flex: 1 },
  summaryEyebrow: { color: "#B8C8DB", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  summaryRate: { color: brand.white, fontSize: 35, fontWeight: "800", letterSpacing: -1, marginTop: 6 },
  summaryCaption: { color: "#D1DCE9", fontSize: 12, lineHeight: 17, marginTop: 2 },
  summaryCircle: { alignItems: "center", backgroundColor: "#21446F", borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  sectionHeader: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  sectionTitle: { color: brand.navy, fontSize: 17, fontWeight: "700" },
  sectionHelper: { color: brand.muted, fontSize: 11, fontWeight: "600" },
  filterRow: { flexDirection: "row", gap: 7 },
  filter: { borderColor: brand.silver, borderRadius: 11, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  filterActive: { backgroundColor: brand.navy, borderColor: brand.navy },
  filterText: { color: brand.muted, fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: brand.white },
  recordCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 11, padding: 13 },
  dateBox: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 10, height: 43, justifyContent: "center", width: 43 },
  dateDay: { color: brand.navy, fontSize: 15, fontWeight: "800" },
  dateMonth: { color: brand.navyMid, fontSize: 9, fontWeight: "700", marginTop: -1 },
  recordCopy: { flex: 1 },
  subject: { color: brand.text, fontSize: 13, fontWeight: "700" },
  recordDetail: { color: brand.muted, fontSize: 11, marginTop: 4 },
  statusChip: { alignItems: "center", borderRadius: 9, flexDirection: "row", gap: 4, paddingHorizontal: 7, paddingVertical: 5 },
  statusText: { fontSize: 10, fontWeight: "800" },
  detailCard: { backgroundColor: brand.ice, borderRadius: 16, gap: 11, padding: 15 },
  detailTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  detailTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  closeIcon: { padding: 2 },
  detailLine: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  detailLabel: { color: brand.muted, fontSize: 11, fontWeight: "600" },
  detailValue: { color: brand.text, fontSize: 11, fontWeight: "700", maxWidth: "62%", textAlign: "right" },
  detailAction: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 11, flexDirection: "row", justifyContent: "space-between", marginTop: 3, minHeight: 42, paddingHorizontal: 12 },
  detailActionText: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  justifyButton: { alignItems: "center", borderColor: brand.yellow, borderRadius: 14, borderWidth: 1.5, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 8, minHeight: 50 },
  justifyButtonText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  empty: { alignItems: "center", gap: 8, paddingVertical: 30 },
  emptyText: { color: brand.muted, fontSize: 13 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
