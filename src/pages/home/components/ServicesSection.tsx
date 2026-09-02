import { HomeBaseSection } from "./BaseSection";
import { ServiceGrid } from "./ServiceGrid";
import { useSystemHealth } from "../hooks/useSystemHealth";

export function ServicesSection() {
  const health = useSystemHealth();

  return (
    <HomeBaseSection
      title="Serviços"
      subtitle="Acesso rápido aos serviços do seu ambiente."
      titleMono="/services"
    >
      <ServiceGrid queries={health.queries} />
    </HomeBaseSection>
  );
}
