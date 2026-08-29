import type { KeyboardEvent } from "react";

import { LoaderCircle, Send, Square } from "lucide-react";

import { Button } from "#ui/button";
import { Textarea } from "#ui/textarea";

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  isSending?: boolean;
  settings: React.ReactNode;
}

export function ChatComposer({
  value,
  onChange,
  onSend,
  disabled,
  isSending,
  settings,
}: ChatComposerProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (!isSending && !disabled) {
      onSend();
    }
  }

  return (
    <footer className="shrink-0">
      <div className="mx-auto w-full">
        <div className="relative rounded-xl border bg-muted/30 shadow-sm">
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Envie uma mensagem..."
            className="min-h-24 resize-none border-0 bg-transparent pr-14 shadow-none focus-visible:ring-0"
          />

          <Button
            size="icon"
            className="absolute right-3 bottom-3"
            disabled={disabled}
            onClick={onSend}
          >
            {isSending ? (
              <Square className="size-4 fill-current" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="min-w-0">{settings}</div>

          <span className="shrink-0 text-xs text-muted-foreground">
            Enter para enviar · Shift + Enter para nova linha
          </span>
        </div>
      </div>
    </footer>
  );
}
