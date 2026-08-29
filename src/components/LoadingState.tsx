interface LoadingStateProps {
  message: string;
  loading?: boolean;
}

export function LoadingState({ message, loading = true }: LoadingStateProps) {
  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <span>{message}</span>

      {loading && (
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
      )}
    </div>
  );
}
