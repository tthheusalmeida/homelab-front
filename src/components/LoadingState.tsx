export function LoadingState() {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <span>Carregando</span>

      <span className="flex gap-0.5">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="animate-bounce"
            style={{ animationDelay: `${delay}ms` }}
          >
            .
          </span>
        ))}
      </span>
    </div>
  );
}
