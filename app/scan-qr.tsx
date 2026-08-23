/**
 * @archivo app/scan-qr.tsx
 * @descripcion Pantalla o ruta contextual de la aplicación móvil.
 */
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from "expo-camera";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { brand } from "@/constants/brand";
import { trpc } from "@/lib/trpc";
import { DEMO_STUDENT_NAME } from "@/shared/attendance-flow";
import { canProcessQrScan } from "@/shared/qr-scan-flow";

/**
 * Implementa la operación ScanQrScreen dentro de este módulo.
 */
export default function ScanQrScreen() {
  const router = useRouter();
  const { commissionId } = useLocalSearchParams<{ commissionId?: string }>();
  const selectedCommissionId = Number(commissionId);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const attendanceQuery = trpc.student.attendanceState.useQuery({ commissionId: selectedCommissionId || 1 }, { enabled: Number.isFinite(selectedCommissionId) && selectedCommissionId > 0 });
  const checkInMutation = trpc.attendance.checkIn.useMutation();
  const sessionIsActive = Boolean(attendanceQuery.data?.activeSession);

  /**
   * Implementa la operación onBarcodeScanned dentro de este módulo.
   */
  async function onBarcodeScanned({ data }: BarcodeScanningResult) {
    if (!canProcessQrScan({ hasActiveSession: sessionIsActive, isProcessing: checkInMutation.isPending, isScanned: scanned })) return;
    setScanned(true);
    try {
      const result = await checkInMutation.mutateAsync({ qrToken: data, studentName: DEMO_STUDENT_NAME, expectedCommissionId: selectedCommissionId });
      if (result.outcome === "registered") {
        setMessage({ tone: "success", text: `Asistencia registrada para ${attendanceQuery.data?.commission.subject ?? "la clase seleccionada"}.` });
      } else if (result.outcome === "already_recorded") {
        setMessage({ tone: "error", text: "Ya registraste asistencia para esta sesión." });
      } else if (result.outcome === "wrong_commission") {
        setMessage({ tone: "error", text: "Este QR corresponde a otra comisión. Verificá la clase seleccionada." });
      } else if (result.outcome === "not_enrolled") {
        setMessage({ tone: "error", text: "No estás habilitado para registrar asistencia en esta comisión." });
      } else {
        setMessage({ tone: "error", text: "El QR venció o no es válido." });
      }
    } catch {
      setMessage({ tone: "error", text: "No fue posible validar el QR. Intentá nuevamente." });
    }
  }

  if (!permission) return <ScreenContainer className="items-center justify-center" containerClassName="bg-background"><ActivityIndicator color={brand.navy} /></ScreenContainer>;

  if (!permission.granted) return <ScreenContainer className="p-6" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.permissionWrap}><View style={styles.permissionIcon}><MaterialIcons name="photo-camera" size={34} color={brand.navy} /></View><Text style={styles.permissionTitle}>Necesitamos acceso a la cámara</Text><Text style={styles.permissionText}>La cámara se utiliza únicamente para leer el QR temporal de asistencia mostrado por tu docente.</Text><Pressable onPress={requestPermission} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Permitir cámara</Text><MaterialIcons name="camera-alt" size={21} color={brand.navy} /></Pressable><Pressable onPress={() => router.back()} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryText}>Volver</Text></Pressable></View></ScreenContainer>;

  if (message) return <ScreenContainer className="p-6" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.resultWrap}><View style={[styles.resultIcon, message.tone === "success" ? styles.resultSuccess : styles.resultError]}><MaterialIcons name={message.tone === "success" ? "check" : "priority-high"} size={36} color={message.tone === "success" ? brand.green : brand.red} /></View><Text style={styles.resultTitle}>{message.tone === "success" ? "Registro confirmado" : "No pudimos registrar"}</Text><Text style={styles.resultText}>{message.text}</Text>{message.tone === "success" && <Pressable onPress={() => router.replace("/historial" as Href)} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}><Text style={styles.primaryText}>Ver historial</Text><MaterialIcons name="history" size={21} color={brand.navy} /></Pressable>}<Pressable onPress={() => { setScanned(false); setMessage(null); }} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryText}>{message.tone === "success" ? "Escanear otra clase" : "Intentar nuevamente"}</Text></Pressable></View></ScreenContainer>;

  return <ScreenContainer className="flex-1" containerClassName="bg-background" edges={["top", "bottom", "left", "right"]}><View style={styles.scannerHeader}><Pressable accessibilityLabel="Cerrar escáner" onPress={() => router.back()} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><MaterialIcons name="close" size={22} color={brand.white} /></Pressable><View><Text style={styles.scannerEyebrow}>ESCÁNER DE ASISTENCIA</Text><Text style={styles.scannerTitle}>{attendanceQuery.data?.commission.subject ?? "Clase seleccionada"}</Text></View></View><View style={styles.cameraWrap}>{sessionIsActive ? <><CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={scanned || checkInMutation.isPending ? undefined : onBarcodeScanned} /><View pointerEvents="none" style={styles.overlay}><View style={styles.focusBox}><View style={styles.cornerTopLeft} /><View style={styles.cornerTopRight} /><View style={styles.cornerBottomLeft} /><View style={styles.cornerBottomRight} /></View><Text style={styles.scanHint}>Alineá el código QR dentro del marco</Text></View></> : <View style={styles.inactiveCamera}><MaterialIcons name="event-busy" size={47} color="#C8D5E4" /><Text style={styles.inactiveTitle}>No hay una clase activa</Text><Text style={styles.inactiveText}>Esperá a que el docente abra la sesión QR para esta comisión.</Text></View>}</View><View style={styles.bottomPanel}><View style={styles.sessionRow}><View style={[styles.sessionDot, sessionIsActive ? styles.sessionDotActive : styles.sessionDotIdle]} /><Text style={styles.sessionText}>{sessionIsActive ? "Sesión QR activa" : "Sesión QR no disponible"}</Text></View>{sessionIsActive ? <Text style={styles.bottomText}>El código se valida contra tu inscripción y la comisión seleccionada.</Text> : <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryText}>Volver a asistencia</Text></Pressable>}</View></ScreenContainer>;
}

const styles = StyleSheet.create({
  permissionWrap: { alignItems: "center", flex: 1, justifyContent: "center", gap: 15 },
  permissionIcon: { alignItems: "center", backgroundColor: brand.yellow, borderRadius: 24, height: 72, justifyContent: "center", width: 72 },
  permissionTitle: { color: brand.navy, fontSize: 22, fontWeight: "800", textAlign: "center" },
  permissionText: { color: brand.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  primaryButton: { alignItems: "center", alignSelf: "stretch", backgroundColor: brand.yellow, borderRadius: 14, flexDirection: "row", justifyContent: "space-between", minHeight: 53, paddingHorizontal: 16 },
  primaryText: { color: brand.navy, fontSize: 14, fontWeight: "800" },
  secondaryButton: { alignItems: "center", alignSelf: "stretch", borderColor: brand.silver, borderRadius: 14, borderWidth: 1, minHeight: 49, justifyContent: "center" },
  secondaryText: { color: brand.navy, fontSize: 13, fontWeight: "800" },
  resultWrap: { alignItems: "center", flex: 1, gap: 15, justifyContent: "center" },
  resultIcon: { alignItems: "center", borderRadius: 29, height: 82, justifyContent: "center", width: 82 },
  resultSuccess: { backgroundColor: "#EAF6F1" },
  resultError: { backgroundColor: "#FBEAEA" },
  resultTitle: { color: brand.navy, fontSize: 23, fontWeight: "800", textAlign: "center" },
  resultText: { color: brand.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  scannerHeader: { alignItems: "center", backgroundColor: brand.navy, flexDirection: "row", gap: 12, padding: 20 },
  closeButton: { alignItems: "center", backgroundColor: "#28496E", borderRadius: 18, height: 36, justifyContent: "center", width: 36 },
  scannerEyebrow: { color: "#B7C7DB", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  scannerTitle: { color: brand.white, fontSize: 16, fontWeight: "800", marginTop: 3 },
  cameraWrap: { backgroundColor: brand.navy, flex: 1, overflow: "hidden" },
  camera: { flex: 1 },
  overlay: { alignItems: "center", bottom: 0, justifyContent: "center", left: 0, position: "absolute", right: 0, top: 0 },
  focusBox: { height: 235, position: "relative", width: 235 },
  cornerTopLeft: { borderColor: brand.yellow, borderLeftWidth: 4, borderTopWidth: 4, height: 54, left: 0, position: "absolute", top: 0, width: 54 },
  cornerTopRight: { borderColor: brand.yellow, borderRightWidth: 4, borderTopWidth: 4, height: 54, position: "absolute", right: 0, top: 0, width: 54 },
  cornerBottomLeft: { borderBottomWidth: 4, borderColor: brand.yellow, borderLeftWidth: 4, bottom: 0, height: 54, left: 0, position: "absolute", width: 54 },
  cornerBottomRight: { borderBottomWidth: 4, borderColor: brand.yellow, borderRightWidth: 4, bottom: 0, height: 54, position: "absolute", right: 0, width: 54 },
  scanHint: { color: brand.white, fontSize: 13, fontWeight: "700", marginTop: 22 },
  inactiveCamera: { alignItems: "center", flex: 1, justifyContent: "center", padding: 34 },
  inactiveTitle: { color: brand.white, fontSize: 19, fontWeight: "800", marginTop: 14 },
  inactiveText: { color: "#C8D5E4", fontSize: 13, lineHeight: 19, marginTop: 7, textAlign: "center" },
  bottomPanel: { backgroundColor: brand.white, gap: 8, padding: 20 },
  sessionRow: { alignItems: "center", flexDirection: "row", gap: 7 },
  sessionDot: { borderRadius: 4, height: 8, width: 8 },
  sessionDotActive: { backgroundColor: brand.green },
  sessionDotIdle: { backgroundColor: brand.muted },
  sessionText: { color: brand.navy, fontSize: 12, fontWeight: "800" },
  bottomText: { color: brand.muted, fontSize: 11, lineHeight: 16 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
