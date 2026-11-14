import { useState } from "react";

import { useNavigate } from "react-router";
import { Loader2 } from "lucide-react";

import { Button } from "#ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#ui/card";

import { DocumentFields } from "#components/DocumentFields";
import { MarkdownEditor } from "#components/MarkdownEditor";

import { countWords, formatReadingTime, minutesToRead } from "./books/stats";
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

  const words = countWords(content);

  // O que ainda falta para poder salvar (mostrado ao lado do botão).
  const missing = [
    title.trim() === "" && "título",
    category.length === 0 && "categoria",
    content.trim() === "" && "texto",
  ].filter((item): item is string => item !== false);

  const canSave = missing.length === 0 && !createArticle.isPending;

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
        <h1 className="text-2xl font-semibold tracking-tight">Nova página</h1>

        <p className="text-sm text-muted-foreground">
          Escreva em Markdown (tabelas, links e imagens por URL funcionam) e
          acompanhe a prévia ao lado enquanto digita.
        </p>
      </div>

      <section aria-label="Dados da página">
        <Card>
          <CardHeader>
            <CardTitle>1. Dados da página</CardTitle>

            <CardDescription>
              Onde ela fica guardada e como aparece na biblioteca.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
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
            </div>

            <DocumentPreview
              title={title}
              category={category}
              tags={tags}
              excerpt={content.replace(/[#*>`|-]/g, "")}
            />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Texto da página">
        <Card>
          <CardHeader>
            <CardTitle>2. Texto da página</CardTitle>

            <CardDescription>
              Escreva à esquerda e confira o resultado à direita enquanto
              digita.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <MarkdownEditor
              value={content}
              onChange={setContent}
              splitPreview
              disabled={createArticle.isPending}
            />

            <p className="text-xs text-muted-foreground">
              {words.toLocaleString("pt-BR")} palavra(s) · leitura estimada:{" "}
              {formatReadingTime(minutesToRead(words))}
            </p>
          </CardContent>
        </Card>
      </section>

      {createArticle.isError && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível salvar a página. Verifique a categoria e tente
          novamente.
        </p>
      )}

      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          {missing.length > 0
            ? `Falta: ${missing.join(", ")}.`
            : "Tudo pronto para salvar."}
        </p>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={createArticle.isPending}
            onClick={() => navigate("/library")}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={!canSave}>
            {createArticle.isPending && <Loader2 className="animate-spin" />}
            Salvar página
          </Button>
        </div>
      </div>
    </form>
  );
}
