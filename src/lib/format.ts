import { format, formatDistanceToNowStrict } from "date-fns";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return "—";
  }

  return format(new Date(date), "dd MMM yyyy");
}

export function formatShortDate(date: Date | string | null | undefined) {
  if (!date) {
    return "—";
  }

  return format(new Date(date), "dd MMM");
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) {
    return "—";
  }

  return `${formatDistanceToNowStrict(new Date(date))} ago`;
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }

  return `${Math.round(value)}%`;
}
