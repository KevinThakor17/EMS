import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

function formatActivity(item) {
  if (item.type === "time") {
    return `Logged ${item.hours}h on ${item.project}`;
  }
  if (item.type === "leave_today") {
    return `${item.employee} is on leave today`;
  }
  if (item.type === "leave_upcoming") {
    return `${item.employee} upcoming leave (${item.start_date})`;
  }
  return item.label;
}

export default function Overview() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    Promise.all([api.get("/ems/dashboard"), api.get("/ems/time-logs")]).then(([dash, timeLogs]) => {
      setDashboard(dash.data);
      setLogs(timeLogs.data || []);
    });
  }, []);

  const activities = useMemo(() => {
    if (!dashboard) return [];

    const timeActivities = logs.slice(0, 4).map((log) => ({
      type: "time",
      key: `t-${log.id}`,
      when: log.work_date,
      hours: log.hours,
      project: log.project,
    }));

    const today = dashboard.today_leaves.slice(0, 3).map((leave) => ({
      type: "leave_today",
      key: `d-${leave.leave_id}`,
      when: leave.start_date,
      employee: leave.employee,
    }));

    const upcoming = dashboard.upcoming_leaves.slice(0, 3).map((leave) => ({
      type: "leave_upcoming",
      key: `u-${leave.leave_id}`,
      when: leave.start_date,
      employee: leave.employee,
      start_date: leave.start_date,
    }));

    return [...timeActivities, ...today, ...upcoming].slice(0, 8);
  }, [dashboard, logs]);

  if (!dashboard) return <p className="text-muted mb-0">Loading dashboard...</p>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1"><i className="bi bi-stars me-2"></i>Workspace Pulse</h2>
          <p className="text-muted mb-0">A fresh operational snapshot for people, leave, and delivery.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/attendance")}><i className="bi bi-fingerprint me-1"></i>Check In</button>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/time-logs")}><i className="bi bi-clock-history me-1"></i>Log Time</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("/leaves")}><i className="bi bi-calendar2-plus me-1"></i>Apply Leave</button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card metric-card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small">Role</span><i className="bi bi-person-workspace text-primary"></i>
              </div>
              <div className="h5 mb-0 mt-2 text-capitalize">{dashboard.employee.role}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card metric-card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small">On Leave Today</span><i className="bi bi-calendar2-check text-primary"></i>
              </div>
              <div className="h5 mb-0 mt-2">{dashboard.today_leaves.length}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card metric-card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small">Upcoming Leaves</span><i className="bi bi-calendar-week text-primary"></i>
              </div>
              <div className="h5 mb-0 mt-2">{dashboard.upcoming_leaves.length}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="card metric-card shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <span className="text-muted small">Active Projects</span><i className="bi bi-kanban text-primary"></i>
              </div>
              <div className="h5 mb-0 mt-2">{dashboard.my_projects.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
              <h6 className="mb-0"><i className="bi bi-people me-2 text-primary"></i>Team Leave Board</h6>
              <button className="btn btn-sm btn-light border" onClick={() => navigate("/leaves")}>Manage</button>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Reason</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.today_leaves.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted py-4">No employees on leave today.</td></tr>
                  ) : (
                    dashboard.today_leaves.map((item) => (
                      <tr key={item.leave_id}>
                        <td className="fw-semibold">{item.employee}</td>
                        <td>{item.reason}</td>
                        <td>{item.start_date}</td>
                        <td>{item.end_date}</td>
                        <td><span className="badge text-bg-success">Today</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0 mb-3">
            <div className="card-header bg-transparent"><h6 className="mb-0"><i className="bi bi-lightning-charge me-2 text-primary"></i>Quick Actions</h6></div>
            <div className="card-body d-grid gap-2">
              <button className="btn btn-light border text-start" onClick={() => navigate("/profile")}><i className="bi bi-person-vcard me-2"></i>View Profile</button>
              <button className="btn btn-light border text-start" onClick={() => navigate("/team")}><i className="bi bi-people me-2"></i>Open Team View</button>
              <button className="btn btn-light border text-start" onClick={() => navigate("/projects")}><i className="bi bi-kanban me-2"></i>Open Projects</button>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-transparent"><h6 className="mb-0"><i className="bi bi-activity me-2 text-primary"></i>Live Activity Feed</h6></div>
            <div className="card-body">
              {activities.length === 0 ? (
                <p className="text-muted mb-0">No activity yet.</p>
              ) : (
                <div className="d-grid gap-2">
                  {activities.map((item) => (
                    <div key={item.key} className="d-flex align-items-start gap-2 border rounded p-2 bg-body-tertiary">
                      <span className="activity-dot mt-2"></span>
                      <div>
                        <div className="small fw-semibold">{formatActivity(item)}</div>
                        <div className="small text-muted">{item.when}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
