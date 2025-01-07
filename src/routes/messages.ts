import type { FastifyInstance } from "fastify";
import { messageController } from "../controllers/message.controller";
import {
  sendMessageBodyRequestSchema,
  sendMessageQueryRequestSchema,
} from "../schemas";

export async function messageRoutes(app: FastifyInstance) {
  app.post(
    "/text",
    {
      schema: {
        tags: ["Mensagens"],
        description: "Envia uma mensagem de texto.",
        querystring: sendMessageQueryRequestSchema,
        body: sendMessageBodyRequestSchema,
      },
    },
    async (req, res) => messageController.sendTextMessage(req, res)
  );
}
