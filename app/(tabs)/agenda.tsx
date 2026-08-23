/**
 * @archivo app/(tabs)/agenda.tsx
 * @descripcion Pantalla principal de una pestaña del flujo móvil por rol.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, type Href } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";
import { buildFortnightAgenda, type ScheduleEvent, type ScheduledDay } from "@/lib/fortnight-agenda-demo";
import { trpc } from "@/lib/trpc";

type StudentTeacherMode = "day" | "fortnight";
type AdministrativeCommission = {
  id: number;
  code: string;
  subject: string | null;
  classroom: string | null;
  teacherName: string | null;
  scheduleLabel: string | null;
  status: "draft" | "active";
  enrollmentCount: number;
  activationMissing: string[];
};

/**
 * Determina si se cumple la condición isScheduledDay.
 */
function isScheduledDay(item: ScheduledDay | AdministrativeCommission): item is ScheduledDay {
  return "classes" in item;
}

/**
 * Implementa la operación AgendaScreen dentro de este módulo.
 */
export default function AgendaScreen() {
  const router = useRouter();
  const { role } = useDemoRole();
  const [mode, setMode] = useState<StudentTeacherMode>("day");
  const [selectedDayId, setSelectedDayId] = useState("2026-08-14");
  const commissionsQuery = trpc.commissions.list.useQuery(undefined, { enabled: role === "administrativo" });

  const fortnight = useMemo(() => buildFortnightAgenda(role), [role]);
  const visibleDays = mode === "day" ? fortnight.filter((day) => day.id === selectedDayId) : fortnight;
  const administrativeCommissions = commissionsQuery.data ?? [];
  const administrativeData: Array<ScheduledDay | AdministrativeCommission> = mode === "fortnight" ? fortnight : administrativeCommissions;

  if (role === "administrativo") {
    const activeCount = administrativeCommissions.filter((commission) => commission.status === "active").length;
    return (
      <ScreenContainer className="flex-1" containerClassName="bg-background">
        <FlatList
          contentContainerStyle={styles.listContent}
          data={administrativeData}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <View style={styles.headerStack}>
              <View style={styles.headerRow}><View><Text style={styles.kicker}>GESTIÓN ACADÉMICA</Text><Text style={styles.title}>{mode === "fortnight" ? "Agenda institucional" : "Comisiones"}</Text></View><View style={styles.countBubble}><Text style={styles.countText}>{mode === "fortnight" ? "14" : activeCount}</Text></View></View>
              <View style={styles.viewSwitch}><Pressable onPress={() => setMode("day")} style={({ pressed }) => [styles.viewOption, mode === "day" && styles.viewOptionActive, pressed && styles.pressed]}><Text style={[styles.viewText, mode === "day" && styles.viewTextActive]}>Comisiones</Text></Pressable><Pressable onPress={() => setMode("fortnight")} style={({ pressed }) => [styles.viewOption, mode === "fortnight" && styles.viewOptionActive, pressed && styles.pressed]}><Text style={[styles.viewText, mode === "fortnight" && styles.viewTextActive]}>14 días</Text></Pressable></View>
              {mode === "day" ? <>
                <Pressable onPress={() => router.push("/comision" as Href)} style={({ pressed }) => [styles.darkButton, pressed && styles.pressed]}><MaterialIcons name="add" size={21} color={brand.white} /><Text style={styles.darkButtonText}>Nueva comisión</Text></Pressable>
                <View style={styles.commissionHelper}><MaterialIcons name="info-outline" size={19} color={brand.navyMid} /><Text style={styles.commissionHelperText}>Los borradores pueden completarse después. Solo las comisiones activas quedan disponibles para agenda y asistencia.</Text></View>
                <Text style={styles.sectionTitle}>Comisiones registradas</Text>
              </> : <FortnightHeader days={fortnight} selectedDayId={selectedDayId} onSelectDay={setSelectedDayId} />}
            </View>
          }
          renderItem={({ item }) => isScheduledDay(item) ? <DayGroup day={item} onSelectClass={(event) => router.push({ pathname: "/clase-detalle", params: { title: event.title, detail: event.detail, time: event.time } } as Href)} /> : <AdministrativeCommissionRow item={item} onSelect={() => router.push(`/comision?id=${item.id}` as Href)} />}
          ListEmptyComponent={mode === "day" ? <View style={styles.emptyCommissions}><MaterialIcons name="playlist-add" size={27} color={brand.muted} /><Text style={styles.emptyCommissionText}>Todavía no hay comisiones. Creá una para comenzar.</Text></View> : null}
          ListFooterComponent={mode === "day" ? <Pressable accessibilityRole="button" onPress={() => router.push("/justificaciones-revision" as Href)} style={({ pressed }) => [styles.darkButton, pressed && styles.pressed]}><MaterialIcons name="fact-check" size={20} color={brand.white} /><Text style={styles.darkButtonText}>Validar justificaciones de inasistencia</Text></Pressable> : null}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          showsVerticalScrollIndicator={false}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1" containerClassName="bg-background">
      <FlatList
        contentContainerStyle={styles.listContent}
        data={visibleDays}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerStack}>
            <View style={styles.headerRow}><View><Text style={styles.kicker}>{role === "alumno" ? "TU AGENDA" : "AGENDA DOCENTE"}</Text><Text style={styles.title}>{role === "alumno" ? "Mi agenda" : "Mis clases"}</Text></View><MaterialIcons name="calendar-month" size={28} color={brand.navy} /></View>
            <View style={styles.viewSwitch}><Pressable onPress={() => setMode("day")} style={({ pressed }) => [styles.viewOption, mode === "day" && styles.viewOptionActive, pressed && styles.pressed]}><Text style={[styles.viewText, mode === "day" && styles.viewTextActive]}>Hoy</Text></Pressable><Pressable onPress={() => setMode("fortnight")} style={({ pressed }) => [styles.viewOption, mode === "fortnight" && styles.viewOptionActive, pressed && styles.pressed]}><Text style={[styles.viewText, mode === "fortnight" && styles.viewTextActive]}>14 días</Text></Pressable></View>
            <FortnightHeader days={fortnight} selectedDayId={selectedDayId} onSelectDay={(id) => { setSelectedDayId(id); setMode("day"); }} />
          </View>
        }
        renderItem={({ item }) => <DayGroup day={item} onSelectClass={(event) => router.push({ pathname: "/clase-detalle", params: { title: event.title, detail: event.detail, time: event.time } } as Href)} compact={mode === "day"} />}
        ListFooterComponent={role === "docente" ? <Pressable accessibilityRole="button" onPress={() => router.push("/justificaciones-revision" as Href)} style={({ pressed }) => [styles.darkButton, pressed && styles.pressed]}><MaterialIcons name="fact-check" size={20} color={brand.white} /><Text style={styles.darkButtonText}>Revisar justificaciones de inasistencia</Text></Pressable> : null}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

/**
 * Implementa la operación FortnightHeader dentro de este módulo.
 */
function FortnightHeader({ days, selectedDayId, onSelectDay }: { days: ScheduledDay[]; selectedDayId: string; onSelectDay: (id: string) => void }) {
  return <View style={styles.fortnightWrap}><View style={styles.rangeHeader}><Text style={styles.rangeTitle}>Próximos 14 días</Text><Text style={styles.rangeCaption}>14–27 agosto</Text></View><FlatList horizontal showsHorizontalScrollIndicator={false} data={days} keyExtractor={(item) => item.id} contentContainerStyle={styles.dateList} renderItem={({ item }) => { const active = item.id === selectedDayId; return <Pressable onPress={() => onSelectDay(item.id)} style={({ pressed }) => [styles.dateTile, active && styles.dateTileActive, pressed && styles.pressed]}><Text style={[styles.weekday, active && styles.weekdayActive]}>{item.weekday}</Text><Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{item.day}</Text><View style={[styles.classDot, item.classes.length === 0 && styles.classDotEmpty, active && styles.classDotActive]} /></Pressable>; }} /></View>;
}

/**
 * Implementa la operación DayGroup dentro de este módulo.
 */
function DayGroup({ day, onSelectClass, compact = false }: { day: ScheduledDay; onSelectClass: (item: ScheduleEvent) => void; compact?: boolean }) {
  return <View style={styles.dayGroup}><View style={styles.dayHeading}><View><Text style={styles.dayTitle}>{day.isToday ? "Hoy · " : ""}{day.fullLabel}</Text><Text style={styles.dayCount}>{day.classes.length === 0 ? "Sin clases programadas" : `${day.classes.length} ${day.classes.length === 1 ? "clase" : "clases"} programadas`}</Text></View>{day.isToday && <View style={styles.todayTag}><Text style={styles.todayTagText}>HOY</Text></View>}</View>{day.classes.length === 0 ? <View style={styles.freeDay}><MaterialIcons name="event-available" size={21} color={brand.muted} /><Text style={styles.freeDayText}>No tenés clases este día.</Text></View> : <FlatList scrollEnabled={false} data={day.classes} keyExtractor={(item) => item.id} contentContainerStyle={styles.classList} renderItem={({ item }) => <Pressable onPress={() => onSelectClass(item)} style={({ pressed }) => [styles.scheduleCard, pressed && styles.pressed]}><View style={styles.timeColumn}><Text style={styles.time}>{item.time}</Text><View style={styles.timeline} /></View><View style={styles.itemCopy}><View style={styles.itemTop}><Text style={styles.itemTitle}>{item.title}</Text><View style={styles.tag}><Text style={styles.tagText}>{item.tag}</Text></View></View><Text style={styles.itemDetail}>{item.detail}</Text></View></Pressable>} ItemSeparatorComponent={() => <View style={{ height: compact ? 8 : 9 }} />} />}</View>;
}

/**
 * Implementa la operación AdministrativeCommissionRow dentro de este módulo.
 */
function AdministrativeCommissionRow({ item, onSelect }: { item: AdministrativeCommission; onSelect: () => void }) {
  const isActive = item.status === "active";
  const title = item.subject ?? "Comisión sin materia";
  const detail = [item.code, item.teacherName, item.classroom].filter(Boolean).join(" · ");
  return <Pressable onPress={onSelect} style={({ pressed }) => [styles.commissionCard, pressed && styles.pressed]}><View style={styles.iconBox}><MaterialIcons name={isActive ? "groups" : "edit-note"} size={21} color={brand.navyMid} /></View><View style={styles.itemCopy}><View style={styles.commissionTitleLine}><Text style={styles.itemTitle}>{title}</Text><View style={[styles.commissionStatus, isActive ? styles.commissionStatusActive : styles.commissionStatusDraft]}><Text style={[styles.commissionStatusText, isActive ? styles.commissionStatusTextActive : styles.commissionStatusTextDraft]}>{isActive ? "Activa" : "Borrador"}</Text></View></View><Text style={styles.itemDetail}>{detail || "Completá la información requerida"}</Text><Text style={styles.people}>{item.enrollmentCount} {item.enrollmentCount === 1 ? "alumno inscripto" : "alumnos inscriptos"}</Text>{!isActive && item.activationMissing.length > 0 && <Text style={styles.missingText}>Falta: {item.activationMissing.slice(0, 2).join(" · ")}{item.activationMissing.length > 2 ? "…" : ""}</Text>}</View><MaterialIcons name="chevron-right" size={23} color={brand.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  listContent: { gap: 10, padding: 20, paddingBottom: 30 },
  headerStack: { gap: 16, marginBottom: 5 },
  headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  kicker: { color: brand.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  title: { color: brand.navy, fontSize: 28, fontWeight: "700", letterSpacing: -0.5, marginTop: 4 },
  countBubble: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  countText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  viewSwitch: { alignSelf: "flex-start", backgroundColor: brand.ice, borderColor: brand.silver, borderRadius: 12, borderWidth: 1, flexDirection: "row", padding: 3 },
  viewOption: { alignItems: "center", borderRadius: 9, minHeight: 34, minWidth: 84, paddingHorizontal: 14, justifyContent: "center" },
  viewOptionActive: { backgroundColor: brand.white, shadowColor: brand.navy, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
  viewText: { color: brand.muted, fontSize: 12, fontWeight: "700" },
  viewTextActive: { color: brand.navy },
  fortnightWrap: { gap: 9 },
  rangeHeader: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" },
  rangeTitle: { color: brand.navy, fontSize: 16, fontWeight: "700" },
  rangeCaption: { color: brand.muted, fontSize: 11, fontWeight: "600" },
  dateList: { gap: 8 },
  dateTile: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 13, borderWidth: 1, height: 66, justifyContent: "center", width: 52 },
  dateTileActive: { backgroundColor: brand.navy, borderColor: brand.navy },
  weekday: { color: brand.muted, fontSize: 10, fontWeight: "700" },
  weekdayActive: { color: "#C9D7E7" },
  dayNumber: { color: brand.navy, fontSize: 17, fontWeight: "800", marginTop: 2 },
  dayNumberActive: { color: brand.white },
  classDot: { backgroundColor: brand.yellow, borderRadius: 3, height: 5, marginTop: 4, width: 5 },
  classDotEmpty: { backgroundColor: brand.silver },
  classDotActive: { backgroundColor: brand.yellow },
  dayGroup: { gap: 10 },
  dayHeading: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  dayTitle: { color: brand.navy, fontSize: 15, fontWeight: "700" },
  dayCount: { color: brand.muted, fontSize: 11, fontWeight: "600", marginTop: 3 },
  todayTag: { backgroundColor: "#FFF6D7", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  todayTagText: { color: "#9B6900", fontSize: 9, fontWeight: "800" },
  classList: { gap: 0 },
  scheduleCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", minHeight: 86, padding: 13 },
  timeColumn: { alignItems: "center", marginRight: 13, width: 44 },
  time: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  timeline: { backgroundColor: brand.yellow, borderRadius: 4, height: 30, marginTop: 7, width: 4 },
  itemCopy: { flex: 1 },
  itemTop: { alignItems: "flex-start", flexDirection: "row", gap: 8, justifyContent: "space-between" },
  itemTitle: { color: brand.text, flex: 1, fontSize: 14, fontWeight: "700", lineHeight: 19 },
  itemDetail: { color: brand.muted, fontSize: 12, lineHeight: 17, marginTop: 5 },
  tag: { backgroundColor: brand.ice, borderRadius: 9, paddingHorizontal: 7, paddingVertical: 4 },
  tagText: { color: brand.navyMid, fontSize: 10, fontWeight: "700" },
  freeDay: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 15, borderStyle: "dashed", borderWidth: 1, flexDirection: "row", gap: 10, padding: 15 },
  freeDayText: { color: brand.muted, fontSize: 12, fontWeight: "600" },
  classDetail: { backgroundColor: brand.ice, borderRadius: 15, gap: 5, marginTop: 4, padding: 14 },
  detailTop: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  detailTitle: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  detailClose: { padding: 2 },
  detailSubject: { color: brand.text, fontSize: 14, fontWeight: "700" },
  detailMeta: { color: brand.muted, fontSize: 11, lineHeight: 16 },
  darkButton: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 14, flexDirection: "row", gap: 8, justifyContent: "center", minHeight: 50 },
  darkButtonText: { color: brand.white, fontSize: 14, fontWeight: "700" },
  composer: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, gap: 10, padding: 15 },
  composerTitle: { color: brand.navy, fontSize: 15, fontWeight: "700" },
  input: { backgroundColor: brand.page, borderColor: brand.silver, borderRadius: 10, borderWidth: 1, color: brand.text, minHeight: 44, paddingHorizontal: 12 },
  saveButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 10, justifyContent: "center", minHeight: 44 },
  saveText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  savedText: { color: brand.green, fontSize: 12, fontWeight: "600", lineHeight: 17 },
  sectionTitle: { color: brand.navy, fontSize: 16, fontWeight: "700" },
  commissionCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, padding: 14 },
  iconBox: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 11, height: 42, justifyContent: "center", width: 42 },
  commissionHelper: { alignItems: "flex-start", backgroundColor: brand.ice, borderRadius: 14, flexDirection: "row", gap: 9, padding: 12 },
  commissionHelperText: { color: brand.muted, flex: 1, fontSize: 11, lineHeight: 16 },
  commissionTitleLine: { alignItems: "center", flexDirection: "row", gap: 7 },
  commissionStatus: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  commissionStatusActive: { backgroundColor: "#EAF6F1" },
  commissionStatusDraft: { backgroundColor: "#FFF6D7" },
  commissionStatusText: { fontSize: 9, fontWeight: "800" },
  commissionStatusTextActive: { color: brand.green },
  commissionStatusTextDraft: { color: "#AF7600" },
  missingText: { color: "#AF7600", fontSize: 10, fontWeight: "700", lineHeight: 15, marginTop: 5 },
  people: { color: brand.navyMid, fontSize: 11, fontWeight: "700", marginTop: 7 },
  emptyCommissions: { alignItems: "center", gap: 8, paddingVertical: 26 },
  emptyCommissionText: { color: brand.muted, fontSize: 12, textAlign: "center" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
