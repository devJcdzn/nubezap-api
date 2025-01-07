import type { FastifyInstance } from "fastify";

import { instancesRoutes } from "./instances";
import { messageRoutes } from "./messages";
import type { FastifyTypedInstance } from "../types";

export async function routes(app: FastifyTypedInstance) {
  app.register(instancesRoutes, { prefix: "/instances" });
  app.register(messageRoutes, { prefix: "/message" });
};