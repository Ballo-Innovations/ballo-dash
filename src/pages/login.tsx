"use client";

import { signIn } from "next-auth/react";
import NavBar from "@views/Landing/Navbar";
import React, { useState } from "react";
import { Lock, UserRound, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { safeCallbackUrl } from "@/lib/safe-redirect";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams?.get("callbackUrl"));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Logging in...");

    // Read from the form, not React state: values typed (or autofilled) before
    // hydration never reach state, and would otherwise be submitted as empty.
    const form = new FormData(e.currentTarget as HTMLFormElement);
    const res = await signIn("credentials", {
      username: String(form.get("username") ?? username),
      password: String(form.get("password") ?? password),
      redirect: false,
      callbackUrl,
    });

    if (res?.ok) {
      toast.success("Signed in", { id: toastId });
      // Full page load, not router.push: links prefetched while signed out
      // (for example "Dashboard" in the top bar) are cached as redirects to
      // /login, and a client-side push would replay that redirect.
      window.location.assign(callbackUrl);
      return;
    } else {
      // NextAuth passes a thrown authorize() error's message through (used for rate limiting).
      const message = res?.error && res.error !== "CredentialsSignin" ? res.error : "Invalid email or password";
      toast.error(message, { id: toastId });
    }

    setLoading(false);
  };

  return (
    <section id="login-section">
      <NavBar />
      <div className="home container-fluid">
        <video
          className="home-bg-video"
          muted
          loop
          autoPlay
          playsInline
          src="/videos/background.mp4"
        />
        <div className="home-content-wrapper">
          <div className="login-container">
            <h2 className="login-title">Log in</h2>
            <form className="login-form" method="post" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-input-wrapper gap-2">
                  <UserRound color="white" size={20} />
                  <input
                    type="text"
                    placeholder="Username"
                    className="form-input"
                    name="username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div
                  className="form-input-wrapper gap-2"
                  style={{ position: "relative" }}
                >
                  <Lock color="white" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="form-input"
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="eye-button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={{ background: "none", border: "none" }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="white" />
                    ) : (
                      <Eye size={20} color="white" />
                    )}
                  </button>
                </div>
              </div>
              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  Remember Me
                </label>
                <a href="#" className="forgot-link">
                  Forgot Password?
                </a>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={loading ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                className="login-button"
              >
                Sign in
              </button>
              {/* <p className="signup-text">
                or{" "}
                <a href="#" className="signup-link">
                  Sign up
                </a>
              </p> */}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
