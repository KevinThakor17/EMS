import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { saveSession } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("employee@company.com");
  const [password, setPassword] = useState("employee123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-slate-900">Employee Management System</h2>
        <p className="mt-2 text-sm text-slate-500">Sign in to continue</p>

        <div className="mt-6 space-y-4">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <button
            className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
            onClick={onLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          Demo users: `employee@company.com / employee123`, `lead@company.com / lead123`, `admin@company.com / admin123`
        </div>
      </div>
    </div>
  );
}
