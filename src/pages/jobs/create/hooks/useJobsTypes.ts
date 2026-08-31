import { useQuery } from "@tanstack/react-query";

import { getJobTypes } from "../api/create";

export function useJobTypes() {
  return useQuery({
    queryKey: ["jobs", "types"],
    queryFn: getJobTypes,
  });
}
