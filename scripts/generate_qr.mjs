#!/usr/bin/env node
/**
 * @archivo scripts/generate_qr.mjs
 * @descripcion Herramienta de línea de comandos para verificar o automatizar tareas del proyecto.
 */
import QRCode from "qrcode";

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/generate_qr.mjs "exps://..."');
  process.exit(1);
}

await QRCode.toFile("expo-qr-code.png", url, { width: 512 });
console.log(`✅ QR code saved to expo-qr-code.png`);
