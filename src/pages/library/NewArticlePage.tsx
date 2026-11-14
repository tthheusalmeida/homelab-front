import { useState } from "react";

import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";

import { DocumentFields } from "#components/DocumentFields";
import { MarkdownEditor } from "#components/MarkdownEditor";

import { DocumentPreview } from "./components/DocumentPreview";
import { useCategories, useCreateArticle } from "./hooks/useLibrary";

export function NewArticlePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");

  const categories = useCategories();
  const createArticle = useCreateArticle();

  const canSave =
    title.trim() !== "" &&
    category.length > 0 &&
    content.trim() !== "" &&
    !createArticle.isPending;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    createArticle.mutate(
      { title: title.trim(), category, tags, content },
      { onSuccess: ({ meta }) => navigate(`/library/${meta.id}`) },
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Novo artigo</h1>

        <p className="text-sm text-muted-foreground">
          Escreva em Markdown (tabelas, links e imagens por URL funcionam).
          Confira a prévia antes de salvar.
        </p>
      </div>

      <DocumentFields
        idPrefix="article"
        title={title}
        onTitleChange={setTitle}
        category={category}
        onCategoryChange={setCategory}
        categoryOptions={categories.data ?? []}
        tags={tags}
        onTagsChange={setTags}
        disabled={createArticle.isPending}
      />

      <DocumentPreview
        title={title}
        category={category}
        tags={tags}
        excerpt={content.replace(/[#*>`|-]/g, "")}
      />

      <MarkdownEditor
        value={content}
        onChange={setContent}
        disabled={createArticle.isPending}
      />

      {createArticle.isError && (
        <p className="text-sm text-destructive">
          Não foi possível salvar o artigo. Verifique a categoria e tente
          novamente.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!canSave}>
          {createArticle.isPending && <Loader2 className="animate-spin" />}
          Salvar artigo
        </Button>
      </div>
    </form>
  );
}
