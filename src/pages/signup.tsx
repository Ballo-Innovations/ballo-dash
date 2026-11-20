import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Building2, Lock, Mail, UserRound } from "lucide-react";
import { AuthField, AuthNotice, AuthShell, PasswordField } from "@/components/auth/AuthShell";
import { fieldErrors, postJson } from "@/lib/api-client";
import { checkSignup } from "@/lib/signup-validation";

const icon = (Icon: typeof Mail) => <Icon color="white" size={20} aria-hidden="true" />;

export default function SignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [problem, setProblem] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = {
      companyName: String(form.get("companyName") ?? ""),
      firstName: String(form.get("firstName") ?? ""),
      lastName: String(form.get("lastName") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    setErrors({});
    setProblem(null);
    // Catch obvious mistakes here so they do not use up the server's sign-up limit.
    const local = checkSignup({ ...body, confirmPassword });
    if (Object.keys(local).length > 0) {
      setErrors(local);
      return;
    }
    setSubmitting(true);
    const result = await postJson("/api/auth/signup", body);
    setSubmitting(false);
    if (result.ok) {
      setSentTo(body.email.trim());
      return;
    }
    const byField = fieldErrors(result.error);
    setErrors(byField);
    if (Object.keys(byField).length === 0) setProblem(result.error.message);
  }

  async function resend() {
    if (!sentTo) return;
    await postJson("/api/auth/resend-verification", { email: sentTo });
    setResent(true);
  }

  if (sentTo) {
    return (
      <AuthShell title="Check your inbox">
        <div className="auth-centered">
          <AuthNotice tone="success">
            We sent a confirmation link to <strong>{sentTo}</strong>. Open it within 24 hours to finish creating your account.
          </AuthNotice>
          <p className="auth-text">Nothing there? Check spam, or send the link again.</p>
          <div className="auth-actions">
            <Link href="/login" className="auth-secondary-button">
              Back to sign in
            </Link>
            <button type="button" className="login-button" onClick={resend} disabled={resent}>
              {resent ? "Link sent again" : "Send the link again"}
            </button>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account">
      <form className="login-form" method="post" onSubmit={handleSubmit} noValidate>
        {problem && <AuthNotice tone="error">{problem}</AuthNotice>}
        <AuthField id="companyName" label="Company name" icon={icon(Building2)} autoComplete="organization" required error={errors.companyName} />
        <div className="auth-row">
          <AuthField id="firstName" label="First name" icon={icon(UserRound)} autoComplete="given-name" required error={errors.firstName} />
          <AuthField id="lastName" label="Last name" icon={icon(UserRound)} autoComplete="family-name" required error={errors.lastName} />
        </div>
        <AuthField
          id="email"
          label="Work email"
          type="email"
          icon={icon(Mail)}
          autoComplete="email"
          placeholder="you@company.com"
          required
          error={errors.email}
        />
        <PasswordField
          id="password"
          label="Password"
          icon={icon(Lock)}
          autoComplete="new-password"
          hint="At least 10 characters."
          required
          error={errors.password}
        />
        <PasswordField
          id="confirmPassword"
          label="Confirm password"
          icon={icon(Lock)}
          autoComplete="new-password"
          required
          error={errors.confirmPassword}
        />
        <button type="submit" className="login-button" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Creating account..." : "Create account"}
        </button>
        <p className="signup-text">
          Already have an account?{" "}
          <Link href="/login" className="signup-link">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
