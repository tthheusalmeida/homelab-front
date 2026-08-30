import { Card, CardContent } from "../../../ui/card";

import { ErrorState } from "../../../components/ErrorState";
import { LoadingState } from "../../../components/LoadingState";

import { JobList } from "./components/JobList";
import { useJobs } from "./hooks/useJobs";

export function TrackPage() {
  const { data, isLoading, isError } = useJobs();

  if (isLoading) {
    return (
      <div className="flex min-h-[80dvh] items-center justify-center">
        <LoadingState message="Carregando" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <ErrorState
            primaryMessage="Oops! houve uma falha ao carregar os jobs."
            secondaryMessage="Tente novamente mais tarde."
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>

        <p className="text-sm text-muted-foreground">
          Acompanhe o processamento dos jobs e seus respectivos resultados.
        </p>
      </div>

      <JobList jobs={data} />
    </div>
  );
}
