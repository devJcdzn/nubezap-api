import { z } from "zod";

export const createInstanceRequestQuerySchema = z.object({
    sessionId: z.string().optional(),
});
