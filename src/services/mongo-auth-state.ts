import { proto } from "@adiwajshing/baileys/WAProto";
import { Curve, signedKeyPair } from "@adiwajshing/baileys/lib/Utils/crypto";
import { generateRegistrationId } from "@adiwajshing/baileys/lib/Utils/generics";
import { randomBytes } from "node:crypto";
import { Session } from "../models/sesison";

const initAuthCreds = () => {
  const identityKey = Curve.generateKeyPair();
  return {
    noiseKey: Curve.generateKeyPair(),
    signedIdentityKey: identityKey,
    signedPreKey: signedKeyPair(identityKey, 1),
    registrationId: generateRegistrationId(),
    advSecretKey: randomBytes(32).toString("base64"),
    processedHistoryMessages: [],
    nextPreKeyId: 1,
    firstUnuploadedPreKeyId: 1,
    accountSettings: {
      unarchiveChats: false,
    },
  };
};

const BufferJSON = {
  replacer: (key: string, value: any) => {
    if (
      Buffer.isBuffer(value) ||
      value instanceof Uint8Array ||
      value?.type === "Buffer"
    ) {
      return {
        type: "Buffer",
        data: Buffer.from(value?.data || value).toString("base64"),
      };
    }
    return value;
  },
  reviver: (key: string, value: any) => {
    if (
      typeof value === "object" &&
      value &&
      (value.type === "Buffer" || value.buffer === true)
    ) {
      const val = value.data || value.value;
      return typeof val === "string"
        ? Buffer.from(val, "base64")
        : Buffer.from(val || []);
    }
    return value;
  },
};

export async function useMongoAuthState(sessionId: string) {
  // const session = await Session.findOne({ sessionId });

  const writeData = async (data: any, key: string) => {
    await Session.updateOne(
      { sessionId, key },
      { sessionId, key, data: JSON.stringify(data, BufferJSON.replacer) },
      { upsert: true }
    );
  };

  const readData = async (key: string) => {
    const entry = await Session.findOne({ sessionId, key });
    if (entry) {
      return JSON.parse(entry.data, BufferJSON.reviver);
    }
    return null;
  };

  const removeData = async (key: string) => {
    await Session.deleteOne({ sessionId, key });
  };

  const creds = (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: { [key: string]: any } = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === "app-state-sync-key") {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data: { [category: string]: { [id: string]: any } }) => {
          const tasks = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
        delete: async (ids: string[]) => {
          await Promise.all(ids.map((id) => removeData(id)));
        },
      },
    },
    saveCreds: async () => {
      await writeData(creds, "creds");
    },
  };
}
