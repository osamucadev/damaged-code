import type { FastifyInstance } from "fastify";

export interface HealthResponse {
  status: "ok";
  service: string;
  uptime: number;
  timestamp: string;
}

const healthResponseSchema = {
  type: "object",
  required: ["status", "service", "uptime", "timestamp"],
  properties: {
    status: { type: "string", enum: ["ok"] },
    service: { type: "string" },
    uptime: { type: "number" },
    timestamp: { type: "string", format: "date-time" },
  },
} as const;

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/health",
    {
      schema: {
        description: "Reports whether the API is running and able to answer requests.",
        tags: ["operations"],
        response: { 200: healthResponseSchema },
      },
    },
    async (): Promise<HealthResponse> => ({
      status: "ok",
      service: "damaged-code-api",
      uptime: Math.round(process.uptime() * 1000) / 1000,
      timestamp: new Date().toISOString(),
    }),
  );
}
