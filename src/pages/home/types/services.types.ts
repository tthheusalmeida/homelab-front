export const services = [
  {
    name: "HomeLab",
    description: "Back end principal do HomeLab",
    url: "http://localhost:3000/api/v1/health/system",
    healthUrl: "http://localhost:3000/api/v1/health/system",
  },
  {
    name: "AI",
    description: "Serviços de AI",
    url: "http://localhost:3000/api/v1/health/ai",
    healthUrl: "http://localhost:3000/api/v1/health/ai",
  },
] as const;

export type HealthCheckStatus = "ok" | "error";

export interface HealthCheck {
  service: string;
  description: string;
  status: HealthCheckStatus;
}

export interface HealthService {
  service: string;
  description: string;
  checks: HealthCheck[];
}

export type Service = (typeof services)[number];
