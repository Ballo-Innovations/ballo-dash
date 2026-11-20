import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { AuthField, AuthNotice, AuthShell } from "@/components/auth/AuthShell";
import { fieldErrors, postJson } from "@/lib/api-client";

export default function ForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setSubmitting(true);
    setError(null);
    const result = await postJson("/api/auth/forgot-password", { email });
    setSubmitting(false);
    if (result.ok) setSent(true);
    else setError(fieldErrors(result.error).email ?? result.error.message);
  }

  return (
    <AuthShell title="Reset your password">
      {sent ? (
        <AuthNotice tone="success">
          If an account uses that address, we have sent a link to choose a new password. It works for one hour.
        </AuthNotice>
      ) : (
        <form className="login-form" method="post" onSubmit={handleSubmit} noValidate>
          <p className="auth-text">Enter the email you sign in with and we will send you a reset link.</p>
          <AuthField
            id="email"
            label="Email"
            type="email"
            icon={<Mail color="white" size={20} aria-hidden="true" />}
            autoComplete="email"
            placeholder="you@company.com"
            required
            error={error ?? undefined}
          />
          <button type="submit" className="login-button" disabled={submitting} aria-busy={submitting}>
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
      <p className="signup-text">
        <Link href="/login" className="signup-link">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
