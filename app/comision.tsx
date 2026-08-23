/**
 * @archivo app/comision.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";
import { trpc } from "@/lib/trpc";

type CommissionForm = {
  code: string;
  subject: string;
  teacherName: string;
  classroom: string;
  scheduleLabel: string;
  periodLabel: string;
  studentName: string;
};

type ReviewCommission = {
  id: number;
  code: string;
  subject: string | null;
  teacherName: string | null;
  classroom: string | null;
  scheduleLabel: string | null;
  periodLabel: string | null;
  status: "draft" | "active";
  enrolledStudents: string[];
  enrollmentHistory: Array<{ id: number; studentName: string; active: boolean; createdAt: string | null }>;
  activationMissing: string[];
  canActivate: boolean;
};

const initialForm: CommissionForm = {
  code: "",
  subject: "",
  teacherName: "",
  classroom: "",
  scheduleLabel: "",
  periodLabel: "2° cuatrimestre 2026",
  studentName: "",
};

/**
 * Implementa la operación fromCommission dentro de este módulo.
 */
function fromCommission(commission: ReviewCommission): CommissionForm {
  return {
    code: commission.code,
    subject: commission.subject ?? "",
    teacherName: commission.teacherName ?? "",
    classroom: commission.classroom ?? "",
    scheduleLabel: commission.scheduleLabel ?? "",
    periodLabel: commission.periodLabel ?? "",
    studentName: commission.enrolledStudents[0] ?? "",
  };
}

/**
 * Implementa la operación CommissionScreen dentro de este módulo.
 */
export default function CommissionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { role } = useDemoRole();
  const incomingId = typeof params.id === "string" && /^\d+$/.test(params.id) ? Number(params.id) : null;
  const [draftId, setDraftId] = useState<number | null>(incomingId);
  const [form, setForm] = useState<CommissionForm>(initialForm);
  const [step, setStep] = useState<"form" | "review" | "activated">("form");
  const [review, setReview] = useState<ReviewCommission | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [enrollmentName, setEnrollmentName] = useState("");
  const detailQuery = trpc.commissions.get.useQuery({ commissionId: incomingId ?? 1 }, { enabled: incomingId !== null });
  const createDraft = trpc.commissions.createDraft.useMutation();
  const updateDraft = trpc.commissions.updateDraft.useMutation();
  const activate = trpc.commissions.activate.useMutation();
  const addEnrollment = trpc.commissions.addEnrollment.useMutation();
  const deactivateEnrollment = trpc.commissions.deactivateEnrollment.useMutation();
  const isSaving = createDraft.isPending || updateDraft.isPending || activate.isPending || addEnrollment.isPending || deactivateEnrollment.isPending;

  useEffect(() => {
    if (detailQuery.data) {
      const current = detailQuery.data as ReviewCommission;
      setDraftId(current.id);
      setForm(fromCommission(current));
      setReview(current);
      if (current.status === "active") setStep("activated");
    }
  }, [detailQuery.data]);

  const headerTitle = useMemo(() => {
    if (step === "review") return "Revisar comisión";
    if (step === "activated") return "Comisión activa";
    return draftId ? "Completar comisión" : "Nueva comisión";
  }, [draftId, step]);

  /**
   * Implementa la operación updateField dentro de este módulo.
   */
  function updateField(field: keyof CommissionForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setNotice(null);
  }

  /**
   * Implementa la operación persistDraft dentro de este módulo.
   */
  async function persistDraft() {
    const payload = { ...form };
    const result = draftId
      ? await updateDraft.mutateAsync({ commissionId: draftId, ...payload })
      : await createDraft.mutateAsync(payload);
    const commission = result as ReviewCommission;
    setDraftId(commission.id);
    setReview(commission);
    return commission;
  }

  /**
   * Gestiona la interacción SaveDraft iniciada desde la interfaz.
   */
  async function handleSaveDraft() {
    try {
      await persistDraft();
      setNotice("Borrador guardado. Podés volver cuando quieras para completarlo o revisarlo.");
    } catch {
      setNotice("No fue posible guardar el borrador. Revisá la conexión e intentá nuevamente.");
    }
  }

  /**
   * Gestiona la interacción Review iniciada desde la interfaz.
   */
  async function handleReview() {
    try {
      const commission = await persistDraft();
      setStep("review");
      if (commission.activationMissing.length > 0) {
        setNotice("Todavía faltan datos obligatorios para activar la comisión.");
      } else {
        setNotice(null);
      }
    } catch {
      setNotice("No fue posible preparar la revisión de la comisión.");
    }
  }

  /**
   * Gestiona la interacción Activate iniciada desde la interfaz.
   */
  async function handleActivate() {
    if (!review) return;
    try {
      const result = await activate.mutateAsync({ commissionId: review.id });
      if (!result.success) {
        setReview(result.commission as ReviewCommission);
        setNotice(`Falta completar: ${result.missing.join(", ")}.`);
        return;
      }
      setReview(result.commission as ReviewCommission);
      setStep("activated");
      setNotice(null);
    } catch {
      setNotice("No fue posible activar la comisión. Intentá nuevamente.");
    }
  }

  /**
   * Gestiona la interacción AddEnrollment iniciada desde la interfaz.
   */
  async function handleAddEnrollment() {
    if (!review) return;
    if (!enrollmentName.trim()) {
      setNotice("Ingresá el nombre del alumno para inscribirlo.");
      return;
    }
    try {
      const updated = await addEnrollment.mutateAsync({ commissionId: review.id, studentName: enrollmentName });
      setReview(updated as ReviewCommission);
      setEnrollmentName("");
      setNotice("Alumno inscripto correctamente.");
    } catch {
      setNotice("No fue posible registrar al alumno. Verificá los datos e intentá nuevamente.");
    }
  }

  /**
   * Gestiona la interacción DeactivateEnrollment iniciada desde la interfaz.
   */
  async function handleDeactivateEnrollment(enrollmentId: number) {
    if (!review) return;
    try {
      const updated = await deactivateEnrollment.mutateAsync({ commissionId: review.id, enrollmentId });
      setReview(updated as ReviewCommission);
      setNotice("La inscripción fue desactivada y quedó registrada en el historial.");
    } catch {
      setNotice("No se puede desactivar esta inscripción. Una comisión activa debe conservar al menos un alumno.");
    }
  }

  if (role !== "administrativo") {
    return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.restricted}><MaterialIcons name="admin-panel-settings" size={38} color={brand.navyMid} /><Text style={styles.restrictedTitle}>Gestión de comisiones</Text><Text style={styles.restrictedText}>Esta pantalla requiere el perfil administrativo.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;
  }

  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>{headerTitle}</Text><View style={styles.topSpacer} /></View>{step === "form" && <CommissionFormFields form={form} onChange={updateField} />}{step === "review" && review && <ReviewPanel commission={review} onBack={() => setStep("form")} onActivate={handleActivate} onCommissionUpdated={setReview} isSaving={isSaving} />}{step === "activated" && review && <ActivatedPanel commission={review} onCommissionUpdated={setReview} onFinish={() => router.replace("/(tabs)/agenda")} />}{notice && <View style={[styles.notice, notice.startsWith("Falta") || notice.startsWith("Todavía") || notice.startsWith("No fue") ? styles.noticeWarning : styles.noticeSuccess]}><MaterialIcons name={notice.startsWith("Borrador") ? "check-circle" : "info-outline"} size={20} color={notice.startsWith("Borrador") ? brand.green : "#AF7600"} /><Text style={[styles.noticeText, { color: notice.startsWith("Borrador") ? brand.green : "#8A5D00" }]}>{notice}</Text></View>}{step === "form" && <View style={styles.actionStack}><Pressable disabled={isSaving} onPress={handleSaveDraft} style={({ pressed }) => [styles.secondaryAction, isSaving && styles.disabled, pressed && styles.pressed]}><Text style={styles.secondaryActionText}>{isSaving ? "Guardando…" : "Guardar borrador"}</Text><MaterialIcons name="save" size={20} color={brand.navy} /></Pressable><Pressable disabled={isSaving} onPress={handleReview} style={({ pressed }) => [styles.primaryAction, isSaving && styles.disabled, pressed && styles.pressed]}><Text style={styles.primaryActionText}>Revisar y activar</Text><MaterialIcons name="arrow-forward" size={20} color={brand.navy} /></Pressable></View>}</ScrollView></ScreenContainer>;
}

/**
 * Implementa la operación CommissionFormFields dentro de este módulo.
 */
function CommissionFormFields({ form, onChange }: { form: CommissionForm; onChange: (field: keyof CommissionForm, value: string) => void }) {
  return <View style={styles.formStack}><View style={styles.introCard}><View style={styles.introIcon}><MaterialIcons name="account-tree" size={25} color={brand.navyMid} /></View><View style={styles.introCopy}><Text style={styles.introTitle}>Datos operativos de la comisión</Text><Text style={styles.introText}>Podés guardar datos incompletos como borrador. La activación exige completar todos los campos y registrar un alumno.</Text></View></View><FormField label="Código de comisión" hint="Ej.: PROG2-B-2026" value={form.code} onChangeText={(value) => onChange("code", value)} autoCapitalize="characters" /><FormField label="Materia" hint="Ej.: Programación II" value={form.subject} onChangeText={(value) => onChange("subject", value)} /><FormField label="Docente responsable" hint="Nombre y apellido" value={form.teacherName} onChangeText={(value) => onChange("teacherName", value)} /><FormField label="Aula o laboratorio" hint="Ej.: Aula 204" value={form.classroom} onChangeText={(value) => onChange("classroom", value)} /><FormField label="Horario" hint="Ej.: Miércoles · 18:30 a 20:00" value={form.scheduleLabel} onChangeText={(value) => onChange("scheduleLabel", value)} /><FormField label="Período académico" hint="Ej.: 2° cuatrimestre 2026" value={form.periodLabel} onChangeText={(value) => onChange("periodLabel", value)} /><View style={styles.enrollmentSection}><Text style={styles.fieldLabel}>Primer alumno inscripto</Text><Text style={styles.fieldHint}>Es obligatorio para activar la comisión y habilitar la asistencia.</Text><View style={styles.enrollmentInput}><MaterialIcons name="person-add" size={20} color={brand.navyMid} /><TextInput value={form.studentName} onChangeText={(value) => onChange("studentName", value)} placeholder="Nombre y apellido" placeholderTextColor={brand.muted} style={styles.enrollmentTextInput} /></View></View></View>;
}

/**
 * Implementa la operación FormField dentro de este módulo.
 */
function FormField({ label, hint, value, onChangeText, autoCapitalize = "sentences" }: { label: string; hint: string; value: string; onChangeText: (value: string) => void; autoCapitalize?: "characters" | "sentences" }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={hint} placeholderTextColor={brand.muted} autoCapitalize={autoCapitalize} style={styles.input} /></View>;
}

/**
 * Implementa la operación ReviewPanel dentro de este módulo.
 */
function ReviewPanel({ commission, onBack, onActivate, onCommissionUpdated, isSaving }: { commission: ReviewCommission; onBack: () => void; onActivate: () => void; onCommissionUpdated: (commission: ReviewCommission) => void; isSaving: boolean }) {
  const lines = [["Código", commission.code], ["Materia", commission.subject ?? "Sin definir"], ["Docente", commission.teacherName ?? "Sin definir"], ["Aula", commission.classroom ?? "Sin definir"], ["Horario", commission.scheduleLabel ?? "Sin definir"], ["Período", commission.periodLabel ?? "Sin definir"], ["Alumnos", commission.enrolledStudents.length > 0 ? commission.enrolledStudents.join(", ") : "Sin alumnos inscriptos"]];
  return <View style={styles.formStack}>
    <View style={styles.reviewHero}><View style={styles.reviewHeroIcon}><MaterialIcons name={commission.canActivate ? "verified" : "rule"} size={30} color={commission.canActivate ? brand.green : brand.yellow} /></View><Text style={styles.reviewHeroTitle}>{commission.canActivate ? "Lista para activar" : "Requiere completar datos"}</Text><Text style={styles.reviewHeroText}>{commission.canActivate ? "La comisión podrá aparecer en agenda y habilitar sesiones de asistencia." : "Revisá los requisitos pendientes antes de publicar la comisión."}</Text></View>
    <View style={styles.reviewCard}>{lines.map(([label, value]) => <View key={label} style={styles.reviewLine}><Text style={styles.reviewLabel}>{label}</Text><Text style={styles.reviewValue}>{value}</Text></View>)}</View>
    <CommissionEnrollmentManager commissionId={commission.id} onCommissionUpdated={onCommissionUpdated} />
    {commission.activationMissing.length > 0 && <View style={styles.requirements}><Text style={styles.requirementsTitle}>Para activar falta:</Text>{commission.activationMissing.map((item) => <View key={item} style={styles.requirementLine}><MaterialIcons name="radio-button-unchecked" size={17} color="#AF7600" /><Text style={styles.requirementText}>{item}</Text></View>)}</View>}
    <View style={styles.actionStack}><Pressable onPress={onBack} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}><Text style={styles.secondaryActionText}>Volver a completar</Text><MaterialIcons name="edit" size={19} color={brand.navy} /></Pressable><Pressable disabled={!commission.canActivate || isSaving} onPress={onActivate} style={({ pressed }) => [styles.primaryAction, (!commission.canActivate || isSaving) && styles.disabled, pressed && styles.pressed]}><Text style={styles.primaryActionText}>{isSaving ? "Activando…" : "Activar comisión"}</Text><MaterialIcons name="check-circle" size={20} color={brand.navy} /></Pressable></View>
  </View>;
}

/**
 * Implementa la operación ActivatedPanel dentro de este módulo.
 */
function ActivatedPanel({ commission, onCommissionUpdated, onFinish }: { commission: ReviewCommission; onCommissionUpdated: (commission: ReviewCommission) => void; onFinish: () => void }) {
  return <View style={styles.activatedWrap}><View style={styles.activatedCircle}><MaterialIcons name="check" size={38} color={brand.green} /></View><Text style={styles.activatedTitle}>Comisión activa</Text><Text style={styles.activatedText}>{commission.subject} quedó disponible en la agenda institucional. Podés seguir administrando los alumnos habilitados para asistencia.</Text><View style={styles.activatedSummary}><Text style={styles.activatedCode}>{commission.code}</Text><Text style={styles.activatedMeta}>{commission.classroom} · {commission.scheduleLabel}</Text></View><CommissionEnrollmentManager commissionId={commission.id} onCommissionUpdated={onCommissionUpdated} /><Pressable onPress={onFinish} style={({ pressed }) => [styles.primaryAction, pressed && styles.pressed]}><Text style={styles.primaryActionText}>Ver comisiones</Text><MaterialIcons name="arrow-forward" size={20} color={brand.navy} /></Pressable></View>;
}

/**
 * Implementa la operación CommissionEnrollmentManager dentro de este módulo.
 */
function CommissionEnrollmentManager({ commissionId, onCommissionUpdated }: { commissionId: number; onCommissionUpdated: (commission: ReviewCommission) => void }) {
  const [studentName, setStudentName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const commissionQuery = trpc.commissions.get.useQuery({ commissionId });
  const addEnrollment = trpc.commissions.addEnrollment.useMutation();
  const deactivateEnrollment = trpc.commissions.deactivateEnrollment.useMutation();
  const commission = commissionQuery.data as ReviewCommission | undefined;
  const activeCount = commission?.enrollmentHistory.filter((enrollment) => enrollment.active).length ?? 0;
  const isSaving = addEnrollment.isPending || deactivateEnrollment.isPending;

  /**
   * Implementa la operación addStudent dentro de este módulo.
   */
  async function addStudent() {
    if (!studentName.trim()) {
      setMessage("Ingresá el nombre del alumno.");
      return;
    }
    try {
      const updated = await addEnrollment.mutateAsync({ commissionId, studentName });
      await commissionQuery.refetch();
      onCommissionUpdated(updated as ReviewCommission);
      setStudentName("");
      setMessage("Alumno inscripto correctamente.");
    } catch {
      setMessage("No fue posible registrar al alumno.");
    }
  }

  /**
   * Implementa la operación deactivateStudent dentro de este módulo.
   */
  async function deactivateStudent(enrollmentId: number) {
    try {
      const updated = await deactivateEnrollment.mutateAsync({ commissionId, enrollmentId });
      await commissionQuery.refetch();
      onCommissionUpdated(updated as ReviewCommission);
      setMessage("La inscripción se desactivó y quedó en el historial.");
    } catch {
      setMessage("Una comisión activa debe conservar al menos un alumno.");
    }
  }

  if (!commission) return null;
  return <View style={styles.enrollmentManager}><View style={styles.enrollmentManagerHeader}><View><Text style={styles.managerTitle}>Alumnos inscriptos</Text><Text style={styles.managerCaption}>{activeCount} habilitados para asistencia</Text></View><View style={styles.enrollmentCount}><Text style={styles.enrollmentCountText}>{activeCount}</Text></View></View><View style={styles.addEnrollmentRow}><TextInput value={studentName} onChangeText={setStudentName} placeholder="Agregar alumno" placeholderTextColor={brand.muted} style={styles.addEnrollmentInput} /><Pressable disabled={isSaving} onPress={addStudent} style={({ pressed }) => [styles.addEnrollmentButton, isSaving && styles.disabled, pressed && styles.pressed]}><MaterialIcons name="person-add" size={20} color={brand.navy} /></Pressable></View>{message && <Text style={styles.enrollmentMessage}>{message}</Text>}<FlatList scrollEnabled={false} data={commission.enrollmentHistory} keyExtractor={(item) => String(item.id)} contentContainerStyle={styles.enrollmentList} renderItem={({ item }) => { const canDeactivate = item.active && (commission.status !== "active" || activeCount > 1); return <View style={[styles.enrollmentRow, !item.active && styles.enrollmentRowInactive]}><View style={[styles.enrollmentAvatar, !item.active && styles.enrollmentAvatarInactive]}><Text style={[styles.enrollmentInitial, !item.active && styles.enrollmentInitialInactive]}>{item.studentName.charAt(0)}</Text></View><View style={styles.enrollmentCopy}><Text style={[styles.enrollmentName, !item.active && styles.enrollmentNameInactive]}>{item.studentName}</Text><Text style={styles.enrollmentMeta}>{item.active ? "Inscripción activa" : "Inscripción desactivada"}</Text></View>{item.active ? <Pressable disabled={!canDeactivate || isSaving} onPress={() => deactivateStudent(item.id)} style={({ pressed }) => [styles.deactivateButton, (!canDeactivate || isSaving) && styles.deactivateButtonDisabled, pressed && styles.pressed]}><Text style={styles.deactivateText}>{canDeactivate ? "Desactivar" : "Último activo"}</Text></Pressable> : <View style={styles.inactiveChip}><Text style={styles.inactiveChipText}>Historial</Text></View>}</View>; }} ListEmptyComponent={<Text style={styles.emptyEnrollmentText}>Aún no hay alumnos inscriptos.</Text>} /></View>;
}

const styles = StyleSheet.create({
  content: { gap: 20, padding: 20, paddingBottom: 34 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 18, fontWeight: "700" },
  topSpacer: { width: 36 },
  formStack: { gap: 15 },
  introCard: { alignItems: "flex-start", backgroundColor: brand.ice, borderRadius: 17, flexDirection: "row", gap: 11, padding: 15 },
  introIcon: { alignItems: "center", backgroundColor: brand.white, borderRadius: 12, height: 45, justifyContent: "center", width: 45 },
  introCopy: { flex: 1 },
  introTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  introText: { color: brand.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  field: { gap: 7 },
  fieldLabel: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  fieldHint: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: -3 },
  input: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 12, borderWidth: 1, color: brand.text, fontSize: 13, minHeight: 48, paddingHorizontal: 13 },
  enrollmentSection: { gap: 7, marginTop: 2 },
  enrollmentInput: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: 9, minHeight: 48, paddingHorizontal: 13 },
  enrollmentTextInput: { color: brand.text, flex: 1, fontSize: 13, minHeight: 46 },
  actionStack: { gap: 10 },
  primaryAction: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 52, paddingHorizontal: 16 },
  primaryActionText: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  secondaryAction: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 14, borderWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 50, paddingHorizontal: 16 },
  secondaryActionText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  disabled: { opacity: 0.45 },
  notice: { alignItems: "flex-start", borderRadius: 14, flexDirection: "row", gap: 10, padding: 13 },
  noticeSuccess: { backgroundColor: "#EAF6F1" },
  noticeWarning: { backgroundColor: "#FFF6D7" },
  noticeText: { flex: 1, fontSize: 12, fontWeight: "600", lineHeight: 18 },
  reviewHero: { alignItems: "center", backgroundColor: brand.navy, borderRadius: 20, gap: 7, padding: 21 },
  reviewHeroIcon: { alignItems: "center", backgroundColor: "#21446F", borderRadius: 30, height: 60, justifyContent: "center", width: 60 },
  reviewHeroTitle: { color: brand.white, fontSize: 18, fontWeight: "800", marginTop: 3 },
  reviewHeroText: { color: "#D1DCE9", fontSize: 12, lineHeight: 18, textAlign: "center" },
  reviewCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, gap: 12, padding: 15 },
  reviewLine: { alignItems: "flex-start", flexDirection: "row", justifyContent: "space-between" },
  reviewLabel: { color: brand.muted, fontSize: 11, fontWeight: "600" },
  reviewValue: { color: brand.text, fontSize: 11, fontWeight: "800", maxWidth: "61%", textAlign: "right" },
  requirements: { backgroundColor: "#FFF6D7", borderRadius: 16, gap: 8, padding: 14 },
  requirementsTitle: { color: "#8A5D00", fontSize: 13, fontWeight: "800" },
  requirementLine: { alignItems: "center", flexDirection: "row", gap: 8 },
  requirementText: { color: "#8A5D00", fontSize: 12, fontWeight: "600" },
  activatedWrap: { alignItems: "center", gap: 14, paddingTop: 34 },
  activatedCircle: { alignItems: "center", backgroundColor: "#EAF6F1", borderRadius: 42, height: 84, justifyContent: "center", width: 84 },
  activatedTitle: { color: brand.navy, fontSize: 21, fontWeight: "800" },
  activatedText: { color: brand.muted, fontSize: 13, lineHeight: 20, textAlign: "center" },
  activatedSummary: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 15, gap: 5, padding: 14, width: "100%" },
  activatedCode: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  activatedMeta: { color: brand.muted, fontSize: 11, textAlign: "center" },
  enrollmentManager: { alignSelf: "stretch", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, gap: 12, padding: 14 },
  enrollmentManagerHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  managerTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  managerCaption: { color: brand.muted, fontSize: 11, marginTop: 3 },
  enrollmentCount: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 15, height: 30, justifyContent: "center", width: 30 },
  enrollmentCountText: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  addEnrollmentRow: { alignItems: "center", flexDirection: "row", gap: 8 },
  addEnrollmentInput: { backgroundColor: brand.page, borderColor: brand.silver, borderRadius: 10, borderWidth: 1, color: brand.text, flex: 1, fontSize: 12, minHeight: 42, paddingHorizontal: 11 },
  addEnrollmentButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 10, height: 42, justifyContent: "center", width: 42 },
  enrollmentMessage: { color: brand.navyMid, fontSize: 11, fontWeight: "600", lineHeight: 16 },
  enrollmentList: { gap: 8 },
  enrollmentRow: { alignItems: "center", backgroundColor: brand.page, borderRadius: 12, flexDirection: "row", gap: 9, padding: 10 },
  enrollmentRowInactive: { opacity: 0.63 },
  enrollmentAvatar: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 14, height: 28, justifyContent: "center", width: 28 },
  enrollmentAvatarInactive: { backgroundColor: brand.silver },
  enrollmentInitial: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  enrollmentInitialInactive: { color: brand.muted },
  enrollmentCopy: { flex: 1 },
  enrollmentName: { color: brand.text, fontSize: 12, fontWeight: "700" },
  enrollmentNameInactive: { textDecorationLine: "line-through" },
  enrollmentMeta: { color: brand.muted, fontSize: 10, marginTop: 2 },
  deactivateButton: { backgroundColor: "#FFF0F0", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6 },
  deactivateButtonDisabled: { backgroundColor: brand.ice },
  deactivateText: { color: "#B24747", fontSize: 10, fontWeight: "800" },
  inactiveChip: { backgroundColor: brand.ice, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5 },
  inactiveChipText: { color: brand.muted, fontSize: 9, fontWeight: "800" },
  emptyEnrollmentText: { color: brand.muted, fontSize: 11, paddingVertical: 6, textAlign: "center" },
  restricted: { alignItems: "center", flex: 1, gap: 10, justifyContent: "center", padding: 28 },
  restrictedTitle: { color: brand.navy, fontSize: 19, fontWeight: "700" },
  restrictedText: { color: brand.muted, fontSize: 13, textAlign: "center" },
  secondaryButton: { borderColor: brand.silver, borderRadius: 12, borderWidth: 1, marginTop: 8, paddingHorizontal: 18, paddingVertical: 11 },
  secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
