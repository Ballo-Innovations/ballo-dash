import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import { AuthField, AuthNotice, AuthShell } from "@/components/auth/AuthShell";
import { postJson } from "@/lib/api-client";

type State = "checking" | "failed" | "resent";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!router.isReady || started.current) return;
    started.current = true;
    const token = typeof router.query.token === "string" ? router.query.token : "";
    if (!token) {
      setMessage("This link is incomplete. Request a new one below.");
      setState("failed");
      return;
    }
    void postJson("/api/auth/verify-email", { token }).then((result) => {
      if (result.ok) {
        // Signed in by the API; full load so the app starts with the new session.
        window.location.assign("/");
        return;
      }
      setMessage(result.error.message);
      setState("failed");
    });
  }, [router.isReady, router.query.token]);

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    await postJson("/api/auth/resend-verification", { email });
    setState("resent");
  }

  if (state === "checking") {
    return (
      <AuthShell title="Confirming your email">
        <AuthNotice>One moment...</AuthNotice>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Confirm your email">
      {state === "resent" ? (
        <div className="auth-centered">
          <AuthNotice tone="success">If that address has an unconfirmed account, a new link is on its way.</AuthNotice>
        </div>
      ) : (
        <>
          <AuthNotice tone="error">{message}</AuthNotice>
          <form className="login-form" method="post" onSubmit={resend}>
            <AuthField id="email" label="Email" type="email" icon={<Mail color="white" size={20} aria-hidden="true" />} autoComplete="email" required />
            <button type="submit" className="login-button">
              Send a new link
            </button>
          </form>
        </>
      )}
      <p className="signup-text">
        <Link href="/login" className="signup-link">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
