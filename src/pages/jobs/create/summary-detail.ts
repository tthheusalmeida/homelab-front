export type SummaryDetail = "brief" | "detailed" | "study";

export const DEFAULT_SUMMARY_DETAIL: SummaryDetail = "detailed";

export const summaryDetailOptions: {
  id: SummaryDetail;
  label: string;
  description: string;
}[] = [
  {
    id: "brief",
    label: "Resumo curto",
    description: "Só as ideias essenciais, bem enxuto.",
  },
  {
    id: "detailed",
    label: "Detalhado",
    description:
      "Mantém conceitos, explicações, comandos e exemplos; corta só repetição.",
  },
  {
    id: "study",
    label: "Estudo completo",
    description:
      "Material de consulta quase completo, organizado em conceitos, passo a passo, comandos, pontos de atenção e revisão. Aulas longas são resumidas em partes.",
  },
];

export function isSummaryDetail(value: unknown): value is SummaryDetail {
  return summaryDetailOptions.some((option) => option.id === value);
}
