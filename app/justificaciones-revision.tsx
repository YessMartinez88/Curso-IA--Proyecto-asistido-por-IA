/**
 * @archivo app/justificaciones-revision.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { getApiBaseUrl } from "@/constants/oauth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { useDemoRole } from "@/lib/demo-role-context";
import { trpc } from "@/lib/trpc";

type Justification = {
  id: number;
  studentName: string;
  subject: string;
  classroom: string | null;
  absenceDateLabel: string;
  reason: string;
  comment: string | null;
  attachmentName: string | null;
  attachmentUrl: string | null;
  status: "pending" | "approved" | "rejected";
  reviewerName: string | null;
  reviewComment: string | null;
  createdAt: string | null;
};

/**
 * Implementa la operación JustificationReviewScreen dentro de este módulo.
 */
export default function JustificationReviewScreen() {
  const router = useRouter();
  const { role } = useDemoRole();
  const isTeacher = role === "docente";
  const teacherQuery = trpc.justifications.teacherList.useQuery(undefined, { enabled: isTeacher });
  const administrativeQuery = trpc.justifications.administrativeList.useQuery(undefined, { enabled: role === "administrativo" });
  const utils = trpc.useUtils();
  const reviewMutation = trpc.justifications.review.useMutation({ onSuccess: () => { utils.justifications.teacherList.invalidate(); utils.justifications.administrativeList.invalidate(); } });
  const [openId, setOpenId] = useState<number | null>(null);
  const items = (isTeacher ? teacherQuery.data : administrativeQuery.data ?? []) as Justification[];
  const loading = isTeacher ? teacherQuery.isLoading : administrativeQuery.isLoading;
  const reviewerRole = isTeacher ? "docente" : "administrativo";

  if (role !== "docente" && role !== "administrativo") return <ScreenContainer className="flex-1" containerClassName="bg-background"><View style={styles.empty}><Text style={styles.emptyTitle}>Esta vista está disponible para revisión institucional.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;

  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>Justificaciones</Text><View style={styles.topSpacer} /></View><View style={styles.hero}><Text style={styles.heroEyebrow}>{isTeacher ? "REVISIÓN DOCENTE" : "VALIDACIÓN ADMINISTRATIVA"}</Text><Text style={styles.heroTitle}>{isTeacher ? "Inasistencias de mis comisiones" : "Solicitudes de inasistencia"}</Text><Text style={styles.heroText}>{isTeacher ? "Validá las solicitudes del grupo asignado." : "Consultá y resolvé las justificaciones institucionales."}</Text></View><View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Solicitudes recibidas</Text><Text style={styles.sectionCaption}>Abrí cada solicitud para revisar su comentario y constancia.</Text></View><Text style={styles.count}>{items.length}</Text></View>{loading ? <View style={styles.loading}><ActivityIndicator color={brand.navy} /><Text style={styles.loadingText}>Cargando solicitudes…</Text></View> : items.length === 0 ? <View style={styles.emptyList}><MaterialIcons name="inbox" size={31} color={brand.muted} /><Text style={styles.emptyListTitle}>No hay justificaciones</Text><Text style={styles.emptyListText}>Las solicitudes enviadas por alumnos aparecerán aquí.</Text></View> : items.map((item) => <ReviewCard key={item.id} item={item} expanded={openId === item.id} saving={reviewMutation.isPending} onToggle={() => setOpenId((current) => current === item.id ? null : item.id)} onReview={async (decision, reviewComment) => { try { await reviewMutation.mutateAsync({ justificationId: item.id, decision, reviewComment, reviewerRole }); Alert.alert(decision === "approved" ? "Justificación aprobada" : "Justificación rechazada", "La decisión quedó registrada para el alumno."); setOpenId(null); } catch (error) { Alert.alert("No pudimos actualizar", error instanceof Error ? error.message : "Intentá nuevamente."); } }} />)}</ScrollView></ScreenContainer>;
}

/**
 * Implementa la operación ReviewCard dentro de este módulo.
 */
function ReviewCard({ item, expanded, saving, onToggle, onReview }: { item: Justification; expanded: boolean; saving: boolean; onToggle: () => void; onReview: (decision: "approved" | "rejected", reviewComment: string) => Promise<void> }) {
  const [reviewComment, setReviewComment] = useState(item.reviewComment ?? "");
  const appearance = item.status === "approved" ? styles.approved : item.status === "rejected" ? styles.rejected : styles.pending;
  const label = item.status === "approved" ? "Aprobada" : item.status === "rejected" ? "Rechazada" : "Pendiente";
  /**
   * Implementa la operación openAttachment dentro de este módulo.
   */
  const openAttachment = async () => {
    if (!item.attachmentUrl) return;
    const url = item.attachmentUrl.startsWith("http") ? item.attachmentUrl : `${getApiBaseUrl()}${item.attachmentUrl}`;
    await Linking.openURL(url);
  };
  return <View style={styles.card}><Pressable accessibilityRole="button" onPress={onToggle} style={({ pressed }) => [styles.cardHeader, pressed && styles.pressed]}><View style={styles.avatar}><Text style={styles.avatarText}>{item.studentName.charAt(0)}</Text></View><View style={styles.flex}><Text style={styles.studentName}>{item.studentName}</Text><Text style={styles.meta}>{item.subject} · {item.classroom ?? "Aula a confirmar"}</Text><Text style={styles.meta}>{item.absenceDateLabel} · {item.reason}</Text></View><View style={[styles.status, appearance]}><Text style={styles.statusText}>{label}</Text></View><MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={22} color={brand.muted} /></Pressable>{expanded && <View style={styles.cardBody}><Text style={styles.bodyLabel}>Comentario del alumno</Text><Text style={styles.comment}>{item.comment || "No agregó un comentario."}</Text>{item.attachmentName && <Pressable onPress={openAttachment} style={({ pressed }) => [styles.attachment, pressed && styles.pressed]}><MaterialIcons name="description" size={19} color={brand.navyMid} /><View style={styles.flex}><Text style={styles.attachmentTitle}>{item.attachmentName}</Text><Text style={styles.attachmentText}>Abrir constancia adjunta</Text></View><MaterialIcons name="open-in-new" size={18} color={brand.navy} /></Pressable>}{item.status === "pending" ? <><Text style={styles.bodyLabel}>Observación para el alumno</Text><TextInput value={reviewComment} onChangeText={setReviewComment} placeholder="Opcional: indicá el motivo de la decisión…" placeholderTextColor={brand.muted} style={styles.commentInput} multiline textAlignVertical="top" maxLength={3000} /><View style={styles.actions}><Pressable disabled={saving} onPress={() => onReview("rejected", reviewComment)} style={({ pressed }) => [styles.rejectButton, saving && styles.disabled, pressed && styles.pressed]}><Text style={styles.rejectText}>Rechazar</Text></Pressable><Pressable disabled={saving} onPress={() => onReview("approved", reviewComment)} style={({ pressed }) => [styles.approveButton, saving && styles.disabled, pressed && styles.pressed]}><Text style={styles.approveText}>{saving ? "Guardando…" : "Validar"}</Text><MaterialIcons name="check" size={18} color={brand.navy} /></Pressable></View></> : <View style={styles.resolution}><Text style={styles.bodyLabel}>Decisión de {item.reviewerName ?? "revisión"}</Text><Text style={styles.comment}>{item.reviewComment || "Sin observaciones adicionales."}</Text></View>}</View>}</View>;
}

const styles = StyleSheet.create({
  content: { gap: 16, padding: 20, paddingBottom: 34 }, topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 }, headerTitle: { color: brand.navy, fontSize: 18, fontWeight: "800" }, topSpacer: { width: 36 }, hero: { backgroundColor: brand.navy, borderRadius: 21, gap: 6, padding: 21 }, heroEyebrow: { color: "#B9C8DA", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 }, heroTitle: { color: brand.white, fontSize: 22, fontWeight: "800" }, heroText: { color: "#D8E3EE", fontSize: 12, lineHeight: 18 }, sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, sectionTitle: { color: brand.navy, fontSize: 17, fontWeight: "800" }, sectionCaption: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, count: { backgroundColor: brand.navy, borderRadius: 11, color: brand.white, fontSize: 11, fontWeight: "800", overflow: "hidden", paddingHorizontal: 8, paddingVertical: 5 }, card: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 17, borderWidth: 1, overflow: "hidden" }, cardHeader: { alignItems: "center", flexDirection: "row", gap: 10, padding: 13 }, avatar: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 18, height: 36, justifyContent: "center", width: 36 }, avatarText: { color: brand.navyMid, fontSize: 13, fontWeight: "800" }, flex: { flex: 1 }, studentName: { color: brand.text, fontSize: 13, fontWeight: "800" }, meta: { color: brand.muted, fontSize: 10, marginTop: 3 }, status: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 5 }, pending: { backgroundColor: "#FFF6D7" }, approved: { backgroundColor: "#EAF6F1" }, rejected: { backgroundColor: "#FBEAEA" }, statusText: { color: brand.navy, fontSize: 9, fontWeight: "800" }, cardBody: { borderTopColor: brand.silver, borderTopWidth: 1, gap: 8, padding: 13 }, bodyLabel: { color: brand.navy, fontSize: 11, fontWeight: "800", marginTop: 2 }, comment: { color: brand.text, fontSize: 12, lineHeight: 18 }, attachment: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 11, flexDirection: "row", gap: 9, padding: 11 }, attachmentTitle: { color: brand.navy, fontSize: 11, fontWeight: "800" }, attachmentText: { color: brand.muted, fontSize: 10, marginTop: 2 }, commentInput: { backgroundColor: brand.page, borderColor: brand.silver, borderRadius: 11, borderWidth: 1, color: brand.text, fontSize: 12, minHeight: 80, padding: 10 }, actions: { flexDirection: "row", gap: 9, marginTop: 3 }, rejectButton: { alignItems: "center", borderColor: brand.red, borderRadius: 11, borderWidth: 1, flex: 1, justifyContent: "center", minHeight: 45 }, rejectText: { color: brand.red, fontSize: 12, fontWeight: "800" }, approveButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 11, flex: 1, flexDirection: "row", gap: 5, justifyContent: "center", minHeight: 45 }, approveText: { color: brand.navy, fontSize: 12, fontWeight: "800" }, resolution: { backgroundColor: brand.ice, borderRadius: 10, gap: 4, padding: 10 }, loading: { alignItems: "center", gap: 9, paddingVertical: 32 }, loadingText: { color: brand.muted, fontSize: 12, fontWeight: "700" }, emptyList: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 18, gap: 7, padding: 23 }, emptyListTitle: { color: brand.navy, fontSize: 14, fontWeight: "800" }, emptyListText: { color: brand.muted, fontSize: 11, lineHeight: 16, textAlign: "center" }, empty: { alignItems: "center", flex: 1, gap: 14, justifyContent: "center", padding: 24 }, emptyTitle: { color: brand.navy, fontSize: 17, fontWeight: "800", textAlign: "center" }, secondaryButton: { borderColor: brand.silver, borderRadius: 12, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 11 }, secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "800" }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
