import makeWASocket, {
  DisconnectReason,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
// import path from "node:path";

import { qrCodes } from "../classes/qrCode";
import { instances } from "../classes/instance";
import { useMongoAuthState } from "../services/mongo-auth-state";

// const authBasePath = path.resolve(__dirname, "sessions");

export async function createInstance(sessionId: string): Promise<WASocket> {
  // const authPath = path.join(authBasePath, sessionId);
  // const { saveCreds, state } = await useMultiFileAuthState(authPath);
  const { saveCreds, state } = await useMongoAuthState(sessionId);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodes[sessionId] = qr;
    }

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

        if (shouldReconnect) {
          console.log('Tentando reconectar...');
          createInstance(sessionId);
      } else {
          console.log('Sessão encerrada, será necessário escanear o QR novamente.');
      }
    } else if (connection === "open") {
      console.log("Conexão estabelecida.");
      delete qrCodes[sessionId];
    }
  });

  instances[sessionId] = sock;
  return sock;
}
