import React, { useEffect, useState } from "react";
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
      <h2 className="h4 mb-1">Leave Management</h2>
      <p className="text-muted">Apply leave, track status, and review approvals.</p>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4"><label className="form-label">Reason</label><input className="form-control" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
            <div className="col-6 col-md-3"><label className="form-label">Start Date</label><input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div className="col-6 col-md-3"><label className="form-label">End Date</label><input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
            <div className="col-12 col-md-2"><button className="btn btn-primary w-100" onClick={apply}>Apply</button></div>
          </div>
        </div>
      </div>

      <div className="table-responsive border rounded mb-4">
        <table className="table table-striped mb-0">
          <thead className="table-light">
            <tr><th>Reason</th><th>Start</th><th>End</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.reason}</td><td>{row.start_date}</td><td>{row.end_date}</td><td><span className={statusBadge(row.status)}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin ? (
        <>
          <h3 className="h5">All Employee Leave Requests</h3>
          <div className="table-responsive border rounded">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr><th>Employee</th><th>Reason</th><th>Start</th><th>End</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {allRows.map((row) => (
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
        </>
      ) : null}
    </div>
  );
}
