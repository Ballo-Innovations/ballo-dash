import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { AuthNotice, AuthShell, PasswordField } from "@/components/auth/AuthShell";
import { fieldErrors, postJson } from "@/lib/api-client";

const lockIcon = <Lock color="white" size={20} aria-hidden="true" />;

export default function ResetPasswordPage() {
  const router = useRouter();
  const token = typeof router.query.token === "string" ? router.query.token : "";
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    setErrors({});
    setProblem(null);
    if (password !== confirm) {
      setErrors({ confirm: "The passwords do not match" });
      return;
    }
    setSubmitting(true);
    const result = await postJson("/api/auth/reset-password", { token, password });
    setSubmitting(false);
    if (result.ok) {
      window.location.assign("/");
      return;
    }
    const byField = fieldErrors(result.error);
    setErrors(byField);
    if (!byField.password) setProblem(result.error.message);
  }

  if (router.isReady && !token) {
    return (
      <AuthShell title="Reset your password">
        <div className="auth-centered">
          <AuthNotice tone="error">This link is incomplete.</AuthNotice>
          <Link href="/forgot-password" className="auth-secondary-button auth-single-action">
            Request a new link
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password">
      <form className="login-form" method="post" onSubmit={handleSubmit} noValidate>
        {problem && (
          <AuthNotice tone="error">
            {problem}{" "}
            <Link href="/forgot-password" className="signup-link">
              Request a new link
            </Link>
          </AuthNotice>
        )}
        <PasswordField id="password" label="New password" icon={lockIcon} autoComplete="new-password" hint="At least 10 characters." required error={errors.password} />
        <PasswordField id="confirm" label="Confirm new password" icon={lockIcon} autoComplete="new-password" required error={errors.confirm} />
        <button type="submit" className="login-button" disabled={submitting || !token} aria-busy={submitting}>
          {submitting ? "Saving..." : "Save and sign in"}
        </button>
        <p className="auth-text">Saving signs you out on every other device.</p>
      </form>
    </AuthShell>
  );
}
