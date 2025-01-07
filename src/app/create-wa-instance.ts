import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  type WASocket,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import path from "node:path";
import { useMongoAuthState } from "../services/mongo-auth-state";

const authBasePath = path.resolve(__dirname, "sessions");

export const instances: Record<string, WASocket> = {};

export async function createInstance(sessionId: string): Promise<WASocket> {
  const authPath = path.join(authBasePath, sessionId);
  // const { saveCreds, state } = await useMultiFileAuthState(authPath);
  const { saveCreds, state } = await useMongoAuthState(sessionId);

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        createInstance(sessionId);
      }
    }
  });

  instances[sessionId] = sock;
  return sock;
}
