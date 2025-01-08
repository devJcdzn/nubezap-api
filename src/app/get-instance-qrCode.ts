import { qrCodes } from "../classes/qrCode";

export function getQrCode(sessionId: string): string | null {
  return qrCodes[sessionId] || null;
}
