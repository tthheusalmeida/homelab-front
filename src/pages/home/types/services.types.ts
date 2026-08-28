export interface Service {
  name: string;
  description: string;
  url: string;
  healthUrl: string;
}

export const services: Service[] = [
  {
    name: "HomeLab",
    description: "Back end principal do HomeLab",
    url: "http://localhost:3000/api/v1/health/system",
    healthUrl: "http://localhost:3000/api/v1/health/system",
  },
  {
    name: "Ollama",
    description: "Serviço de AI local",
    url: "http://localhost:11434",
    healthUrl: "http://localhost:11434",
  },
];
