import { useState } from "react";

import { Loader2, Sparkles } from "lucide-react";

import { Button } from "#ui/button";

import { OptionSelect } from "#components/OptionSelect";

import { useAiModels } from "../../ai/chat/hooks/useAiModels";
import { useSuggestClassification } from "../hooks/useLibrary";
import type { ClassificationSuggestion } from "../types/library.types";

const AUTO_MODEL = "auto";

interface SuggestionPanelProps {
  documentId: string;
  /** Recebe a sugestão; quem usa decide o que preencher. */
  onSuggestion: (suggestion: ClassificationSuggestion) => void;
  disabled?: boolean;
}

/** Pede ao Gemini um título, categoria e tags para o documento. */
export function SuggestionPanel({
  documentId,
  onSuggestion,
  disabled,
}: SuggestionPanelProps) {
  const [modelId, setModelId] = useState(AUTO_MODEL);
  const [usedModel, setUsedModel] = useState<string | null>(null);

  const models = useAiModels("gemini");
  const suggest = useSuggestClassification();

  const options = [
    { id: AUTO_MODEL, label: "Mais barato (automático)" },
    ...(models.data ?? []).map((model) => ({
      id: model.id,
      label: model.label,
    })),
  ];

  function handleSuggest() {
    suggest.mutate(
      { id: documentId, modelId: modelId === AUTO_MODEL ? undefined : modelId },
      {
        onSuccess: (suggestion) => {
          setUsedModel(suggestion.model);
          onSuggestion(suggestion);
        },
      },
    );
  }

  return (
    <section
      aria-label="Sugestão da IA"
      className="space-y-2 rounded-md border border-dashed p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={disabled || suggest.isPending}
          onClick={handleSuggest}
        >
          {suggest.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          Sugerir com IA
        </Button>

        <OptionSelect
          value={modelId}
          options={options}
          placeholder="Modelo"
          label="Modelo do Gemini"
          triggerWidth="w-56"
          contentWidth="w-64"
          disabled={disabled || suggest.isPending}
          onValueChange={(value) => setModelId(value ?? AUTO_MODEL)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        A IA preenche título, categoria e tags (preferindo o que já existe na
        biblioteca). Você revisa e ajusta antes de adicionar.
      </p>

      {usedModel && !suggest.isError && (
        <p className="text-xs text-muted-foreground">
          Sugestão preenchida com {usedModel}.
        </p>
      )}

      {suggest.isError && (
        <p role="alert" className="text-xs text-destructive">
          Não foi possível obter a sugestão. Tente novamente.
        </p>
      )}
    </section>
  );
}
