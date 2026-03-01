import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

function Section({ title, items, emptyText }) {
  return (
    <div className="card h-100">
      <div className="card-header fw-semibold">{title}</div>
      <div className="card-body">
        {items.length === 0 ? <p className="text-muted mb-0">{emptyText}</p> : null}
        <div className="d-grid gap-2">
          {items.map((item) => (
            <div key={item.leave_id || item.id} className="border rounded p-2 bg-light">
              <div className="fw-semibold">{item.employee || item.name}</div>
              <div className="small text-muted">{item.reason || item.description}</div>
              {item.start_date ? <div className="small text-secondary">{item.start_date} to {item.end_date}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Overview() {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    api.get("/ems/dashboard").then((res) => setDashboard(res.data));
  }, []);

  if (!dashboard) return <p className="text-muted mb-0">Loading dashboard...</p>;

  return (
    <div>
      <h2 className="h4 mb-1">Overview</h2>
      <p className="text-muted">Welcome {dashboard.employee.name}, {dashboard.employee.title}</p>

      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3"><div className="card text-bg-primary"><div className="card-body"><div className="small">Role</div><div className="fw-bold text-capitalize">{dashboard.employee.role}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-bg-success"><div className="card-body"><div className="small">Today Leaves</div><div className="fw-bold">{dashboard.today_leaves.length}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-bg-warning"><div className="card-body"><div className="small">Upcoming Leaves</div><div className="fw-bold">{dashboard.upcoming_leaves.length}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card text-bg-secondary"><div className="card-body"><div className="small">My Projects</div><div className="fw-bold">{dashboard.my_projects.length}</div></div></div></div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-4"><Section title="Employees on Leave Today" items={dashboard.today_leaves} emptyText="No one is on leave today." /></div>
        <div className="col-12 col-xl-4"><Section title="Upcoming Leaves" items={dashboard.upcoming_leaves} emptyText="No planned leaves in next 14 days." /></div>
        <div className="col-12 col-xl-4"><Section title="Upcoming Holidays" items={dashboard.upcoming_holidays} emptyText="No holidays found." /></div>
      </div>
    </div>
  );
}
