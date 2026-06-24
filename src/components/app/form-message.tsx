export function FormMessage({
  message,
  tone = "error",
}: {
  message?: string;
  tone?: "error" | "muted";
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={
        tone === "error" ? "text-sm text-rose-600" : "text-sm text-muted-foreground"
      }
    >
      {message}
    </p>
  );
}
