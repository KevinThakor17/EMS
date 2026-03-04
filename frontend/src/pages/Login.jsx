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
          <div className="col-12 col-md-11 col-lg-10 col-xl-9">
            <div className="card border-0 shadow-sm overflow-hidden">
              <div className="row g-0">
                <div className="col-12 col-lg-5 bg-primary text-white p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="workspace-logo mb-3 bg-white text-primary"><i className="bi bi-command"></i></div>
                    <h3 className="h4">Pulse Workspace</h3>
                    <p className="opacity-75 mb-0">A smarter employee experience for attendance, leave, project flow, and team operations.</p>
                  </div>
                  <div className="small opacity-75 mt-4">
                    Demo users: employee@company.com / employee123<br />
                    lead@company.com / lead123<br />
                    admin@company.com / admin123
                  </div>
                </div>

                <div className="col-12 col-lg-7 p-4 p-md-5">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="mb-0">Sign In</h4>
                      <small className="text-muted">Continue to your workspace</small>
                    </div>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setTheme((prev) => toggleTheme(prev))}>
                      <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`}></i>
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope"></i></span>
                      <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-key"></i></span>
                      <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>

                  {error ? <div className="alert alert-danger py-2">{error}</div> : null}

                  <button className="btn btn-primary w-100" onClick={onLogin} disabled={loading}>
                    {loading ? "Signing in..." : "Access Workspace"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
