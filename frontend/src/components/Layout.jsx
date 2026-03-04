import React, { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, readEmployee } from "../lib/auth";
import { applyTheme, getSavedTheme, toggleTheme } from "../lib/theme";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: "bi-speedometer2" },
  { to: "/profile", label: "Profile", icon: "bi-person-badge" },
  { to: "/attendance", label: "Attendance", icon: "bi-fingerprint" },
  { to: "/leaves", label: "Leaves", icon: "bi-calendar2-check" },
  { to: "/holidays", label: "Holidays", icon: "bi-calendar2-heart" },
  { to: "/team", label: "Team", icon: "bi-people" },
  { to: "/projects", label: "Projects", icon: "bi-kanban" },
  { to: "/time-logs", label: "Time Logs", icon: "bi-clock-history" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const employee = readEmployee();
  const [theme, setTheme] = useState(getSavedTheme());
  const [search, setSearch] = useState("");

  const navItems = employee?.role === "admin"
    ? [...NAV_ITEMS, { to: "/admin", label: "Admin", icon: "bi-shield-lock" }]
    : NAV_ITEMS;

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return navItems.filter((n) => n.label.toLowerCase().includes(q)).slice(0, 5);
  }, [search, navItems]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const logout = () => {
    clearSession();
    navigate("/");
  };

  const onToggleTheme = () => {
    setTheme((prev) => toggleTheme(prev));
  };

  const goTo = (to) => {
    navigate(to);
    setSearch("");
  };

  const currentPage = navItems.find((item) => item.to === location.pathname)?.label || "Dashboard";

  return (
    <div className="app-shell bg-body-tertiary">
      <div className="container-fluid py-3 py-md-4">
        <div className="row g-3">
          <aside className="col-12 col-lg-3 col-xl-2">
            <div className="card border-0 shadow-sm workspace-sidebar">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="workspace-logo"><i className="bi bi-command"></i></div>
                  <div>
                    <div className="fw-semibold">Pulse Workspace</div>
                    <small className="text-muted">Employee Command Center</small>
                  </div>
                </div>

                <div className="d-grid gap-1 mb-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`workspace-link ${location.pathname === item.to ? "active" : ""}`}
                    >
                      <i className={`bi ${item.icon}`}></i>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                </div>

                <div className="border rounded p-3 bg-body-tertiary mb-3">
                  <div className="fw-semibold">{employee?.full_name || "Employee"}</div>
                  <div className="text-muted small">{employee?.title || ""}</div>
                  <span className="badge text-bg-secondary mt-2 text-capitalize">{employee?.role || "user"}</span>
                </div>

                <div className="d-grid gap-2 mt-auto">
                  <button className="btn btn-outline-secondary" onClick={onToggleTheme}>
                    <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"} me-2`}></i>
                    {theme === "dark" ? "Light" : "Dark"} Mode
                  </button>
                  <button className="btn btn-outline-danger" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <main className="col-12 col-lg-9 col-xl-10">
            <div className="card top-header shadow-sm mb-3">
              <div className="card-body py-3 d-flex flex-column flex-md-row justify-content-between gap-3">
                <div>
                  <h4 className="mb-0">{currentPage}</h4>
                  <small className="text-muted">Optimized dashboard workspace</small>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="position-relative" style={{ minWidth: 240 }}>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-search"></i></span>
                      <input
                        className="form-control"
                        placeholder="Quick jump..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    {searchResults.length > 0 ? (
                      <div className="quick-search-results">
                        {searchResults.map((item) => (
                          <button
                            key={item.to}
                            className="btn btn-sm text-start w-100 border-0 rounded-0 py-2"
                            onClick={() => goTo(item.to)}
                          >
                            <i className={`bi ${item.icon} me-2`}></i>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <button className="btn btn-light border" title="Notifications">
                    <i className="bi bi-bell"></i>
                  </button>

                  <div className="border rounded-3 px-3 py-2 bg-body d-flex align-items-center gap-2">
                    <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                      <i className="bi bi-person"></i>
                    </div>
                    <div>
                      <div className="fw-semibold lh-1">{employee?.full_name || "Employee"}</div>
                      <small className="text-muted">{employee?.title || "Team Member"}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-3 p-md-4">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
