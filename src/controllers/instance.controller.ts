import type { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";

import { Session } from "../models/sesison";
import { instances } from "../classes/instance";
import { createInstance } from "../app/create-wa-instance";
import { getQrCode } from "../app/get-instance-qrCode";
import { getOrCreateInstance } from "../lib/utils";

export const instanceController = {
  async createInstance(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.query as { sessionId?: string };

    const id = sessionId || randomUUID();

    try {
      await createInstance(id);
      reply.code(201).send({ success: true, id });
    } catch (err) {
      console.log(err);
      return reply
        .code(500)
        .send({ success: false, message: "Error to create Instance" });
    }
  },

  getInstanceQrCode(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.query as { sessionId: string };

    if (!sessionId) {
      return reply
        .code(400)
        .send({ success: false, message: "ID da sessão faltando." });
    }

    const qrCode = getQrCode(sessionId);
    if (!qrCode) {
      return reply
        .code(404)
        .send({ success: false, message: "Qr Code não disponível" });
    }

    return reply.code(200).send({ qrCode });
  },

  async deleteInstance(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.query as { sessionId: string };

    if (!sessionId) {
      return reply.status(400).send({ error: "sessionId is required" });
    }

    const session = await Session.findOne({ sessionId });
    if (!session) {
      return reply.status(404).send({ error: "Sessão não encontrada." });
    }

    try {
      await Session.deleteOne({ sessionId });

      instances[sessionId] = await getOrCreateInstance(sessionId);
      instances[sessionId].logout();
      delete instances[sessionId];

      return reply
        .status(200)
        .send({ success: true, message: "Instância removida." });
    } catch (err) {
      console.log(err);
      return reply.status(500).send({ error: "Erro ao remover instância." });
    }
  },
};
