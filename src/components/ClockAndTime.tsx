import { useEffect, useState } from "react";

function useClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return now;
}

function capitalizeWord(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function ClockAndTime() {
  const now = useClock();

  const time = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const dateParts = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatToParts(now);

  const date = dateParts
    .map(({ type, value }) => {
      if (type === "weekday" || type === "month") {
        return value.split("-").map(capitalizeWord).join("-");
      }

      return value;
    })
    .join("");

  return (
    <div className="flex-1 shrink-0 text-right">
      <div className="text-sm tabular-nums font-semibold">{time}</div>

      <div className="text-xs text-muted-foreground">{date}</div>
    </div>
  );
}
