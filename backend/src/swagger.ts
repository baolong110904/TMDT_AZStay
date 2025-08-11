import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";

export const setupSwagger = (app: Express) => {
  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "AZStay API Docs",
        version: "1.0.0",
        description: "API documentation for AZStay backend",
      },
      servers: [
        {
          url: "http://localhost:5000",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: [
      path.join(__dirname, "routes/*.ts"),
      path.join(__dirname, "docs/*.ts"),
    ],
  };

  const swaggerSpec = swaggerJsdoc(options);

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
