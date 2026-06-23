import { useState } from "react";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const EyeIcon = ({ open }: { open: boolean }) =>
  open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4.5 h-4.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4.5 h-4.5">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validate()) {
      // No backend — placeholder
      alert("Login successful (demo)");
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] flex items-center justify-center px-4 py-12 overflow-hidden">

      {/* Ambient orb — the signature element */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[-120px] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(108,99,255,0.18) 0%, rgba(139,92,246,0.08) 40%, transparent 70%)",
          filter: "blur(32px)",
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 text-center">
          <span
            className="inline-block text-2xl font-bold tracking-tight text-white"
            style={{ letterSpacing: "-0.03em" }}
          >
            app<span className="text-[#6C63FF]">.</span>
          </span>
          <p className="mt-1 text-sm text-[#64748B]">Welcome back</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#111118] px-6 py-8 shadow-2xl">

          {/* Google button */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-[#E2E8F0] transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#6C63FF] active:scale-[0.98]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <hr className="flex-1 border-white/10" />
            <span className="text-xs text-[#64748B]">or</span>
            <hr className="flex-1 border-white/10" />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-xs font-medium text-[#94A3B8]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 text-sm text-[#E2E8F0] placeholder-[#3B4558] outline-none transition-colors focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 ${
                errors.email ? "border-red-500/60" : "border-white/10"
              }`}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-2">
            <label
              htmlFor="password"
              className="mb-1.5 block text-xs font-medium text-[#94A3B8]"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                className={`w-full rounded-xl border bg-white/5 px-4 py-2.5 pr-10 text-sm text-[#E2E8F0] placeholder-[#3B4558] outline-none transition-colors focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 ${
                  errors.password ? "border-red-500/60" : "border-white/10"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#94A3B8] transition-colors focus-visible:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Forgot password */}
          <div className="mb-6 text-right">
            <a
              href="#"
              className="text-xs text-[#6C63FF] hover:text-[#8B5CF6] transition-colors focus-visible:outline-none focus-visible:underline"
            >
              Forgot password?
            </a>
          </div>

          {/* Login button */}
          <button
            type="submit"
            onClick={handleLogin}
            className="w-full rounded-xl bg-[#6C63FF] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#6C63FF]/20 transition-all hover:bg-[#7C6FFF] hover:shadow-[#6C63FF]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C63FF] active:scale-[0.98]"
          >
            Log in
          </button>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-[#64748B]">
          Don't have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-[#6C63FF] hover:text-[#8B5CF6] transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
