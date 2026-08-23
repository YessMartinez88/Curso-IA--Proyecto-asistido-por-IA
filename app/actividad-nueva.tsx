/**
 * @archivo app/actividad-nueva.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { trpc } from "@/lib/trpc";

type Attachment = { fileName: string; mimeType: string; sizeBytes: number; fileBase64: string };

/**
 * Implementa la operación NewActivityScreen dentro de este módulo.
 */
export default function NewActivityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ commissionId?: string; subject?: string }>();
  const commissionId = Number(params.commissionId);
  const [type, setType] = useState<"evaluation" | "practical_work">("practical_work");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const createMutation = trpc.activities.create.useMutation();

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
        Alert.alert("Archivo no admitido", "Seleccioná un archivo de hasta 5 MB.");
        return;
      }
      const fileBase64 = asset.base64 ?? await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
      setAttachment({ fileName: asset.name, mimeType: asset.mimeType ?? "application/octet-stream", sizeBytes, fileBase64 });
    } catch {
      Alert.alert("No pudimos adjuntar el archivo", "Intentá nuevamente con otro documento.");
    }
  };

  /**
   * Implementa la operación publish dentro de este módulo.
   */
  const publish = async () => {
    if (!title.trim() || !description.trim() || !dueDate.trim()) {
      Alert.alert("Completá la actividad", "Ingresá nombre, descripción y fecha límite.");
      return;
    }
    const parsedDate = new Date(`${dueDate.trim()}T23:59:00`);
    if (Number.isNaN(parsedDate.getTime())) {
      Alert.alert("Fecha no válida", "Usá el formato AAAA-MM-DD, por ejemplo 2026-08-30.");
      return;
    }
    try {
      await createMutation.mutateAsync({ commissionId, type, title: title.trim(), description: description.trim(), dueAt: parsedDate.toISOString(), maxScore: 10, attachment });
      Alert.alert("Actividad publicada", "El grupo ya puede consultar la consigna y la fecha límite.");
      router.replace({ pathname: "/actividades-docente", params: { commissionId: String(commissionId), subject: params.subject ?? "" } } as Href);
    } catch (error) {
      Alert.alert("No pudimos publicar", error instanceof Error ? error.message : "Intentá nuevamente.");
    }
  };

  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}><View style={styles.topBar}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}><MaterialIcons name="arrow-back" size={22} color={brand.navy} /></Pressable><Text style={styles.headerTitle}>Nueva actividad</Text><View style={styles.topSpacer} /></View><View style={styles.context}><MaterialIcons name="school" size={20} color={brand.navyMid} /><View style={styles.flex}><Text style={styles.contextLabel}>CLASE SELECCIONADA</Text><Text style={styles.contextTitle}>{params.subject ?? "Mi clase"}</Text></View></View><Text style={styles.sectionTitle}>Tipo de actividad</Text><View style={styles.typeSwitch}>{(["practical_work", "evaluation"] as const).map((item) => <Pressable key={item} accessibilityRole="button" onPress={() => setType(item)} style={({ pressed }) => [styles.typeOption, type === item && styles.typeOptionActive, pressed && styles.pressed]}><MaterialIcons name={item === "practical_work" ? "folder-open" : "quiz"} size={19} color={type === item ? brand.white : brand.navyMid} /><Text style={[styles.typeText, type === item && styles.typeTextActive]}>{item === "practical_work" ? "Trabajo práctico" : "Evaluación"}</Text></Pressable>)}</View><View style={styles.form}><Field label="Nombre de la actividad"><TextInput value={title} onChangeText={setTitle} placeholder="Ej. TP 2 · Modelo relacional" placeholderTextColor={brand.muted} style={styles.input} maxLength={180} returnKeyType="next" /></Field><Field label="Descripción / consigna"><TextInput value={description} onChangeText={setDescription} placeholder="Explicá objetivos, entregables y criterios…" placeholderTextColor={brand.muted} style={[styles.input, styles.descriptionInput]} multiline textAlignVertical="top" maxLength={5000} /></Field><Field label="Fecha límite"><TextInput value={dueDate} onChangeText={setDueDate} placeholder="2026-08-30" placeholderTextColor={brand.muted} style={styles.input} autoCapitalize="none" keyboardType="numbers-and-punctuation" /></Field><Field label="Archivo adjunto (opcional)"><Pressable accessibilityRole="button" onPress={pickAttachment} style={({ pressed }) => [styles.attachment, attachment && styles.attachmentAdded, pressed && styles.pressed]}><MaterialIcons name={attachment ? "description" : "attach-file"} size={22} color={attachment ? brand.green : brand.navyMid} /><View style={styles.flex}><Text style={styles.attachmentTitle}>{attachment ? attachment.fileName : "Adjuntar material"}</Text><Text style={styles.attachmentText}>{attachment ? `${Math.ceil(attachment.sizeBytes / 1024)} KB · listo para publicar` : "PDF, documento, imagen o archivo comprimido · hasta 5 MB"}</Text></View><MaterialIcons name={attachment ? "check-circle" : "add"} size={21} color={attachment ? brand.green : brand.navy} /></Pressable></Field></View><Pressable accessibilityRole="button" disabled={createMutation.isPending} onPress={publish} style={({ pressed }) => [styles.publishButton, createMutation.isPending && styles.disabled, pressed && styles.pressed]}><Text style={styles.publishText}>{createMutation.isPending ? "Publicando…" : "Publicar actividad"}</Text><MaterialIcons name="publish" size={21} color={brand.navy} /></Pressable><Text style={styles.helpText}>La actividad quedará asociada exclusivamente a esta clase y estará disponible para el grupo al publicarla.</Text></ScrollView></ScreenContainer>;
}

/**
 * Implementa la operación Field dentro de este módulo.
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 20, paddingBottom: 34 },
  topBar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  backButton: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 18, borderWidth: 1, height: 36, justifyContent: "center", width: 36 },
  headerTitle: { color: brand.navy, fontSize: 18, fontWeight: "800" },
  topSpacer: { width: 36 },
  context: { alignItems: "center", backgroundColor: brand.ice, borderRadius: 15, flexDirection: "row", gap: 10, padding: 14 },
  flex: { flex: 1 },
  contextLabel: { color: brand.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.7 },
  contextTitle: { color: brand.navy, fontSize: 14, fontWeight: "800", marginTop: 3 },
  sectionTitle: { color: brand.navy, fontSize: 16, fontWeight: "800" },
  typeSwitch: { flexDirection: "row", gap: 9 },
  typeOption: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 14, borderWidth: 1, flex: 1, flexDirection: "row", gap: 7, justifyContent: "center", minHeight: 47, paddingHorizontal: 8 },
  typeOptionActive: { backgroundColor: brand.navy, borderColor: brand.navy },
  typeText: { color: brand.navyMid, fontSize: 11, fontWeight: "800" },
  typeTextActive: { color: brand.white },
  form: { gap: 15 },
  field: { gap: 7 },
  fieldLabel: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  input: { backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 13, borderWidth: 1, color: brand.text, fontSize: 13, minHeight: 48, paddingHorizontal: 13, paddingVertical: 11 },
  descriptionInput: { minHeight: 125 },
  attachment: { alignItems: "center", backgroundColor: brand.white, borderColor: brand.silver, borderRadius: 14, borderStyle: "dashed", borderWidth: 1.5, flexDirection: "row", gap: 10, minHeight: 67, padding: 13 },
  attachmentAdded: { backgroundColor: "#EAF6F1", borderColor: brand.green, borderStyle: "solid" },
  attachmentTitle: { color: brand.text, fontSize: 12, fontWeight: "800" },
  attachmentText: { color: brand.muted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  publishButton: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 16 },
  publishText: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  helpText: { color: brand.muted, fontSize: 11, lineHeight: 16, textAlign: "center" },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.985 }] },
});
