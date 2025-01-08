import { fastify } from "fastify";
import { fastifyCors } from "@fastify/cors";

import mongoose from "mongoose";
import { routes } from "./routes";

import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifySwaggerUi } from "@fastify/swagger-ui";

const app = fastify().withTypeProvider<ZodTypeProvider>();

mongoose
  .connect(
    process.env.MONGO_DB_URL ||
      "mongodb://mongo:3919d3aee2224eacf7db@cloud.confiaagenda.com.br:27017/?tls=false"
  )
  .then(() => app.log.info("Connected to MongoDB"))
  .catch((err) => app.log.error(err));

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(fastifyCors, {
  origin: "*",
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "NubeZap-API",
      version: "1.0.0",
      description: "A API da Nuberock para envio de mensagens via WhatsApp.",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(routes);

export { app };
