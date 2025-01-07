import { instances } from "./create-wa-instance";

export async function sendTextMessage(
  sessionId: string,
  phoneNumber: string,
  message: string
) {
  if (!sessionId || !phoneNumber || !message) {
    throw new Error("Fields missing");
  }

  const sock = instances[sessionId];

  if (!sock) {
    throw new Error("Session not found");
  }

  try {
    const jid = `${phoneNumber}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });

    return { success: true, message: "Message Sent" };
  } catch (err) {
    console.error(`Error sending message to ${phoneNumber}:`, err);
    return { success: false, message: "Error sending message" };
  }
}
