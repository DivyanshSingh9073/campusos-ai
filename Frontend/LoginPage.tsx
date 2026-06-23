import React, { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Login failed");
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);

      // No routing/backend usage yet—hook this up to your router.
      // eslint-disable-next-line no-console
      console.log("Logged in");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      alert(err instanceof Error ? err.message : "Login failed");
    }
  };

  const handleGoogle = () => {
    // TODO: connect Google OAuth when backend is ready.
    // eslint-disable-next-line no-console
    console.log("Continue with Google");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-gray-400">
            Welcome back. Enter your details to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-gray-100 placeholder:text-gray-500 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-gray-100 placeholder:text-gray-500 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            Login
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-950 px-2 text-gray-500">OR</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full rounded-xl border border-gray-800 bg-gray-950 px-4 py-3 text-sm font-semibold text-gray-100 shadow-sm transition hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-700/60"
          >
            Continue with Google
          </button>

          <p className="pt-2 text-center text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-medium text-indigo-400 hover:text-indigo-300"
            >
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

