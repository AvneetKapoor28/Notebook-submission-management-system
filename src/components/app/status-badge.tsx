import { Badge } from "@/components/ui/badge";
import {
  COMPLETION_STATUS_LABELS,
  COMPLETION_STATUS_TONE,
  SUBMISSION_STATUS_LABELS,
  SUBMISSION_STATUS_TONE,
} from "@/lib/constants";

export function SubmissionStatusBadge({
  status,
}: {
  status: keyof typeof SUBMISSION_STATUS_LABELS;
}) {
  return (
    <Badge variant={SUBMISSION_STATUS_TONE[status]}>
      {SUBMISSION_STATUS_LABELS[status]}
    </Badge>
  );
}

export function CompletionStatusBadge({
  status,
}: {
  status: keyof typeof COMPLETION_STATUS_LABELS;
}) {
  return (
    <Badge variant={COMPLETION_STATUS_TONE[status]}>
      {COMPLETION_STATUS_LABELS[status]}
    </Badge>
  );
}
