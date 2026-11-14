import { useState } from "react";

import { useNavigate } from "react-router";
import { Eye, Loader2, Pencil } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";
import { Label } from "#ui/label";
import { Textarea } from "#ui/textarea";

import { CategoryPicker } from "#components/CategoryPicker";
import { MarkdownMessage } from "#components/MarkdownMessage";
import { TagInput } from "#components/TagInput";

import { DocumentPreview } from "./components/DocumentPreview";
import { useCategories, useCreateArticle } from "./hooks/useLibrary";

export function NewArticlePage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState(false);

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

      <div className="space-y-2">
        <Label htmlFor="article-title">Título</Label>

        <Input
          id="article-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={createArticle.isPending}
        />
      </div>

      <CategoryPicker
        value={category}
        onChange={setCategory}
        options={categories.data ?? []}
        disabled={createArticle.isPending}
      />

      <div className="space-y-2">
        <Label>Tags</Label>

        <p className="text-sm text-muted-foreground">
          Etiquetas livres para achar o documento na busca, independentes da
          pasta. Ex.: docker, prova, revisar.
        </p>

        <TagInput
          value={tags}
          onChange={setTags}
          disabled={createArticle.isPending}
        />
      </div>

      <DocumentPreview
        title={title}
        category={category}
        tags={tags}
        excerpt={content.replace(/[#*>`|-]/g, "")}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="article-content">Conteúdo</Label>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreview((current) => !current)}
          >
            {preview ? <Pencil /> : <Eye />}
            {preview ? "Editar" : "Prévia"}
          </Button>
        </div>

        {preview ? (
          <div
            aria-label="Prévia do artigo"
            className="min-h-64 rounded-md border p-4"
          >
            {content.trim() ? (
              <MarkdownMessage content={content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nada para mostrar ainda.
              </p>
            )}
          </div>
        ) : (
          <Textarea
            id="article-content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={createArticle.isPending}
            className="min-h-64 font-mono text-sm"
            placeholder="# Título&#10;&#10;Escreva o conteúdo em Markdown..."
          />
        )}
      </div>

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
