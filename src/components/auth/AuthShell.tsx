import Head from "next/head";
import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import NavBar from "@views/Landing/Navbar";

/** Shared frame for sign-in, sign-up and account pages: background video and the glass card. */
export function AuthShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section id="login-section">
      <Head>
        <title>{`${title} | Ballo Dash`}</title>
      </Head>
      <NavBar />
      <div className="home container-fluid">
        <video className="home-bg-video" muted loop autoPlay playsInline src="/videos/background.mp4" aria-hidden="true" />
        <div className="home-content-wrapper">
          <main className="login-container">
            <h1 className="login-title h2">{title}</h1>
            {children}
          </main>
        </div>
      </div>
    </section>
  );
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

/** Labelled input; errors are announced and tied to the input for screen readers. */
export function AuthField({ id, label, icon, error, hint, ...input }: FieldProps) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
      </label>
      <div className="form-input-wrapper gap-2" style={{ position: "relative" }}>
        {icon}
        <input id={id} name={id} className="form-input" aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
      </div>
      {hint && !error && (
        <small id={`${id}-hint`} className="auth-hint">
          {hint}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className="auth-error" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

export function PasswordField(props: Omit<FieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-password">
      <AuthField {...props} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="eye-button auth-eye"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={props.id}
      >
        {visible ? <EyeOff size={20} color="white" /> : <Eye size={20} color="white" />}
      </button>
    </div>
  );
}

export function AuthNotice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: ReactNode }) {
  return (
    <div className={`auth-notice auth-notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}
