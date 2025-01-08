import type { FastifyReply, FastifyRequest } from "fastify";
import { createInstance, instances } from "../app/create-wa-instance";
import { sendTextMessage } from "../app/send-message-text";

export const messageController = {
  async sendTextMessage(request: FastifyRequest, reply: FastifyReply) {
    const { sessionId } = request.query as { sessionId: string };
    const { phoneNumber, message } = request.body as {
      phoneNumber: string;
      message: string;
    };

    if (!sessionId || !phoneNumber || !message) {
      return reply
        .code(400)
        .send({ success: false, message: "Fields missing." });
    }

    try {
      const { success, message: errMessage, data } = await sendTextMessage(
        sessionId,
        phoneNumber,
        message
      );

      if (!success) {
        return reply.code(400).send({
          success,
          message: errMessage,
        });
      }

      return reply.code(200).send({
        success: true,
        message: "Text message sent successfully.",
        data,
      });
    } catch (err) {
      console.error("Error sending text message:", err);
      return reply
        .code(500)
        .send({ success: false, message: "Error sending message." });
    }
  },
};
