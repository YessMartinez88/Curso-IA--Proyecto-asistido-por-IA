/**
 * @archivo app/justificacion.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { attendanceRecords, canRequestJustification } from "@/lib/student-attendance-demo";
import { trpc } from "@/lib/trpc";

const reasons = ["Salud", "Motivo personal", "Actividad institucional"];
type Attachment = { fileName: string; mimeType: string; sizeBytes: number; fileBase64: string };

/**
 * Implementa la operación JustificationScreen dentro de este módulo.
 */
export default function JustificationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ recordId?: string }>();
  const record = useMemo(() => attendanceRecords.find((item) => item.id === params.recordId) ?? attendanceRecords.find(canRequestJustification), [params.recordId]);
  const commissionsQuery = trpc.student.commissions.useQuery();
  const createMutation = trpc.justifications.create.useMutation();
  const [reason, setReason] = useState(reasons[0]);
  const [comment, setComment] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const commission = useMemo(() => {
    if (!record) return undefined;
    return (commissionsQuery.data ?? []).find((item) => item.subject?.toLowerCase() === record.subject.toLowerCase()) ?? commissionsQuery.data?.[0];
  }, [commissionsQuery.data, record]);

  /**
   * Implementa la operación pickAttachment dentro de este módulo.
   */
  const pickAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true, base64: Platform.OS === "web" });
      if (result.canceled) return;
      const asset = result.assets[0];
      const sizeBytes = asset.size ?? 0;
      if (!sizeBytes || sizeBytes > 5 * 1024 * 1024) {
        Alert.alert("Archivo no admitido", "Seleccioná una constancia de hasta 5 MB.");
        return;
      }
      const fileBase64 = asset.base64 ?? await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      setAttachment({ fileName: asset.name, mimeType: asset.mimeType ?? "application/octet-stream", sizeBytes, fileBase64 });
    } catch {
      Alert.alert("No pudimos adjuntar la constancia", "Intentá nuevamente con otro archivo.");
    }
  };

  /**
   * Implementa la operación submit dentro de este módulo.
   */
  const submit = async () => {
    if (!record || !commission) {
      Alert.alert("Sin comisión disponible", "Primero prepará o seleccioná una comisión activa para poder enviar la justificación.");
      return;
    }
    if (!comment.trim() && !attachment) {
      Alert.alert("Completá la justificación", "Escribí un comentario o adjuntá una constancia para continuar.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        recordReference: record.id,
        commissionId: commission.id,
        subject: record.subject,
        classroom: record.classroom,
        absenceDateLabel: record.date,
        reason,
        comment: comment.trim() || null,
        attachment,
      });
      setSubmitted(true);
    } catch (error) {
      Alert.alert("No pudimos enviar", error instanceof Error ? error.message : "Intentá nuevamente.");
    }
  };

  if (!record) return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.center}><Text style={styles.emptyTitle}>No encontramos una inasistencia para justificar.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;
  if (submitted) return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.successPage}><View style={styles.successIcon}><MaterialIcons name="check" size={38} color={brand.green} /></View><Text style={styles.successTitle}>Justificación enviada</Text><Text style={styles.successText}>Tu solicitud para {record.subject} quedó en revisión. El docente o el área administrativa podrán validarla.</Text><View style={styles.reviewCard}><Text style={styles.reviewLabel}>ESTADO</Text><View style={styles.reviewStatus}><View style={styles.reviewDot} /><Text style={styles.reviewStatusText}>En revisión</Text></View></View><Pressable onPress={() => router.replace("/historial" as never)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Volver al historial</Text><MaterialIcons name="arrow-forward" size={20} color={brand.navy} /></Pressable></View></ScreenContainer>;

  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>Justificar inasistencia</Text><View style={styles.topSpacer} /></View><View style={styles.recordCard}><View style={styles.recordIcon}><MaterialIcons name="event-busy" size={22} color={brand.red} /></View><View style={styles.recordCopy}><Text style={styles.recordTitle}>{record.subject}</Text><Text style={styles.recordDetail}>{record.date} · {record.classroom}</Text></View></View><View style={styles.infoBox}><MaterialIcons name="info-outline" size={20} color={brand.navyMid} /><Text style={styles.infoText}>Explicá brevemente el motivo y agregá una constancia si corresponde. Docente o Administración revisarán tu solicitud.</Text></View><View style={styles.formSection}><Text style={styles.label}>Motivo</Text><View style={styles.reasonRow}>{reasons.map((item) => <Pressable key={item} onPress={() => setReason(item)} style={({ pressed }) => [styles.reason, reason === item && styles.reasonActive, pressed && styles.pressed]}><Text style={[styles.reasonText, reason === item && styles.reasonTextActive]}>{item}</Text></Pressable>)}</View></View><View style={styles.formSection}><Text style={styles.label}>Comentario</Text><TextInput multiline numberOfLines={5} onChangeText={setComment} placeholder="Contá brevemente por qué no pudiste asistir…" placeholderTextColor={brand.muted} style={styles.commentInput} textAlignVertical="top" value={comment} maxLength={3000} /></View><View style={styles.formSection}><Text style={styles.label}>Constancia adjunta</Text><Pressable onPress={pickAttachment} style={({ pressed }) => [styles.attachment, attachment && styles.attachmentAdded, pressed && styles.pressed]}><MaterialIcons name={attachment ? "description" : "attach-file"} size={22} color={attachment ? brand.green : brand.navyMid} /><View style={styles.attachmentCopy}><Text style={styles.attachmentTitle}>{attachment ? attachment.fileName : "Adjuntar constancia"}</Text><Text style={styles.attachmentDetail}>{attachment ? `${Math.ceil(attachment.sizeBytes / 1024)} KB · adjunto listo para enviar` : "PDF, documento o imagen · hasta 5 MB"}</Text></View><MaterialIcons name={attachment ? "check-circle" : "add"} size={21} color={attachment ? brand.green : brand.navy} /></Pressable></View><Pressable disabled={createMutation.isPending} onPress={submit} style={({ pressed }) => [styles.primaryButton, createMutation.isPending && styles.disabled, pressed && styles.pressed]}><Text style={styles.primaryText}>{createMutation.isPending ? "Enviando…" : "Enviar justificación"}</Text><MaterialIcons name="send" size={19} color={brand.navy} /></Pressable></ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 20, paddingBottom: 32 }, topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 }, headerTitle: { color: brand.navy, fontSize: 17, fontWeight: "700" }, topSpacer: { width: 36 }, recordCard: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, padding: 14 }, recordIcon: { alignItems: "center", backgroundColor: "#FBEAEA", borderRadius: 11, height: 43, justifyContent: "center", width: 43 }, recordCopy: { flex: 1 }, recordTitle: { color: brand.text, fontSize: 14, fontWeight: "700" }, recordDetail: { color: brand.muted, fontSize: 12, marginTop: 4 }, infoBox: { alignItems: "flex-start", backgroundColor: brand.ice, borderRadius: 15, flexDirection: "row", gap: 10, padding: 14 }, infoText: { color: brand.muted, flex: 1, fontSize: 12, lineHeight: 18 }, formSection: { gap: 9 }, label: { color: brand.navy, fontSize: 14, fontWeight: "700" }, reasonRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, reason: { borderColor: brand.silver, borderRadius: 11, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 9 }, reasonActive: { backgroundColor: brand.navy, borderColor: brand.navy }, reasonText: { color: brand.muted, fontSize: 12, fontWeight: "700" }, reasonTextActive: { color: brand.white }, commentInput: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 13, borderWidth: 1, color: brand.text, fontSize: 13, minHeight: 114, padding: 12 }, attachment: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 14, borderStyle: "dashed", borderWidth: 1.5, flexDirection: "row", gap: 10, padding: 13 }, attachmentAdded: { backgroundColor: "#EAF6F1", borderColor: brand.green, borderStyle: "solid" }, attachmentCopy: { flex: 1 }, attachmentTitle: { color: brand.text, fontSize: 13, fontWeight: "700" }, attachmentDetail: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, primaryButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 16 }, primaryText: { color: brand.navy, fontSize: 14, fontWeight: "800" }, successPage: { alignItems: "center", flex: 1, justifyContent: "center", padding: 30 }, successIcon: { alignItems: "center", backgroundColor: "#EAF6F1", borderRadius: 40, height: 80, justifyContent: "center", width: 80 }, successTitle: { color: brand.navy, fontSize: 24, fontWeight: "800", marginTop: 18 }, successText: { color: brand.muted, fontSize: 14, lineHeight: 21, marginTop: 9, textAlign: "center" }, reviewCard: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 15, gap: 7, marginTop: 22, padding: 14, width: "100%" }, reviewLabel: { color: brand.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.7 }, reviewStatus: { alignItems: "center", flexDirection: "row", gap: 6 }, reviewDot: { backgroundColor: brand.yellow, borderRadius: 4, height: 8, width: 8 }, reviewStatusText: { color: brand.navy, fontSize: 13, fontWeight: "800" }, center: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center", padding: 24 }, emptyTitle: { color: brand.navy, fontSize: 16, fontWeight: "700", textAlign: "center" }, secondaryButton: { borderColor: brand.silver, borderRadius: 12, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 11 }, secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "700" }, disabled: { opacity: 0.55 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
