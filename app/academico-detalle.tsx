/**
 * @archivo app/academico-detalle.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { academicItemById } from "@/lib/student-academic-demo";

/**
 * Implementa la operación AcademicDetailScreen dentro de este módulo.
 */
export default function AcademicDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const item = useMemo(() => academicItemById(params.id), [params.id]);
  const [attachmentAdded, setAttachmentAdded] = useState(false);

  if (!item) {
    return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.empty}><Text style={styles.emptyTitle}>No encontramos esta actividad.</Text><Pressable onPress={() => router.back()} style={styles.secondaryButton}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;
  }

  const isPractical = item.type === "practical_work";
  const isGraded = item.status === "graded";
  const isPending = item.status === "pending_submission";
  const statusText = isGraded ? `Calificada · ${item.scale}` : isPending ? "Pendiente de entrega" : item.status === "submitted" ? "Entregado · En corrección" : "Evaluación programada";
  const statusColor = isGraded ? brand.green : isPending ? "#AF7600" : item.status === "submitted" ? brand.navyMid : brand.muted;
  const statusBackground = isGraded ? "#EAF6F1" : isPending ? "#FFF6D7" : item.status === "submitted" ? brand.ice : "#F2F4F7";

  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>{isPractical ? "Trabajo práctico" : "Evaluación"}</Text><View style={styles.topSpacer} /></View><View style={styles.heroCard}><Text style={styles.heroEyebrow}>{item.subject.toUpperCase()}</Text><Text style={styles.heroTitle}>{item.title}</Text><Text style={styles.heroDate}>{item.dateLabel}</Text><View style={[styles.statusChip, { backgroundColor: statusBackground }]}><Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text></View></View><Section title="Consigna"><Text style={styles.bodyText}>{item.description}</Text></Section>{item.dueLabel && <Section title="Entrega"><View style={styles.deliveryCard}><MaterialIcons name="event" size={21} color={isPending ? "#AF7600" : brand.navyMid} /><View style={styles.deliveryCopy}><Text style={styles.deliveryTitle}>{item.dueLabel}</Text><Text style={styles.deliveryText}>{isPending ? "Todavía no registramos una entrega." : item.attachmentName ?? "Entrega registrada"}</Text></View></View>{isPending && <Pressable onPress={() => setAttachmentAdded((value) => !value)} style={({ pressed }) => [styles.attachment, attachmentAdded && styles.attachmentAdded, pressed && styles.pressed]}><MaterialIcons name={attachmentAdded ? "description" : "attach-file"} size={21} color={attachmentAdded ? brand.green : brand.navyMid} /><View style={styles.attachmentCopy}><Text style={styles.attachmentTitle}>{attachmentAdded ? "tp2_biblioteca.pdf" : "Adjuntar entrega"}</Text><Text style={styles.attachmentText}>{attachmentAdded ? "Archivo listo para enviar" : "Demostración: se conectará al selector de archivos"}</Text></View><MaterialIcons name={attachmentAdded ? "check-circle" : "add"} size={21} color={attachmentAdded ? brand.green : brand.navy} /></Pressable>}{isPending && attachmentAdded && <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.submitButton, pressed && styles.pressed]}><Text style={styles.submitText}>Simular entrega</Text><MaterialIcons name="send" size={19} color={brand.navy} /></Pressable>}</Section>}{item.feedback && <Section title="Devolución del docente"><View style={styles.feedback}><MaterialIcons name="format-quote" size={24} color={brand.navyMid} /><Text style={styles.feedbackText}>{item.feedback}</Text></View></Section>}</ScrollView></ScreenContainer>;
}

/**
 * Implementa la operación Section dentro de este módulo.
 */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  content: { gap: 20, padding: 20, paddingBottom: 34 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 17, fontWeight: "700" },
  topSpacer: { width: 36 },
  heroCard: { backgroundColor: brand.navy, borderRadius: 20, gap: 8, padding: 20 },
  heroEyebrow: { color: "#B8C8DB", fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  heroTitle: { color: brand.white, fontSize: 21, fontWeight: "700", lineHeight: 28 },
  heroDate: { color: "#D1DCE9", fontSize: 12 },
  statusChip: { alignSelf: "flex-start", borderRadius: 10, marginTop: 6, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontSize: 11, fontWeight: "800" },
  section: { gap: 10 },
  sectionTitle: { color: brand.navy, fontSize: 16, fontWeight: "700" },
  bodyText: { color: brand.muted, fontSize: 13, lineHeight: 20 },
  deliveryCard: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 15, flexDirection: "row", gap: 11, padding: 14 },
  deliveryCopy: { flex: 1 },
  deliveryTitle: { color: brand.navy, fontSize: 13, fontWeight: "700" },
  deliveryText: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  attachment: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 14, borderStyle: "dashed", borderWidth: 1.5, flexDirection: "row", gap: 10, padding: 13 },
  attachmentAdded: { backgroundColor: "#EAF6F1", borderColor: brand.green, borderStyle: "solid" },
  attachmentCopy: { flex: 1 },
  attachmentTitle: { color: brand.text, fontSize: 13, fontWeight: "700" },
  attachmentText: { color: brand.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  submitButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 13, flexDirection: "row", justifyContent: "space-between", minHeight: 51, paddingHorizontal: 15 },
  submitText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  feedback: { alignItems: "flex-start", backgroundColor: brand.ice, borderRadius: 16, flexDirection: "row", gap: 10, padding: 15 },
  feedbackText: { color: brand.text, flex: 1, fontSize: 13, fontStyle: "italic", lineHeight: 20 },
  empty: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center", padding: 24 },
  emptyTitle: { color: brand.navy, fontSize: 16, fontWeight: "700", textAlign: "center" },
  secondaryButton: { borderColor: brand.silver, borderRadius: 12, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 11 },
  secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});

