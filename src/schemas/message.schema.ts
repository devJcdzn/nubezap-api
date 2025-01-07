import { z } from "zod";

export const sendMessageQueryRequestSchema = z.object({
  sessionId: z.string(),
});

export const sendMessageBodyRequestSchema = z.object({
  phoneNumber: z.string(),
  message: z.string(),
});
