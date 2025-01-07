import { instanceController } from "../controllers/instance.controller";
import type { FastifyTypedInstance } from "../types";

import { createInstanceRequestQuerySchema } from "../schemas";

export async function instancesRoutes(app: FastifyTypedInstance) {
  app.post(
    "/",
    {
      schema: {
        tags: ["Instâncias"],
        description: "Cria uma nova instância/conexão com o whatsapp",
        querystring: createInstanceRequestQuerySchema,
      },
    },
    async (req, res) => instanceController.createInstance(req, res)
  );
  app.delete(
    "/",
    {
      schema: {
        tags: ["Instâncias"],
        description: "Deleta uma instância/conexão com o whatsapp",
        queryString: createInstanceRequestQuerySchema,
      },
    },
    async (req, res) => instanceController.deleteInstance
  );
}
