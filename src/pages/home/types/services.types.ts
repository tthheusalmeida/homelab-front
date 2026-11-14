const API_URL = import.meta.env.VITE_API_URL;

export const services = [
  {
    name: "HomeLab",
    description: "Back end principal do HomeLab",
    url: `${API_URL}/health/system`,
    healthUrl: `${API_URL}/health/system`,
  },
  {
    name: "AI",
    description: "Serviços de AI",
    url: `${API_URL}/health/ai`,
    healthUrl: `${API_URL}/health/ai`,
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
