import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";

import { Badge } from "../../../ui/badge";
import type { AiUsageRequest } from "../types/aiUsage.types";

interface RecentRequestsProps {
  data: AiUsageRequest[];
}

export function RecentRequests({ data }: RecentRequestsProps) {
  return (
    <div className="rounded-xl border bg-card">
      <div className="border-b px-6 py-4">
        <h2 className="font-semibold">Requests recentes</h2>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Provider</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Operation</TableHead>
            <TableHead>Tokens</TableHead>
            <TableHead>Latency</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="capitalize">{request.provider}</TableCell>

              <TableCell className="font-medium">{request.model}</TableCell>

              <TableCell>{request.operation}</TableCell>

              <TableCell>{request.totalTokens.toLocaleString()}</TableCell>

              <TableCell>{request.latencyMs}ms</TableCell>

              <TableCell>${request.estimatedCost.toFixed(4)}</TableCell>

              <TableCell>
                <Badge variant={request.success ? "secondary" : "destructive"}>
                  {request.success ? "Success" : "Failed"}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
