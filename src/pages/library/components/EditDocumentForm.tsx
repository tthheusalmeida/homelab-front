import { useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";

import { DocumentFields } from "#components/DocumentFields";
import { MarkdownEditor } from "#components/MarkdownEditor";

import { useCategories, useUpdateDocument } from "../hooks/useLibrary";
import type { DocumentDetail } from "../types/library.types";

import { DocumentPreview } from "./DocumentPreview";

interface EditDocumentFormProps {
  document: DocumentDetail;
  /** Chamado ao salvar com sucesso ou ao cancelar. */
  onClose: () => void;
}

/**
 * Formulário de edição de um documento publicado (título, categoria, tags e
 * texto com prévia ao lado). Usado na página de edição e na janela de edição.
 */
export function EditDocumentForm({ document, onClose }: EditDocumentFormProps) {
  const { meta } = document;

  const [title, setTitle] = useState(meta.title);
  const [category, setCategory] = useState(meta.category);
  const [tags, setTags] = useState(meta.tags);
  const [content, setContent] = useState(document.content);

  const categories = useCategories();
  const update = useUpdateDocument();

  const hasChanges =
    title.trim() !== meta.title ||
    content !== document.content ||
    JSON.stringify(category) !== JSON.stringify(meta.category) ||
    JSON.stringify(tags) !== JSON.stringify(meta.tags);

  const canSave =
    hasChanges &&
    title.trim() !== "" &&
    category.length > 0 &&
    content.trim() !== "" &&
    !update.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    update.mutate(
      {
        id: meta.id,
        input: { title: title.trim(), category, tags, content },
      },
      { onSuccess: onClose },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DocumentFields
        idPrefix="edit"
        title={title}
        onTitleChange={setTitle}
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={categories.data ?? []}
        tags={tags}
        onTagsChange={setTags}
        disabled={update.isPending}
      />

      <MarkdownEditor
        value={content}
        onChange={setContent}
        splitPreview
        disabled={update.isPending}
      />

      <DocumentPreview
        title={title}
        category={category}
        tags={tags}
        excerpt={content.replace(/[#*>`|-]/g, "")}
      />

      {update.isError && (
        <p className="text-sm text-destructive">
          Não foi possível salvar as alterações. Verifique a categoria e tente
          novamente.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={update.isPending}
          onClick={onClose}
        >
          Cancelar
        </Button>

        <Button type="submit" disabled={!canSave}>
          {update.isPending && <Loader2 className="animate-spin" />}
          Salvar alterações
        </Button>
      </div>
    </form>
  );
}
