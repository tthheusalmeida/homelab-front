import { Trophy } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "#ui/card";
import { formatDate } from "#lib/format";

import { BookProgress } from "./BookProgress";

/**
 * Compacto e com altura mínima igual nos dois estados (progresso e conclusão),
 * para o painel não se mexer ao concluir ou zerar o progresso.
 */
const CARD_CLASS = "min-h-24 gap-2 py-3";

interface BookProgressCardProps {
  read: number;
  total: number;
  /** Quando o livro foi concluído; null/ausente se ainda não. */
  completedAt?: string | null;
}

/**
 * Quadro do painel fixo, no mesmo padrão e com a altura baixa do "Sumário do
 * livro". Enquanto o livro não termina mostra o "Progresso" (barra e capítulos
 * lidos); depois de concluído deixa o progresso de lado e mostra só quando foi
 * concluído. Fica no painel para o leitor ver mesmo com o topo fora da tela.
 */
export function BookProgressCard({
  read,
  total,
  completedAt,
}: BookProgressCardProps) {
  if (total <= 0) {
    return null;
  }

  if (completedAt) {
    return (
      <Card className={CARD_CLASS}>
        <CardHeader>
          <CardTitle className="text-sm">Conclusão</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-500">
            <Trophy className="size-4 shrink-0" />
            Concluído em {formatDate(completedAt)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={CARD_CLASS}>
      <CardHeader>
        <CardTitle className="text-sm">Progresso</CardTitle>
      </CardHeader>

      <CardContent>
        <BookProgress read={read} total={total} />
      </CardContent>
    </Card>
  );
}
