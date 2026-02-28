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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl bg-slate-900 p-4 text-slate-100 shadow-lg">
          <h1 className="text-xl font-bold">EMS</h1>
          <p className="mt-1 text-sm text-slate-300">Employee Management</p>

          <div className="mt-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block rounded-lg px-3 py-2 text-sm transition ${
                  location.pathname === item.to ? "bg-cyan-500 text-white" : "hover:bg-slate-700"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-lg bg-slate-800 p-3 text-sm">
            <div className="font-semibold">{employee?.full_name || "Employee"}</div>
            <div className="text-slate-300">{employee?.title || ""}</div>
          </div>

          <button
            className="mt-4 w-full rounded-lg bg-rose-500 px-3 py-2 text-sm font-medium text-white hover:bg-rose-600"
            onClick={logout}
          >
            Logout
          </button>
        </aside>

        <main className="rounded-2xl bg-white p-5 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
