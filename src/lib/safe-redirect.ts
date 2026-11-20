/** Returns `value` only when it is a same-site relative path; otherwise "/". Prevents open redirects. */
export function safeCallbackUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  if (/[\u0000-\u001f]/.test(value)) return "/";
  return value;
}
