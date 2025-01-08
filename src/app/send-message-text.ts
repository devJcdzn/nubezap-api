import { getOrCreateInstance } from "../lib/utils";

export async function sendTextMessage(
  sessionId: string,
  phoneNumber: string,
  message: string
) {
  if (!sessionId || !phoneNumber || !message) {
    throw new Error("Campos obrigatórios faltando");
  }

  try {
    const sock = await getOrCreateInstance(sessionId);

    const jid = `${phoneNumber}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });

    return { success: true, message: "Mensagem enviada com sucesso." };
  } catch (err) {
    console.error(`Error sending message to ${phoneNumber}:`, err);
    return { success: false, message: "Erro ao enviar mensagem" };
  }
}
