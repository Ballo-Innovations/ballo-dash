import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { AuthField, AuthNotice, AuthShell, PasswordField } from "@/components/auth/AuthShell";
import { postJson } from "@/lib/api-client";
import { safeCallbackUrl } from "@/lib/safe-redirect";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams?.get("callbackUrl"));

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Read from the form, not React state: values typed or autofilled before
    // hydration never reach state.
    const form = new FormData(event.currentTarget);
    const email = String(form.get("username") ?? "");
    const password = String(form.get("password") ?? "");
    setLoading(true);
    setUnverifiedEmail(null);
    setResent(false);

    const result = await postJson("/api/auth/login", { email, password });
    if (result.ok) {
      toast.success("Signed in");
      // Full page load, not router.push: links prefetched while signed out are
      // cached as redirects to /login, and a client-side push would replay them.
      window.location.assign(callbackUrl);
      return;
    }
    setLoading(false);
    const details = result.error.details as { reason?: string } | undefined;
    if (details?.reason === "email_not_verified") {
      setUnverifiedEmail(email.trim());
      return;
    }
    toast.error(result.status === 401 ? "Invalid email or password" : result.error.message);
  };

  const resend = async () => {
    if (!unverifiedEmail) return;
    await postJson("/api/auth/resend-verification", { email: unverifiedEmail });
    setResent(true);
  };

  return (
    <AuthShell title="Log in">
      <form className="login-form" method="post" onSubmit={handleLogin}>
        {unverifiedEmail && (
          <AuthNotice tone="error">
            Confirm your email address first. Check your inbox for the link from Ballo Dash.{" "}
            <button type="button" className="auth-inline-button" onClick={resend} disabled={resent}>
              {resent ? "Link sent again" : "Send the link again"}
            </button>
          </AuthNotice>
        )}
        <AuthField
          id="username"
          label="Email"
          type="email"
          icon={<Mail color="white" size={20} aria-hidden="true" />}
          placeholder="you@company.com"
          autoComplete="username"
          required
        />
        <PasswordField
          id="password"
          label="Password"
          icon={<Lock color="white" size={20} aria-hidden="true" />}
          placeholder="Password"
          autoComplete="current-password"
          required
        />
        <div className="form-options">
          <span />
          <Link href="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className="login-button">
          {loading ? "Signing in..." : "Sign in"}
        </button>
        <p className="signup-text">
          New to Ballo Dash?{" "}
          <Link href="/signup" className="signup-link">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;
