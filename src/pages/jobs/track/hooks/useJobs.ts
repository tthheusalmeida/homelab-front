import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "../api/track";

export function useJobs() {
  return useQuery({
    queryKey: ["jobs"],
    queryFn: fetchJobs,
    refetchInterval: 1_000,
  });
}
