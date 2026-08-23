/**
 * @archivo app/(tabs)/asistencia.tsx
 * @descripcion Pantalla principal de una pestaña del flujo móvil por rol.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter, type Href } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";
import { trpc } from "@/lib/trpc";
import { DEMO_STUDENT_NAME } from "@/shared/attendance-flow";

type CommissionCard = {
  id: number;
  code: string | null;
  subject: string | null;
  classroom: string | null;
  scheduleLabel: string | null;
  enrollmentCount: number;
  enrolledStudents?: string[];
};

type AttendanceMessage = { type: "success" | "error"; text: string } | null;

/**
 * Implementa la operación ActionButton dentro de este módulo.
 */
function ActionButton({ label, icon, onPress, disabled = false, dark = false }: { label: string; icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void; disabled?: boolean; dark?: boolean }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [dark ? styles.darkButton : styles.primaryButton, disabled && styles.disabledButton, pressed && styles.pressed]}><Text style={dark ? styles.darkButtonText : styles.primaryText}>{label}</Text><MaterialIcons name={icon} size={20} color={dark ? brand.white : brand.navy} /></Pressable>;
}

/**
 * Implementa la operación CommissionPicker dentro de este módulo.
 */
function CommissionPicker({ commissions, selectedId, onSelect, studentMode = false }: { commissions: CommissionCard[]; selectedId: number | null; onSelect: (id: number) => void; studentMode?: boolean }) {
  return <View style={styles.selectorCard}><View style={styles.selectorHeader}><Text style={styles.selectorTitle}>{studentMode ? "Mis comisiones" : "Comisiones activas"}</Text><Text style={styles.selectorCaption}>{commissions.length} disponibles</Text></View><FlatList horizontal data={commissions} keyExtractor={(item) => String(item.id)} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.commissionPickerList} renderItem={({ item }) => { const selected = item.id === selectedId; return <Pressable onPress={() => onSelect(item.id)} style={({ pressed }) => [styles.commissionPicker, selected && styles.commissionPickerSelected, pressed && styles.pressed]}><Text style={[styles.commissionPickerCode, selected && styles.commissionPickerCodeSelected]}>{item.code ?? "SIN CÓDIGO"}</Text><Text numberOfLines={2} style={[styles.commissionPickerSubject, selected && styles.commissionPickerSubjectSelected]}>{item.subject ?? "Materia pendiente"}</Text><Text numberOfLines={1} style={[styles.commissionPickerMeta, selected && styles.commissionPickerMetaSelected]}>{studentMode ? item.classroom ?? "Aula pendiente" : `${item.enrollmentCount} alumnos`}</Text></Pressable>; }} ListEmptyComponent={<Text style={styles.emptyPickerText}>No hay comisiones disponibles.</Text>} /></View>;
}

/**
 * Implementa la operación SessionStatus dentro de este módulo.
 */
function SessionStatus({ active }: { active: boolean }) {
  return <View style={[styles.classStatus, active ? styles.classStatusActive : styles.classStatusIdle]}><View style={[styles.statusDot, active ? styles.statusDotActive : styles.statusDotIdle]} /><Text style={[styles.classStatusText, active ? styles.classStatusTextActive : styles.classStatusTextIdle]}>{active ? "Clase activa: QR disponible" : "No hay una clase activa para esta comisión"}</Text></View>;
}

/**
 * Implementa la operación AttendanceScreen dentro de este módulo.
 */
export default function AttendanceScreen() {
  const router = useRouter();
  const { role, activeQrToken, setActiveQrToken } = useDemoRole();
  const [selectedTeacherCommissionId, setSelectedTeacherCommissionId] = useState<number | null>(null);
  const [selectedStudentCommissionId, setSelectedStudentCommissionId] = useState<number | null>(null);
  const [studentMessage, setStudentMessage] = useState<AttendanceMessage>(null);

  const attendanceState = trpc.attendance.state.useQuery(undefined, { refetchInterval: 5_000 });
  const setupMutation = trpc.attendance.setupDemo.useMutation({ onSuccess: () => attendanceState.refetch() });
  const teacherCommissionsQuery = trpc.teacher.commissions.useQuery();
  const studentCommissionsQuery = trpc.student.commissions.useQuery();
  const teacherStateQuery = trpc.teacher.attendanceState.useQuery({ commissionId: selectedTeacherCommissionId ?? 1 }, { enabled: selectedTeacherCommissionId !== null, refetchInterval: 5_000 });
  const studentStateQuery = trpc.student.attendanceState.useQuery({ commissionId: selectedStudentCommissionId ?? 1 }, { enabled: selectedStudentCommissionId !== null, refetchInterval: 5_000 });
  const teacherOpenMutation = trpc.teacher.openSession.useMutation({ onSuccess: (data) => { setActiveQrToken(data.qrToken); teacherStateQuery.refetch(); } });
  const teacherCloseMutation = trpc.attendance.closeSession.useMutation({ onSuccess: () => { setActiveQrToken(null); teacherStateQuery.refetch(); } });
  const demoCheckInMutation = trpc.attendance.checkIn.useMutation({ onSuccess: () => studentStateQuery.refetch() });

  const teacherCommissions = (teacherCommissionsQuery.data ?? []) as CommissionCard[];
  const studentCommissions = (studentCommissionsQuery.data ?? []) as CommissionCard[];
  const teacherState = teacherStateQuery.data;
  const studentState = studentStateQuery.data;
  const selectedTeacher = teacherCommissions.find((commission) => commission.id === selectedTeacherCommissionId);
  const selectedStudent = studentCommissions.find((commission) => commission.id === selectedStudentCommissionId);
  const teacherSession = teacherState?.activeSession;
  const studentSession = studentState?.activeSession;
  const teacherExpiry = useMemo(() => {
    if (!teacherSession?.qrExpiresAt) return "Código vencido";
    const seconds = Math.max(0, Math.ceil((new Date(teacherSession.qrExpiresAt).getTime() - Date.now()) / 1_000));
    return seconds > 0 ? `Vence en ${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}` : "Código vencido";
  }, [teacherSession?.qrExpiresAt]);

  useEffect(() => {
    if (teacherCommissions.length && !teacherCommissions.some((commission) => commission.id === selectedTeacherCommissionId)) setSelectedTeacherCommissionId(teacherCommissions[0].id);
  }, [teacherCommissions, selectedTeacherCommissionId]);

  useEffect(() => {
    if (studentCommissions.length && !studentCommissions.some((commission) => commission.id === selectedStudentCommissionId)) setSelectedStudentCommissionId(studentCommissions[0].id);
  }, [studentCommissions, selectedStudentCommissionId]);

  /**
   * Implementa la operación registerDemoAttendance dentro de este módulo.
   */
  async function registerDemoAttendance() {
    if (!studentSession || !selectedStudentCommissionId) {
      setStudentMessage({ type: "error", text: "Elegí una comisión con una sesión QR activa." });
      return;
    }
    if (!activeQrToken) {
      setStudentMessage({ type: "error", text: "El QR temporal no está disponible en este dispositivo. Abrí el escáner con cámara o generá una nueva sesión como docente." });
      return;
    }
    try {
      const result = await demoCheckInMutation.mutateAsync({ qrToken: activeQrToken, studentName: DEMO_STUDENT_NAME, expectedCommissionId: selectedStudentCommissionId });
      const messages: Record<string, AttendanceMessage> = {
        registered: { type: "success", text: `Asistencia registrada para ${studentState?.commission.subject ?? selectedStudent?.subject ?? "la comisión seleccionada"}.` },
        already_recorded: { type: "error", text: "Ya registraste asistencia para esta sesión." },
        wrong_commission: { type: "error", text: "El QR pertenece a otra comisión." },
        not_enrolled: { type: "error", text: "No estás habilitado para esta comisión." },
        invalid_qr: { type: "error", text: "El QR venció o no es válido." },
      };
      setStudentMessage(messages[result.outcome] ?? { type: "error", text: "No fue posible validar el QR." });
    } catch {
      setStudentMessage({ type: "error", text: "No fue posible registrar la asistencia. Intentá nuevamente." });
    }
  }

  if (attendanceState.isLoading) return <ScreenContainer className="flex-1" containerClassName="bg-background"><View style={styles.loading}><Text style={styles.loadingText}>Preparando el flujo de asistencia…</Text></View></ScreenContainer>;

  if (role === "administrativo") {
    const data = attendanceState.data;
    return <ScreenContainer className="flex-1" containerClassName="bg-background"><View style={styles.page}><View style={styles.headerStack}><View><Text style={styles.kicker}>CONTROL INSTITUCIONAL</Text><Text style={styles.title}>Asistencia</Text><Text style={styles.subtitle}>Configuración mínima para el circuito de asistencia.</Text></View></View><View style={styles.infoCard}><View style={styles.rowTitle}><View style={styles.iconBubble}><MaterialIcons name="school" size={22} color={brand.navyMid} /></View><View style={styles.flex}><Text style={styles.itemTitle}>{data?.commission.subject ?? "Comisión pendiente"}</Text><Text style={styles.itemDetail}>{data?.commission.code ?? ""} · {data?.commission.classroom ?? ""}</Text></View></View><InfoLine label="Docente" value={data?.commission.teacherName ?? "—"} /><InfoLine label="Alumno inscripto" value={data?.enrolledStudents.join(", ") || "—"} /><InfoLine label="Sesión" value={data?.activeSession ? "Clase abierta" : "Sin sesión activa"} positive={Boolean(data?.activeSession)} /><ActionButton label={setupMutation.isPending ? "Preparando…" : "Preparar comisión demo"} icon="settings" dark onPress={() => setupMutation.mutate()} /></View><View style={styles.note}><MaterialIcons name="verified-user" size={19} color={brand.navyMid} /><Text style={styles.noteText}>Esta acción prepara la comisión de demostración y permite continuar con los flujos de docente y alumno.</Text></View></View></ScreenContainer>;
  }

  if (role === "docente") {
    const enrolledStudents = teacherState?.enrolledStudents ?? selectedTeacher?.enrolledStudents ?? [];
    return <ScreenContainer className="flex-1" containerClassName="bg-background"><FlatList data={teacherState?.latestRecords ?? []} keyExtractor={(record) => String(record.id)} contentContainerStyle={styles.listContent} ListHeaderComponent={<View style={styles.headerStack}><View><Text style={styles.kicker}>ASISTENCIA DOCENTE</Text><Text style={styles.title}>Mis clases</Text><Text style={styles.subtitle}>Seleccioná una comisión activa y abrí una sesión QR para el grupo habilitado.</Text></View><CommissionPicker commissions={teacherCommissions} selectedId={selectedTeacherCommissionId} onSelect={(id) => { setSelectedTeacherCommissionId(id); setActiveQrToken(null); }} />{selectedTeacher ? <><View style={styles.infoCard}><View style={styles.rowTitle}><View style={styles.iconBubble}><MaterialIcons name="class" size={22} color={brand.navyMid} /></View><View style={styles.flex}><Text style={styles.itemTitle}>{teacherState?.commission.subject ?? selectedTeacher.subject}</Text><Text style={styles.itemDetail}>{teacherState?.commission.classroom ?? selectedTeacher.classroom} · {teacherState?.commission.scheduleLabel ?? selectedTeacher.scheduleLabel}</Text></View></View><Text style={styles.groupTitle}>Grupo habilitado · {enrolledStudents.length}</Text>{enrolledStudents.map((student) => <View key={student} style={styles.studentRow}><View style={styles.avatar}><Text style={styles.avatarText}>{student.charAt(0)}</Text></View><Text style={styles.studentName}>{student}</Text><MaterialIcons name="verified" size={17} color={brand.green} /></View>)}</View><Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/actividades-docente", params: { commissionId: String(selectedTeacher.id), subject: teacherState?.commission.subject ?? selectedTeacher.subject ?? "", classroom: teacherState?.commission.classroom ?? selectedTeacher.classroom ?? "" } } as Href)} style={({ pressed }) => [styles.darkButton, pressed && styles.pressed]}><Text style={styles.darkButtonText}>Evaluaciones y trabajos prácticos</Text><MaterialIcons name="assignment" size={21} color={brand.white} /></Pressable>{teacherSession ? <View style={styles.qrCard}><View style={styles.qrHeader}><Text style={styles.qrHeaderText}>QR DE ASISTENCIA</Text><View style={styles.liveChip}><View style={styles.liveDot} /><Text style={styles.liveText}>ACTIVO</Text></View></View><View style={styles.qrPanel}>{activeQrToken ? <QRCode value={activeQrToken} size={190} color={brand.navy} backgroundColor={brand.white} /> : <View style={styles.qrUnavailable}><MaterialIcons name="qr-code-2" size={48} color={brand.muted} /><Text style={styles.itemDetail}>Token disponible en el dispositivo que abrió la sesión.</Text></View>}</View><Text style={styles.qrExpiry}>{teacherExpiry}</Text><Text style={styles.qrHint}>Mostrá este QR al alumno para que lo lea con la cámara.</Text><View style={styles.sessionActions}><View><Text style={styles.presentNumber}>{teacherSession.attendanceCount}</Text><Text style={styles.presentLabel}>presentes</Text></View><Pressable onPress={() => teacherCloseMutation.mutate({ sessionId: teacherSession.id })} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><Text style={styles.closeText}>{teacherCloseMutation.isPending ? "Cerrando…" : "Cerrar sesión"}</Text></Pressable></View></View> : <View style={styles.openCard}><MaterialIcons name="qr-code-2" size={30} color={brand.navyMid} /><Text style={styles.openTitle}>Clase lista para iniciar</Text><Text style={styles.openText}>Abrí una sesión temporal para generar un código QR único para esta comisión.</Text><ActionButton label={teacherOpenMutation.isPending ? "Generando QR…" : "Abrir clase y generar QR"} icon="play-arrow" disabled={teacherOpenMutation.isPending} onPress={() => teacherOpenMutation.mutate({ commissionId: selectedTeacher.id })} /></View>}<Text style={styles.sectionTitle}>Registros en vivo</Text></> : <Empty text="No hay comisiones activas asignadas a Laura Méndez." />}</View>} renderItem={({ item }) => <RecordRow studentName={item.studentName} recordedAt={item.recordedAt} />} ListEmptyComponent={selectedTeacher ? <Empty text={teacherSession ? "Esperando registros del grupo habilitado." : "Abrí una sesión para comenzar a tomar asistencia."} /> : null} ItemSeparatorComponent={() => <View style={styles.separator} />} /></ScreenContainer>;
  }

  return <ScreenContainer className="flex-1" containerClassName="bg-background"><View style={styles.page}><View style={styles.headerStack}><View><Text style={styles.kicker}>ASISTENCIA</Text><Text style={styles.title}>Registrar presencia</Text><Text style={styles.subtitle}>Elegí una de tus comisiones y comprobá si tu docente abrió la sesión QR.</Text></View></View><CommissionPicker commissions={studentCommissions} selectedId={selectedStudentCommissionId} studentMode onSelect={(id) => { setSelectedStudentCommissionId(id); setStudentMessage(null); }} />{selectedStudent ? <><View style={styles.infoCard}><View style={styles.rowTitle}><View style={styles.iconBubble}><MaterialIcons name={studentSession ? "sensors" : "event-busy"} size={22} color={brand.navyMid} /></View><View style={styles.flex}><Text style={styles.itemTitle}>{studentState?.commission.subject ?? selectedStudent.subject}</Text><Text style={styles.itemDetail}>{studentState?.commission.classroom ?? selectedStudent.classroom} · {studentState?.commission.scheduleLabel ?? selectedStudent.scheduleLabel}</Text></View></View><SessionStatus active={Boolean(studentSession)} /></View><View style={styles.scanPanel}><MaterialIcons name="qr-code-scanner" size={65} color={brand.white} /><Text style={styles.scanTitle}>{studentSession ? "Escaneá el QR de la clase" : "Esperando al docente"}</Text><Text style={styles.scanText}>{studentSession ? "El código se validará contra tu inscripción, la sesión temporal y la comisión seleccionada." : "Cuando el docente abra la clase, podrás registrar tu presencia."}</Text></View><ActionButton label="Abrir escáner QR" icon="qr-code-scanner" disabled={!studentSession} onPress={() => router.push((`/scan-qr?commissionId=${selectedStudent.id}` as Href))} /><Pressable disabled={!studentSession || demoCheckInMutation.isPending} onPress={registerDemoAttendance} style={({ pressed }) => [styles.demoLink, (!studentSession || demoCheckInMutation.isPending) && styles.disabledButton, pressed && styles.pressed]}><MaterialIcons name="science" size={18} color={brand.navyMid} /><Text style={styles.demoLinkText}>{demoCheckInMutation.isPending ? "Validando…" : "Registrar con modo de demostración"}</Text></Pressable></> : <Empty text="No tenés comisiones activas con inscripción vigente." />}{studentMessage && <MessageBox message={studentMessage} onHistory={() => router.push("/historial" as Href)} />}<View style={styles.note}><MaterialIcons name="shield" size={19} color={brand.navyMid} /><Text style={styles.noteText}>La cámara solo se usa para leer el QR temporal mostrado por el docente. El modo de demostración conserva la alternativa anterior para pruebas en el mismo dispositivo.</Text></View></View></ScreenContainer>;
}

/**
 * Implementa la operación InfoLine dentro de este módulo.
 */
function InfoLine({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <View style={styles.infoLine}><Text style={styles.infoLabel}>{label}</Text><Text style={[styles.infoValue, positive && styles.infoValuePositive]}>{value}</Text></View>;
}

/**
 * Implementa la operación RecordRow dentro de este módulo.
 */
function RecordRow({ studentName, recordedAt }: { studentName: string; recordedAt: string | Date | null }) {
  return <View style={styles.recordRow}><View style={styles.avatar}><Text style={styles.avatarText}>{studentName.charAt(0)}</Text></View><View style={styles.flex}><Text style={styles.itemTitle}>{studentName}</Text><Text style={styles.itemDetail}>Registro QR · {new Date(recordedAt ?? Date.now()).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</Text></View><View style={styles.presentChip}><MaterialIcons name="check" size={14} color={brand.green} /><Text style={styles.presentText}>Presente</Text></View></View>;
}

/**
 * Implementa la operación Empty dentro de este módulo.
 */
function Empty({ text }: { text: string }) {
  return <View style={styles.empty}><MaterialIcons name="event-note" size={28} color={brand.muted} /><Text style={styles.emptyText}>{text}</Text></View>;
}

/**
 * Implementa la operación MessageBox dentro de este módulo.
 */
function MessageBox({ message, onHistory }: { message: Exclude<AttendanceMessage, null>; onHistory: () => void }) {
  const success = message.type === "success";
  return <View style={[styles.messageBox, success ? styles.messageSuccess : styles.messageError]}><MaterialIcons name={success ? "check-circle" : "info-outline"} size={20} color={success ? brand.green : brand.red} /><View style={styles.flex}><Text style={[styles.messageText, { color: success ? brand.green : brand.red }]}>{message.text}</Text>{success && <Pressable onPress={onHistory}><Text style={styles.historyLink}>Ver historial actualizado</Text></Pressable>}</View></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, gap: 17, padding: 20 },
  listContent: { gap: 12, padding: 20, paddingBottom: 32 },
  headerStack: { gap: 14 },
  kicker: { color: brand.muted, fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  title: { color: brand.navy, fontSize: 28, fontWeight: "800", letterSpacing: -0.6, marginTop: 3 },
  subtitle: { color: brand.muted, fontSize: 13, lineHeight: 19, marginTop: 6 },
  loading: { alignItems: "center", flex: 1, justifyContent: "center" },
  loadingText: { color: brand.muted, fontSize: 14, fontWeight: "700" },
  flex: { flex: 1 },
  rowTitle: { alignItems: "center", flexDirection: "row", gap: 11 },
  iconBubble: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 13, height: 45, justifyContent: "center", width: 45 },
  itemTitle: { color: brand.text, fontSize: 13, fontWeight: "800" },
  itemDetail: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  selectorCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, gap: 11, padding: 14 },
  selectorHeader: { alignItems: "baseline", flexDirection: "row", justifyContent: "space-between" },
  selectorTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  selectorCaption: { color: brand.muted, fontSize: 10, fontWeight: "700" },
  commissionPickerList: { gap: 9 },
  commissionPicker: { backgroundColor: brand.page, borderColor: brand.silver, borderRadius: 13, borderWidth: 1, gap: 4, minHeight: 91, padding: 11, width: 155 },
  commissionPickerSelected: { backgroundColor: brand.navy, borderColor: brand.navy },
  commissionPickerCode: { color: brand.navyMid, fontSize: 10, fontWeight: "800" },
  commissionPickerCodeSelected: { color: brand.yellow },
  commissionPickerSubject: { color: brand.text, fontSize: 12, fontWeight: "800", lineHeight: 16 },
  commissionPickerSubjectSelected: { color: brand.white },
  commissionPickerMeta: { color: brand.muted, fontSize: 10, fontWeight: "600", marginTop: 2 },
  commissionPickerMetaSelected: { color: "#C9D7E7" },
  emptyPickerText: { color: brand.muted, fontSize: 11, paddingVertical: 8 },
  infoCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, gap: 13, padding: 15 },
  infoLine: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  infoLabel: { color: brand.muted, fontSize: 11, fontWeight: "700" },
  infoValue: { color: brand.navy, fontSize: 11, fontWeight: "800", maxWidth: "62%", textAlign: "right" },
  infoValuePositive: { color: brand.green },
  groupTitle: { color: brand.navy, fontSize: 13, fontWeight: "800", marginTop: 2 },
  studentRow: { alignItems: "center", backgroundColor: brand.page, borderRadius: 11, flexDirection: "row", gap: 9, padding: 9 },
  avatar: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 17, height: 34, justifyContent: "center", width: 34 },
  avatarText: { color: brand.navyMid, fontSize: 13, fontWeight: "800" },
  studentName: { color: brand.text, flex: 1, fontSize: 12, fontWeight: "700" },
  classStatus: { alignItems: "center", borderRadius: 10, flexDirection: "row", gap: 7, paddingHorizontal: 10, paddingVertical: 9 },
  classStatusActive: { backgroundColor: "#EAF6F1" },
  classStatusIdle: { backgroundColor: brand.ice },
  statusDot: { borderRadius: 4, height: 8, width: 8 },
  statusDotActive: { backgroundColor: brand.green },
  statusDotIdle: { backgroundColor: brand.muted },
  classStatusText: { fontSize: 11, fontWeight: "700" },
  classStatusTextActive: { color: brand.green },
  classStatusTextIdle: { color: brand.muted },
  qrCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 20, borderWidth: 1, padding: 16 },
  qrHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  qrHeaderText: { color: brand.navy, fontSize: 11, fontWeight: "800", letterSpacing: 0.7 },
  liveChip: { alignItems: "center", backgroundColor: "#EAF6F1", borderRadius: 10, flexDirection: "row", gap: 5, paddingHorizontal: 8, paddingVertical: 5 },
  liveDot: { backgroundColor: brand.green, borderRadius: 3, height: 6, width: 6 },
  liveText: { color: brand.green, fontSize: 10, fontWeight: "800" },
  qrPanel: { alignItems: "center", backgroundColor: brand.page, borderRadius: 16, marginTop: 15, minHeight: 224, justifyContent: "center", padding: 17 },
  qrUnavailable: { alignItems: "center", gap: 6, padding: 18 },
  qrExpiry: { color: brand.muted, fontSize: 12, fontWeight: "700", marginTop: 13, textAlign: "center" },
  qrHint: { color: brand.navyMid, fontSize: 11, fontWeight: "700", lineHeight: 16, marginTop: 5, textAlign: "center" },
  sessionActions: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 13, flexDirection: "row", justifyContent: "space-between", marginTop: 15, padding: 14 },
  presentNumber: { color: brand.white, fontSize: 21, fontWeight: "800", textAlign: "center" },
  presentLabel: { color: "#BAC9DA", fontSize: 10, fontWeight: "600", marginTop: 3 },
  closeButton: { backgroundColor: brand.yellow, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9 },
  closeText: { color: brand.navy, fontSize: 11, fontWeight: "800" },
  openCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 20, borderWidth: 1, gap: 11, padding: 20 },
  openTitle: { color: brand.navy, fontSize: 17, fontWeight: "800" },
  openText: { color: brand.muted, fontSize: 12, lineHeight: 18, textAlign: "center" },
  primaryButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 16 },
  primaryText: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  darkButton: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 16 },
  darkButtonText: { color: brand.white, fontSize: 14, fontWeight: "800" },
  disabledButton: { opacity: 0.48 },
  sectionTitle: { color: brand.navy, fontSize: 16, fontWeight: "800", marginTop: 2 },
  recordRow: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 15, borderWidth: 1, flexDirection: "row", gap: 11, padding: 12 },
  presentChip: { alignItems: "center", backgroundColor: "#EAF6F1", borderRadius: 9, flexDirection: "row", gap: 3, paddingHorizontal: 7, paddingVertical: 5 },
  presentText: { color: brand.green, fontSize: 10, fontWeight: "800" },
  separator: { height: 8 },
  scanPanel: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 22, gap: 8, minHeight: 250, justifyContent: "center", overflow: "hidden", padding: 26 },
  scanTitle: { color: brand.white, fontSize: 18, fontWeight: "800", marginTop: 8, textAlign: "center" },
  scanText: { color: "#C8D5E4", fontSize: 13, lineHeight: 19, textAlign: "center" },
  demoLink: { alignItems: "center", flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 31 },
  demoLinkText: { color: brand.navyMid, fontSize: 12, fontWeight: "700", textDecorationLine: "underline" },
  messageBox: { alignItems: "flex-start", borderRadius: 14, flexDirection: "row", gap: 10, padding: 13 },
  messageSuccess: { backgroundColor: "#EAF6F1" },
  messageError: { backgroundColor: "#FBEAEA" },
  messageText: { fontSize: 12, fontWeight: "600", lineHeight: 17 },
  historyLink: { color: brand.navyMid, fontSize: 12, fontWeight: "800", marginTop: 6 },
  note: { alignItems: "flex-start", backgroundColor: brand.ice, borderRadius: 15, flexDirection: "row", gap: 10, padding: 14 },
  noteText: { color: brand.muted, flex: 1, fontSize: 12, lineHeight: 18 },
  empty: { alignItems: "center", gap: 8, paddingVertical: 26 },
  emptyText: { color: brand.muted, fontSize: 12, textAlign: "center" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
