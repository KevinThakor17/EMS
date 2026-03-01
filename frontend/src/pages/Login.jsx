import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { saveSession } from "../lib/auth";
import { useToast } from "../components/ToastProvider";
import { applyTheme, getSavedTheme, toggleTheme } from "../lib/theme";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("employee@company.com");
  const [password, setPassword] = useState("employee123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(getSavedTheme());

  React.useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const onLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      saveSession(data);
      toast.success("Logged in successfully.", { title: "Authentication" });
      navigate("/dashboard");
    } catch (err) {
      const message = err?.response?.data?.detail || "Unable to login";
      setError(message);
      toast.error(message, { title: "Authentication" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-body-tertiary">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="card shadow border-0">
              <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                    <i className="bi bi-buildings"></i>
                  </div>
                  <div>
                    <h4 className="mb-0">Employee Management System</h4>
                    <small className="opacity-75">Sign in to continue</small>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-light" onClick={() => setTheme((prev) => toggleTheme(prev))}>
                  <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`}></i>
                </button>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label"><i className="bi bi-envelope me-2"></i>Email</label>
                  <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label"><i className="bi bi-key me-2"></i>Password</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error ? <div className="alert alert-danger py-2">{error}</div> : null}
                <button className="btn btn-primary w-100" onClick={onLogin} disabled={loading}>
                  {loading ? "Signing in..." : "Login"}
                </button>

                <div className="mt-3 small text-muted">
                  Demo users: employee@company.com / employee123, lead@company.com / lead123, admin@company.com / admin123
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
