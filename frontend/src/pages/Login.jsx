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
    <div className="min-vh-100 d-flex align-items-center bg-body-tertiary">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8 col-xl-6">
            <div className="card shadow border-0">
              <div className="card-header bg-primary text-white py-3">
                <h4 className="mb-0">Employee Management System</h4>
                <small className="opacity-75">Sign in to continue</small>
              </div>
              <div className="card-body p-4">
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
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
