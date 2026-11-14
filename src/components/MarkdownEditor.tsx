import { useId, useLayoutEffect, useRef, useState } from "react";

import { Eye, Image as ImageIcon, Pencil, Table2 } from "lucide-react";

import { Button } from "#ui/button";
import { Input } from "#ui/input";
import { Label } from "#ui/label";
import { Textarea } from "#ui/textarea";

import { MarkdownMessage } from "#components/MarkdownMessage";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  /** Mostra a prévia ao lado direito do texto (sem alternar), em telas largas. */
  splitPreview?: boolean;
}

export const TABLE_TEMPLATE =
  "| Coluna 1 | Coluna 2 |\n| --- | --- |\n| Valor 1 | Valor 2 |";

/** Monta `![alt](url)`; devolve `null` se a URL não for http(s) válida. */
export function buildImageMarkdown(url: string, alt: string): string | null {
  let parsed: URL;

  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return null;
  }

  // `href` já codifica espaços e parênteses não são tocados; troca-os para não
  // fechar o link antes da hora.
  const safeUrl = parsed.href.replace(/\(/g, "%28").replace(/\)/g, "%29");
  const safeAlt = alt
    .replace(/[[\]\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return `![${safeAlt}](${safeUrl})`;
}

/**
 * Editor de Markdown com prévia e atalhos para inserir imagem (por URL) e
 * tabela na posição do cursor.
 */
export function MarkdownEditor({
  value,
  onChange,
  label = "Conteúdo",
  disabled,
  placeholder = "# Título\n\nEscreva o conteúdo em Markdown...",
  splitPreview = false,
}: MarkdownEditorProps) {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const caretRef = useRef<number | null>(null);

  const [previewToggled, setPreviewToggled] = useState(false);
  const preview = previewToggled && !splitPreview;
  const [imageOpen, setImageOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageError, setImageError] = useState(false);

  // Devolve o foco e posiciona o cursor depois do texto inserido.
  useLayoutEffect(() => {
    const caret = caretRef.current;

    if (caret !== null && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(caret, caret);
    }

    caretRef.current = null;
  }, [value]);

  function insert(text: string, block: boolean) {
    const element = textareaRef.current;
    const start = element?.selectionStart ?? value.length;
    const end = element?.selectionEnd ?? value.length;

    const before = value.slice(0, start);
    const after = value.slice(end);

    // Blocos (tabela) ficam em linhas próprias, separados por linha em branco.
    const prefix = block && before.trim() !== "" ? "\n\n" : "";
    const suffix = block && after.trim() !== "" ? "\n\n" : "";

    caretRef.current = before.length + prefix.length + text.length;
    onChange(`${before}${prefix}${text}${suffix}${after}`);
  }

  function handleInsertImage() {
    const markdown = buildImageMarkdown(imageUrl, imageAlt);

    if (!markdown) {
      setImageError(true);
      return;
    }

    insert(markdown, false);
    setImageUrl("");
    setImageAlt("");
    setImageError(false);
    setImageOpen(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>

        <div className="flex flex-wrap gap-2">
          {!preview && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                aria-expanded={imageOpen}
                onClick={() => setImageOpen((current) => !current)}
              >
                <ImageIcon /> Imagem
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled}
                onClick={() => insert(TABLE_TEMPLATE, true)}
              >
                <Table2 /> Tabela
              </Button>
            </>
          )}

          {!splitPreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewToggled((current) => !current)}
            >
              {preview ? <Pencil /> : <Eye />}
              {preview ? "Editar" : "Prévia"}
            </Button>
          )}
        </div>
      </div>

      {!preview && imageOpen && (
        <div
          role="group"
          aria-label="Inserir imagem"
          className="grid gap-2 rounded-md border border-dashed p-3 sm:grid-cols-[2fr_1fr_auto]"
        >
          <div className="space-y-1">
            <Label htmlFor={`${id}-image-url`}>URL da imagem</Label>

            <Input
              id={`${id}-image-url`}
              value={imageUrl}
              onChange={(event) => {
                setImageUrl(event.target.value);
                setImageError(false);
              }}
              placeholder="https://exemplo.com/imagem.png"
              aria-invalid={imageError}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor={`${id}-image-alt`}>Texto alternativo</Label>

            <Input
              id={`${id}-image-alt`}
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              placeholder="Descrição (opcional)"
            />
          </div>

          <Button
            type="button"
            size="sm"
            className="self-end"
            onClick={handleInsertImage}
          >
            Inserir imagem
          </Button>

          {imageError && (
            <p role="alert" className="text-xs text-destructive sm:col-span-3">
              Informe uma URL http(s) válida.
            </p>
          )}
        </div>
      )}

      <div className={splitPreview ? "grid gap-4 lg:grid-cols-2" : undefined}>
        {!preview && (
          <Textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            className={
              splitPreview
                ? "min-h-[28rem] font-mono text-sm lg:h-[65dvh]"
                : "min-h-64 font-mono text-sm"
            }
            placeholder={placeholder}
          />
        )}

        {(preview || splitPreview) && (
          <div
            aria-label="Prévia da página"
            className={
              splitPreview
                ? "min-h-64 overflow-auto rounded-md border p-4 lg:sticky lg:top-4 lg:h-[65dvh] lg:self-start"
                : "min-h-64 rounded-md border p-4"
            }
          >
            {value.trim() ? (
              <MarkdownMessage content={value} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nada para mostrar ainda.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
