import { useNavigate, useParams } from "react-router";

import { Card, CardContent } from "#ui/card";

import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";

import { EditDocumentForm } from "./components/EditDocumentForm";
import { useDocument } from "./hooks/useLibrary";
import type { DocumentDetail } from "./types/library.types";

export function EditDocumentPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useDocument(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <LoadingState message="Carregando" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Oops! não foi possível abrir a página."
            secondaryMessage="Ela pode ter sido removida ou o servidor está indisponível."
            actionLabel="Voltar à biblioteca"
            action={() => navigate("/library")}
          />
        </CardContent>
      </Card>
    );
  }

  if (data.meta.status !== "published") {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Só é possível editar páginas que estão na biblioteca."
            secondaryMessage="Readicione a página pela Entrada para editá-la."
            actionLabel="Voltar à página"
            action={() => navigate(`/library/${data.meta.id}`)}
          />
        </CardContent>
      </Card>
    );
  }

  return <EditForm key={data.meta.id} document={data} />;
}

function EditForm({ document }: { document: DocumentDetail }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Editar página</h1>

        <p className="text-sm text-muted-foreground">
          Mudar título ou categoria também renomeia ou move o arquivo. Use
          Imagem e Tabela para inserir esses elementos no texto.
        </p>
      </div>

      <EditDocumentForm
        document={document}
        onClose={() => navigate(`/library/${document.meta.id}`)}
      />
    </div>
  );
}
