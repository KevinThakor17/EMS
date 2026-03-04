import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { readEmployee } from "../lib/auth";
import { useToast } from "../components/ToastProvider";

const statusBadge = (status) => {
  if (status === "approved") return "badge text-bg-success";
  if (status === "rejected") return "badge text-bg-danger";
  return "badge text-bg-warning";
};

export default function Leaves() {
  const current = readEmployee();
  const isAdmin = current?.role === "admin";
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const refresh = async () => {
    const [mine, all] = await Promise.all([
      api.get("/ems/leaves"),
      isAdmin ? api.get("/ems/leaves/all") : Promise.resolve({ data: [] }),
    ]);
    setRows(mine.data);
    setAllRows(all.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const counters = useMemo(() => {
    const pending = rows.filter((r) => r.status === "pending").length;
    const approved = rows.filter((r) => r.status === "approved").length;
    const rejected = rows.filter((r) => r.status === "rejected").length;
    return { pending, approved, rejected };
  }, [rows]);

  const apply = async () => {
    try {
      await api.post("/ems/leaves", { reason, start_date: startDate, end_date: endDate });
      setReason("");
      setStartDate("");
      setEndDate("");
      await refresh();
      toast.success("Leave request submitted.", { title: "Leave" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to submit leave request.", { title: "Leave" });
    }
  };

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      await api.put(`/ems/leaves/${leaveId}`, { status });
      await refresh();
      toast.success(`Leave ${status}.`, { title: "Leave Review" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update leave status.", { title: "Leave Review" });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1"><i className="bi bi-calendar2-range me-2"></i>Leave Desk</h2>
          <p className="text-muted mb-0">Plan leave, track status, and resolve approvals quickly.</p>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Pending</small><div className="h5 mb-0">{counters.pending}</div></div></div></div>
        <div className="col-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Approved</small><div className="h5 mb-0">{counters.approved}</div></div></div></div>
        <div className="col-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Rejected</small><div className="h5 mb-0">{counters.rejected}</div></div></div></div>
      </div>

      <div className="card mb-3 border-0 shadow-sm">
        <div className="card-header bg-transparent"><h6 className="mb-0"><i className="bi bi-plus-circle me-2"></i>Apply New Leave</h6></div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4"><label className="form-label">Reason</label><input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <div className="col-6 col-md-3"><label className="form-label">Start Date</label><input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div className="col-6 col-md-3"><label className="form-label">End Date</label><input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            <div className="col-12 col-md-2"><button className="btn btn-primary w-100" onClick={apply}>Apply</button></div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-transparent"><h6 className="mb-0"><i className="bi bi-list-check me-2"></i>My Leave Requests</h6></div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Reason</th><th>Start</th><th>End</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rows.length === 0 ? <tr><td colSpan="4" className="text-center text-muted py-4">No leave requests yet.</td></tr> : rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.reason}</td><td>{row.start_date}</td><td>{row.end_date}</td><td><span className={statusBadge(row.status)}>{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin ? (
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-transparent d-flex justify-content-between align-items-center">
            <h6 className="mb-0"><i className="bi bi-shield-check me-2"></i>Employee Leave Review</h6>
            <span className="badge text-bg-secondary">{allRows.length} requests</span>
          </div>
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Employee</th><th>Reason</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {allRows.length === 0 ? <tr><td colSpan="6" className="text-center text-muted py-4">No employee requests.</td></tr> : allRows.map((row) => (
                  <tr key={row.leave_id}>
                    <td>{row.employee}</td><td>{row.reason}</td><td>{row.start_date}</td><td>{row.end_date}</td>
                    <td><span className={statusBadge(row.status)}>{row.status}</span></td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-success" onClick={() => updateLeaveStatus(row.leave_id, "approved")}>Approve</button>
                        <button className="btn btn-outline-danger" onClick={() => updateLeaveStatus(row.leave_id, "rejected")}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
