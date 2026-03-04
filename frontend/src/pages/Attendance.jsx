import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";

export default function Attendance() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const toast = useToast();

  const refresh = () => api.get("/ems/attendance").then((res) => setRows(res.data));

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) => String(r.work_date).toLowerCase().includes(q) || String(r.status).toLowerCase().includes(q));
  }, [rows, query]);

  const presentCount = rows.filter((r) => r.status === "present").length;

  const markCheckIn = async () => {
    try {
      await api.post("/ems/attendance/check-in", { status: "present" });
      await refresh();
      toast.success("Check-in marked successfully.", { title: "Attendance" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to mark check-in.", { title: "Attendance" });
    }
  };

  const markCheckOut = async () => {
    try {
      await api.post("/ems/attendance/check-out");
      await refresh();
      toast.success("Check-out marked successfully.", { title: "Attendance" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to mark check-out.", { title: "Attendance" });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1"><i className="bi bi-fingerprint me-2"></i>Attendance Hub</h2>
          <p className="text-muted mb-0">Mark attendance and review recent daily records.</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={markCheckIn}><i className="bi bi-box-arrow-in-right me-1"></i>Check In</button>
          <button className="btn btn-warning" onClick={markCheckOut}><i className="bi bi-box-arrow-right me-1"></i>Check Out</button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Total Records</small><div className="h5 mb-0">{rows.length}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Present</small><div className="h5 mb-0">{presentCount}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Today Status</small><div className="h5 mb-0 text-capitalize">{rows[0]?.status || "-"}</div></div></div></div>
        <div className="col-6 col-md-3"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Last Check In</small><div className="h6 mb-0">{rows[0]?.check_in || "-"}</div></div></div></div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-transparent d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="mb-0"><i className="bi bi-table me-2"></i>Attendance Records</h6>
          <div className="input-group" style={{ maxWidth: 280 }}>
            <span className="input-group-text"><i className="bi bi-search"></i></span>
            <input className="form-control" placeholder="Search by date/status" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-muted">No attendance records found.</td></tr>
              ) : filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.work_date}</td>
                  <td><span className="badge text-bg-secondary text-capitalize">{row.status}</span></td>
                  <td>{row.check_in || "-"}</td>
                  <td>{row.check_out || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
