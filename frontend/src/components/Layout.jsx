import React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearSession, readEmployee } from "../lib/auth";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview" },
  { to: "/profile", label: "Profile" },
  { to: "/attendance", label: "Attendance" },
  { to: "/leaves", label: "Leaves" },
  { to: "/holidays", label: "Holidays" },
  { to: "/team", label: "Team" },
  { to: "/projects", label: "Projects" },
  { to: "/time-logs", label: "Time Logs" },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const employee = readEmployee();
  const navItems = employee?.role === "admin" ? [...NAV_ITEMS, { to: "/admin", label: "Admin" }] : NAV_ITEMS;

  const logout = () => {
    clearSession();
    navigate("/");
  };

  const closeMobileMenu = () => {
    const menu = document.getElementById("mobileMenu");
    if (!menu) return;

    const bs = window.bootstrap;
    if (bs?.Offcanvas) {
      const instance = bs.Offcanvas.getInstance(menu) || new bs.Offcanvas(menu);
      instance.hide();
      return;
    }

    menu.classList.remove("show");
    document.body.classList.remove("offcanvas-backdrop");
  };

  const mobileNavigate = (to) => {
    navigate(to);
    closeMobileMenu();
  };

  const renderNav = (isMobile = false) => (
    <>
      <div className="list-group list-group-flush mb-3">
        {navItems.map((item) => (
          isMobile ? (
            <button
              key={item.to}
              type="button"
              className={`list-group-item list-group-item-action border-0 rounded mb-1 ${location.pathname === item.to ? "active" : ""}`}
              onClick={() => mobileNavigate(item.to)}
            >
              {item.label}
            </button>
          ) : (
            <Link
              key={item.to}
              to={item.to}
              className={`list-group-item list-group-item-action border-0 rounded mb-1 ${location.pathname === item.to ? "active" : ""}`}
            >
              {item.label}
            </Link>
          )
        ))}
      </div>

      <div className="border rounded p-3 bg-light mb-3">
        <div className="fw-semibold">{employee?.full_name || "Employee"}</div>
        <div className="text-muted small">{employee?.title || ""}</div>
        <span className="badge text-bg-secondary mt-2 text-capitalize">{employee?.role || "user"}</span>
      </div>

      <button className="btn btn-outline-danger mt-auto" onClick={logout}>
        Logout
      </button>
    </>
  );

  return (
    <div className="bg-light min-vh-100">
      <div className="container-fluid py-3">
        <div className="d-lg-none mb-3">
          <div className="card shadow-sm border-0">
            <div className="card-body d-flex justify-content-between align-items-center py-2">
              <div>
                <h6 className="mb-0">EMS Workspace</h6>
                <small className="text-muted">Operations Console</small>
              </div>
              <button
                className="btn btn-outline-primary"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileMenu"
                aria-controls="mobileMenu"
              >
                Menu
              </button>
            </div>
          </div>
        </div>

        <div className="offcanvas offcanvas-start d-lg-none" tabIndex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
          <div className="offcanvas-header">
            <h5 className="offcanvas-title" id="mobileMenuLabel">Navigation</h5>
            <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div className="offcanvas-body d-flex flex-column">
            {renderNav(true)}
          </div>
        </div>

        <div className="row g-3">
          <aside className="d-none d-lg-block col-lg-3 col-xl-2">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">EMS Workspace</h5>
                <small className="opacity-75">Operations Console</small>
              </div>
              <div className="card-body d-flex flex-column">
                {renderNav()}
              </div>
            </div>
          </aside>

          <main className="col-12 col-lg-9 col-xl-10">
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
