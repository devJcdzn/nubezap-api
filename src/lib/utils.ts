import makeWASocket, { DisconnectReason } from "@whiskeysockets/baileys";
import type { Boom } from "@hapi/boom";

import { Session } from "../models/sesison";
import { instances } from "../classes/instance";
import { useMongoAuthState } from "../services/mongo-auth-state";

export async function getOrCreateInstance(sessionId: string) {
  if (instances[sessionId]) {
    console.log(`Reutilizando instância para sessão ${sessionId}`);
    return instances[sessionId];
  }

  const session = await Session.findOne({ sessionId });
  if (!session) {
    throw new Error("Sessão não encontrada.");
  }

  const { saveCreds, state } = await useMongoAuthState(sessionId);

  const sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const errorCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

      const shouldReconnect = errorCode !== DisconnectReason.loggedOut;

      if (shouldReconnect) {
        console.log("Tentando reconectar...");
        getOrCreateInstance(sessionId).catch((err) =>
          console.error("Erro ao reconectar:", err)
        );
      } else {
        console.log("Sessão encerrada, QR Code será necessário.");
        delete instances[sessionId];
      }
    } else if (connection === "open") {
      console.log("Conexão Reestabelecida.");
    }
  });

  instances[sessionId];

  return sock;
}
