import type { FastifyReply, FastifyRequest } from "fastify";
import { createInstance, instances } from "../app/create-wa-instance";

import { randomUUID } from "node:crypto";
import { Session } from "../models/sesison";

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

  async deleteInstance(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.query as { sessionId: string };

    if (!sessionId) {
      return reply.status(400).send({ error: "sessionId is required" });
    }

    const instance = instances[sessionId];
    if (!instance) {
      return reply.status(404).send({ error: "Instance not found" });
    }

    try {
      instance.logout();
      delete instances[sessionId];
      await Session.deleteOne({ sessionId });
      return reply.status(200).send({ message: "Instance deleted" });
    } catch (err) {
      console.log(err);
      return reply.status(500).send({ error: "Failed to delete instance" });
    }
  },
};
