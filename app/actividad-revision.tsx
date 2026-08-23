/**
 * @archivo app/actividad-revision.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { trpc } from "@/lib/trpc";

/**
 * Implementa la operación ActivityReviewScreen dentro de este módulo.
 */
export default function ActivityReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ activityId?: string }>();
  const activityId = Number(params.activityId);
  const reviewQuery = trpc.activities.submissions.useQuery({ activityId }, { enabled: Number.isInteger(activityId) && activityId > 0 });
  const utils = trpc.useUtils();
  const gradeMutation = trpc.activities.grade.useMutation({ onSuccess: () => utils.activities.submissions.invalidate({ activityId }) });
  const [openSubmission, setOpenSubmission] = useState<number | null>(null);

  if (!Number.isInteger(activityId) || activityId <= 0) return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.empty}><Text style={styles.emptyTitle}>No encontramos esta actividad.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;
  if (reviewQuery.isLoading) return <ScreenContainer className="flex-1" containerClassName="bg-background"><View style={styles.loading}><ActivityIndicator color={brand.navy} /><Text style={styles.loadingText}>Cargando entregas…</Text></View></ScreenContainer>;
  if (!reviewQuery.data) return <ScreenContainer className="flex-1" containerClassName="bg-background"><View style={styles.empty}><Text style={styles.emptyTitle}>No pudimos cargar las entregas.</Text></View></ScreenContainer>;

  const { activity, submissions } = reviewQuery.data;
  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>Revisar entregas</Text><View style={styles.topSpacer} /></View><View style={styles.hero}><Text style={styles.heroEyebrow}>{activity.type === "evaluation" ? "EVALUACIÓN" : "TRABAJO PRÁCTICO"}</Text><Text style={styles.heroTitle}>{activity.title}</Text><Text style={styles.heroText}>{activity.dueAt ? `Fecha límite: ${new Date(activity.dueAt).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}` : "Sin fecha límite"} · Calificación máxima: {activity.maxScore}</Text>{activity.attachmentName && <View style={styles.attachmentChip}><MaterialIcons name="attach-file" size={15} color={brand.navy} /><Text style={styles.attachmentChipText}>{activity.attachmentName}</Text></View>}</View><View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Entregas recibidas</Text><Text style={styles.sectionCaption}>Asigná una calificación y una devolución para cada alumno.</Text></View><Text style={styles.count}>{submissions.length}</Text></View>{submissions.length === 0 ? <View style={styles.emptyList}><MaterialIcons name="inbox" size={31} color={brand.muted} /><Text style={styles.emptyListTitle}>Todavía no hay entregas</Text><Text style={styles.emptyListText}>Cuando los alumnos adjunten su trabajo, aparecerán acá para su revisión.</Text></View> : submissions.map((submission) => <SubmissionCard key={submission.id} submission={submission} maxScore={activity.maxScore} expanded={openSubmission === submission.id} saving={gradeMutation.isPending} onToggle={() => setOpenSubmission((value) => value === submission.id ? null : submission.id)} onGrade={async (score, feedback) => { try { await gradeMutation.mutateAsync({ submissionId: submission.id, score, feedback }); Alert.alert("Devolución enviada", "La calificación y el comentario ya quedaron registrados."); setOpenSubmission(null); } catch (error) { Alert.alert("No pudimos calificar", error instanceof Error ? error.message : "Intentá nuevamente."); } }} />)}</ScrollView></ScreenContainer>;
}

/**
 * Implementa la operación SubmissionCard dentro de este módulo.
 */
function SubmissionCard({ submission, maxScore, expanded, saving, onToggle, onGrade }: { submission: { id: number; studentName: string; fileName: string; submittedAt: string | null; score: number | null; feedback: string | null }; maxScore: number; expanded: boolean; saving: boolean; onToggle: () => void; onGrade: (score: number, feedback: string) => Promise<void> }) {
  const [score, setScore] = useState(submission.score?.toString() ?? "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const graded = submission.score !== null;
  /**
   * Implementa la operación submitGrade dentro de este módulo.
   */
  const submitGrade = () => {
    const numericScore = Number(score);
    if (!Number.isInteger(numericScore) || numericScore < 0 || numericScore > maxScore) {
      Alert.alert("Calificación no válida", `Ingresá un número entero entre 0 y ${maxScore}.`);
      return;
    }
    onGrade(numericScore, feedback);
  };
  return <View style={styles.submissionCard}><Pressable accessibilityRole="button" onPress={onToggle} style={({ pressed }) => [styles.submissionHeader, pressed && styles.pressed]}><View style={styles.avatar}><Text style={styles.avatarText}>{submission.studentName.charAt(0)}</Text></View><View style={styles.flex}><Text style={styles.studentName}>{submission.studentName}</Text><View style={styles.fileLine}><MaterialIcons name="description" size={14} color={brand.navyMid} /><Text style={styles.fileName}>{submission.fileName}</Text></View><Text style={styles.submittedAt}>{submission.submittedAt ? `Entregado ${new Date(submission.submittedAt).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}` : "Entrega registrada"}</Text></View>{graded ? <View style={styles.gradeChip}><Text style={styles.gradeValue}>{submission.score}/{maxScore}</Text><Text style={styles.gradeLabel}>calificada</Text></View> : <View style={styles.reviewChip}><Text style={styles.reviewText}>Por revisar</Text></View>}<MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={22} color={brand.muted} /></Pressable>{expanded && <View style={styles.reviewForm}><Text style={styles.formLabel}>Calificación sobre {maxScore}</Text><TextInput value={score} onChangeText={setScore} keyboardType="number-pad" placeholder="Ej. 8" placeholderTextColor={brand.muted} style={styles.scoreInput} maxLength={3} /><Text style={styles.formLabel}>Devolución para el alumno</Text><TextInput value={feedback} onChangeText={setFeedback} placeholder="Escribí una observación clara y constructiva…" placeholderTextColor={brand.muted} style={styles.feedbackInput} multiline textAlignVertical="top" maxLength={3000} /><Pressable accessibilityRole="button" disabled={saving} onPress={submitGrade} style={({ pressed }) => [styles.gradeButton, saving && styles.disabled, pressed && styles.pressed]}><Text style={styles.gradeButtonText}>{saving ? "Guardando…" : graded ? "Actualizar devolución" : "Calificar y enviar devolución"}</Text><MaterialIcons name="send" size={19} color={brand.navy} /></Pressable></View>}</View>;
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 20, paddingBottom: 34 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 18, fontWeight: "800" },
  topSpacer: { width: 36 },
  hero: { backgroundColor: brand.navy, borderRadius: 21, gap: 6, padding: 21 },
  heroEyebrow: { color: "#B9C8DA", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  heroTitle: { color: brand.white, fontSize: 22, fontWeight: "800", lineHeight: 29 },
  heroText: { color: "#D8E3EE", fontSize: 11, lineHeight: 17, marginTop: 4 },
  attachmentChip: { alignItems: "center", alignSelf: "flex-start", backgroundColor: brand.yellow, borderRadius: 9, flexDirection: "row", gap: 4, marginTop: 8, paddingHorizontal: 8, paddingVertical: 6 },
  attachmentChipText: { color: brand.navy, fontSize: 10, fontWeight: "800" },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { color: brand.navy, fontSize: 17, fontWeight: "800" },
  sectionCaption: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  count: { backgroundColor: brand.navy, borderRadius: 11, color: brand.white, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 },
  submissionCard: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, overflow: "hidden" },
  submissionHeader: { alignItems: "center", flexDirection: "row", gap: 10, padding: 13 },
  avatar: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  avatarText: { color: brand.navyMid, fontSize: 13, fontWeight: "800" },
  flex: { flex: 1 },
  studentName: { color: brand.text, fontSize: 13, fontWeight: "800" },
  fileLine: { alignItems: "center", flexDirection: "row", gap: 3, marginTop: 3 },
  fileName: { color: brand.navyMid, flex: 1, fontSize: 10, fontWeight: "700" },
  submittedAt: { color: brand.muted, fontSize: 10, marginTop: 3 },
  reviewChip: { backgroundColor: "#FFF6D7", borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5 },
  reviewText: { color: "#9A6D08", fontSize: 9, fontWeight: "800" },
  gradeChip: { alignItems: "center", backgroundColor: "#EAF6F1", borderRadius: 9, minWidth: 47, paddingHorizontal: 6, paddingVertical: 5 },
  gradeValue: { color: brand.green, fontSize: 12, fontWeight: "800" },
  gradeLabel: { color: brand.green, fontSize: 8, fontWeight: "700", marginTop: 1 },
  reviewForm: { borderTopColor: brand.silver, borderTopWidth: 1, gap: 8, padding: 13 },
  formLabel: { color: brand.navy, fontSize: 11, fontWeight: "800", marginTop: 2 },
  scoreInput: { backgroundColor: brand.page, borderColor: brand.silver, borderRadius: 11, borderWidth: 1, color: brand.text, fontSize: 13, minHeight: 43, paddingHorizontal: 12 },
  feedbackInput: { backgroundColor: brand.page, borderColor: brand.silver, borderRadius: 11, borderWidth: 1, color: brand.text, fontSize: 12, minHeight: 88, padding: 11 },
  gradeButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 12, flexDirection: "row", justifyContent: "space-between", marginTop: 4, minHeight: 48, paddingHorizontal: 13 },
  gradeButtonText: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  emptyList: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 18, gap: 7, padding: 23 },
  emptyListTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  emptyListText: { color: brand.muted, fontSize: 11, lineHeight: 16, textAlign: "center" },
  loading: { alignItems: "center", flex: 1, gap: 9, justifyContent: "center" },
  loadingText: { color: brand.muted, fontSize: 12, fontWeight: "700" },
  empty: { alignItems: "center", flex: 1, gap: 14, justifyContent: "center", padding: 24 },
  emptyTitle: { color: brand.navy, fontSize: 17, fontWeight: "800" },
  secondaryButton: { borderColor: brand.silver, borderRadius: 12, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 11 },
  secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
