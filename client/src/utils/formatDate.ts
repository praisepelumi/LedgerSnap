import { format, parseISO, isValid } from "date-fns";

export function formatDate(
  dateStr: string | null | undefined,
  pattern: string = "MMM d, yyyy"
): string {
  if (!dateStr) return "—";

  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return "—";
    return format(date, pattern);
  } catch {
    return "—";
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  return formatDate(dateStr, "MMM d, yyyy h:mm a");
}

export function formatDateShort(dateStr: string | null | undefined): string {
  return formatDate(dateStr, "MM/dd/yy");
}
