import { DocumentFields } from "#components/DocumentFields";

import { useCategories } from "../../../library/hooks/useLibrary";

interface JobDocumentFieldsProps {
  idPrefix: string;
  title: string;
  onTitleChange: (title: string) => void;
  category: string[];
  onCategoryChange: (category: string[]) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  disabled?: boolean;
  /** Título que o documento recebe se o campo ficar vazio. */
  defaultTitle: string;
}

/** Dados opcionais do documento gerado, para já nascer organizado. */
export function JobDocumentFields({
  defaultTitle,
  ...fields
}: JobDocumentFieldsProps) {
  const categories = useCategories();

  return (
    <section
      aria-label="Dados da página"
      className="space-y-4 rounded-md border border-dashed p-4"
    >
      <p className="text-sm text-muted-foreground">
        Opcional. O que você preencher já vem pronto quando a página aparecer na
        Entrada; dá para ajustar na hora de adicionar à biblioteca.
      </p>

      <DocumentFields
        idPrefix={fields.idPrefix}
        title={fields.title}
        onTitleChange={fields.onTitleChange}
        titlePlaceholder={`Se vazio: ${defaultTitle}`}
        category={fields.category}
        onCategoryChange={fields.onCategoryChange}
        categoryOptions={categories.data ?? []}
        tags={fields.tags}
        onTagsChange={fields.onTagsChange}
        disabled={fields.disabled}
      />
    </section>
  );
}
