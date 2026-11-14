import { useState } from "react";

import { Link } from "react-router";
import { Inbox, SearchX, Library as LibraryIcon } from "lucide-react";

import { Button, buttonVariants } from "#ui/button";
import { Card, CardContent } from "#ui/card";

import { EmptyState } from "#components/EmptyState";
import { ErrorState } from "#components/ErrorState";
import { LoadingState } from "#components/LoadingState";
import { OptionSelect } from "#components/OptionSelect";
import { SearchInput } from "#components/SearchInput";
import { useDebouncedValue } from "#hooks/use-debounced-value";

import { CategoryTree } from "./components/CategoryTree";
import { DocumentCard } from "./components/DocumentCard";
import { useCategories, useDocuments, useTags } from "./hooks/useLibrary";
import {
  documentSourceLabels,
  documentTypeLabels,
  sortLabels,
  type DocumentSource,
  type DocumentType,
  type SortOption,
} from "./types/library.types";

const ALL = "all";

const toOptions = (labels: Record<string, string>, allLabel: string) => [
  { id: ALL, label: allLabel },
  ...Object.entries(labels).map(([id, label]) => ({ id, label })),
];

export function LibraryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string[]>([]);
  const [type, setType] = useState<DocumentType>();
  const [source, setSource] = useState<DocumentSource>();
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("title");

  const q = useDebouncedValue(search);

  const documents = useDocuments({ q, category, type, source, tags, sort });
  const categories = useCategories();
  const tagList = useTags();

  const hasFilters =
    q.trim() !== "" ||
    category.length > 0 ||
    type !== undefined ||
    source !== undefined ||
    tags.length > 0;

  function clearFilters() {
    setSearch("");
    setCategory([]);
    setType(undefined);
    setSource(undefined);
    setTags([]);
  }

  function toggleTag(tag: string) {
    setTags((current) =>
      current.includes(tag)
        ? current.filter((own) => own !== tag)
        : [...current, tag],
    );
  }

  if (documents.isLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <LoadingState message="Carregando" />
      </div>
    );
  }

  if (documents.isError || !documents.data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Oops! houve uma falha ao carregar a biblioteca."
            secondaryMessage="Tente novamente mais tarde."
            action={() => void documents.refetch()}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Biblioteca</h1>

        <p className="text-sm text-muted-foreground">
          Seus conhecimentos organizados por tema. Pesquise por título, tags,
          categorias ou pelo texto dos documentos.
        </p>
      </div>

      <div className="space-y-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Pesquisar na biblioteca..."
        />

        <div className="flex flex-wrap items-center gap-2">
          <OptionSelect
            value={type ?? ALL}
            options={toOptions(documentTypeLabels, "Todos os tipos")}
            placeholder="Tipo"
            label="Tipo"
            triggerWidth="w-40"
            contentWidth="w-44"
            onValueChange={(value) =>
              setType(
                !value || value === ALL ? undefined : (value as DocumentType),
              )
            }
          />

          <OptionSelect
            value={source ?? ALL}
            options={toOptions(documentSourceLabels, "Todas as origens")}
            placeholder="Origem"
            label="Origem"
            triggerWidth="w-44"
            contentWidth="w-48"
            onValueChange={(value) =>
              setSource(
                !value || value === ALL ? undefined : (value as DocumentSource),
              )
            }
          />

          <OptionSelect
            value={sort}
            options={Object.entries(sortLabels).map(([id, label]) => ({
              id,
              label,
            }))}
            placeholder="Ordenar"
            label="Ordenar por"
            triggerWidth="w-40"
            contentWidth="w-44"
            onValueChange={(value) => setSort((value as SortOption) ?? "title")}
          />

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar filtros
            </Button>
          )}
        </div>

        {(tagList.data?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5" aria-label="Filtrar por tag">
            {tagList.data!.map(({ tag, count }) => (
              <Button
                key={tag}
                size="xs"
                variant={tags.includes(tag) ? "default" : "outline"}
                aria-pressed={tags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {tag} · {count}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside>
          <CategoryTree
            nodes={categories.data ?? []}
            selected={category}
            onSelect={setCategory}
          />
        </aside>

        <section aria-label="Documentos" className="space-y-3">
          {documents.data.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={SearchX}
                title="Nenhum resultado encontrado"
                description="Tente outros termos ou remova alguns filtros."
                action={
                  <Button variant="secondary" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={LibraryIcon}
                title="A biblioteca está vazia"
                description="Adicione resumos e transcrições da Entrada ou escreva um artigo."
                action={
                  <Link
                    to="/library/inbox"
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    <Inbox /> Ir para a Entrada
                  </Link>
                }
              />
            )
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {documents.data.length} documento(s)
              </p>

              {documents.data.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
