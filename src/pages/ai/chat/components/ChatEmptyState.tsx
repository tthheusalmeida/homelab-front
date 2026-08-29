import { Bot } from "lucide-react";
import { useEffect, useState } from "react";

const phrases = [
  "Explorar uma ideia?",
  "Resolver um problema?",
  "Transformar uma ideia em código?",
  "Questionar o que você sabe?",
  "Encontrar uma solução elegante?",
  "Entender algo mais profundamente?",
  "Criar algo novo?",
  "Simplificar o que parece complexo?",
  "Pensar diferente?",
  "Descobrir o que ainda não foi perguntado?",
];

type TypingPhase = "typing" | "waiting" | "deleting" | "paused";

export function ChatEmptyState() {
  const [phrase, setPhrase] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [phase, setPhase] = useState<TypingPhase>("typing");

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    let timeout: ReturnType<typeof setTimeout>;

    switch (phase) {
      case "typing":
        timeout = setTimeout(() => {
          const nextPhrase = currentPhrase.slice(0, phrase.length + 1);

          setPhrase(nextPhrase);

          if (nextPhrase === currentPhrase) {
            setPhase("waiting");
          }
        }, 70);
        break;

      case "waiting":
        timeout = setTimeout(() => {
          setPhase("deleting");
        }, 2200);
        break;

      case "deleting":
        timeout = setTimeout(() => {
          const nextPhrase = currentPhrase.slice(0, phrase.length - 1);

          setPhrase(nextPhrase);

          if (nextPhrase === "") {
            setPhase("paused");
          }
        }, 35);
        break;

      case "paused":
        timeout = setTimeout(() => {
          setPhraseIndex((index) => (index + 1) % phrases.length);
          setPhase("typing");
        }, 900);
        break;
    }

    return () => clearTimeout(timeout);
  }, [phrase, phraseIndex, phase]);

  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center p-6 text-center select-none">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
        <Bot className="size-6" />
      </div>

      <div className="max-w-sm space-y-1">
        <h2 className="text-lg font-medium tracking-tight">
          Como posso te ajudar hoje?
        </h2>

        <div className="h-6 text-muted-foreground font-mono text-xs">
          <span>{phrase}</span>
          <span className="ml-0.5 animate-pulse">|</span>
        </div>
      </div>
    </div>
  );
}
