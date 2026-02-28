import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

function Section({ title, items, emptyText }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <div className="mt-3 space-y-2 text-sm">
        {items.length === 0 ? <p className="text-slate-500">{emptyText}</p> : null}
        {items.map((item) => (
          <div key={item.leave_id || item.id} className="rounded-lg bg-slate-50 p-2">
            <div className="font-medium">{item.employee || item.name}</div>
            <div className="text-slate-600">{item.reason || item.description}</div>
            {item.start_date ? <div className="text-xs text-slate-500">{item.start_date} to {item.end_date}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Overview() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("/ems/dashboard").then((res) => setDashboard(res.data));
  }, []);

  if (!dashboard) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold">Overview</h2>
      <p className="text-sm text-slate-600">
        Welcome {dashboard.employee.name}, {dashboard.employee.title}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-cyan-50 p-4">
          <p className="text-sm text-slate-600">Role</p>
          <p className="text-lg font-bold capitalize">{dashboard.employee.role}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-sm text-slate-600">Today Leaves</p>
          <p className="text-lg font-bold">{dashboard.today_leaves.length}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm text-slate-600">Upcoming Leaves</p>
          <p className="text-lg font-bold">{dashboard.upcoming_leaves.length}</p>
        </div>
        <div className="rounded-xl bg-violet-50 p-4">
          <p className="text-sm text-slate-600">My Projects</p>
          <p className="text-lg font-bold">{dashboard.my_projects.length}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <Section title="Employees on Leave Today" items={dashboard.today_leaves} emptyText="No one is on leave today." />
        <Section title="Upcoming Leaves" items={dashboard.upcoming_leaves} emptyText="No planned leaves in next 14 days." />
        <Section title="Upcoming Holidays" items={dashboard.upcoming_holidays} emptyText="No holidays found." />
      </div>
    </div>
  );
}
