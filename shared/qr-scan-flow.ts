/**
 * @archivo shared/qr-scan-flow.ts
 * @descripcion Reglas y tipos del dominio compartidos entre la aplicación y el servidor.
 */
/**
 * Determina si se cumple la condición canProcessQrScan.
 */
export function canProcessQrScan({ hasActiveSession, isProcessing, isScanned }: { hasActiveSession: boolean; isProcessing: boolean; isScanned: boolean }) {
  return hasActiveSession && !isProcessing && !isScanned;
}
