import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useToast } from "../components/ToastProvider";

export default function TimeLogs() {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [logs, setLogs] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [hours, setHours] = useState("8");
  const [description, setDescription] = useState("");

  const refreshLogs = () => api.get("/ems/time-logs").then((res) => setLogs(res.data));

  useEffect(() => {
    api.get("/ems/projects").then((res) => setProjects(res.data));
    refreshLogs();
  }, []);

  const weeklyHours = useMemo(() => logs.slice(0, 7).reduce((sum, item) => sum + Number(item.hours || 0), 0), [logs]);

  const addLog = async () => {
    try {
      await api.post("/ems/time-logs", {
        project_id: Number(projectId),
        work_date: workDate,
        hours: Number(hours),
        description,
      });
      setDescription("");
      await refreshLogs();
      toast.success("Work log added.", { title: "Time Log" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to add work log.", { title: "Time Log" });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1"><i className="bi bi-clock-history me-2"></i>Time Journal</h2>
          <p className="text-muted mb-0">Log focused work and monitor your week at a glance.</p>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-md-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Entries</small><div className="h5 mb-0">{logs.length}</div></div></div></div>
        <div className="col-6 col-md-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Weekly Hours</small><div className="h5 mb-0">{weeklyHours}</div></div></div></div>
        <div className="col-12 col-md-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Projects Available</small><div className="h5 mb-0">{projects.length}</div></div></div></div>
      </div>

      <div className="card mb-3 border-0 shadow-sm">
        <div className="card-header bg-transparent"><h6 className="mb-0"><i className="bi bi-pencil-square me-2"></i>Add Work Log</h6></div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-3"><label className="form-label">Project</label><select className="form-select" value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="">Select project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div className="col-6 col-md-2"><label className="form-label">Date</label><input type="date" className="form-control" value={workDate} onChange={(e) => setWorkDate(e.target.value)} /></div>
            <div className="col-6 col-md-2"><label className="form-label">Hours</label><input type="number" step="0.5" min="0" max="24" className="form-control" value={hours} onChange={(e) => setHours(e.target.value)} /></div>
            <div className="col-12 col-md-5"><label className="form-label">Description</label><input className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
            <div className="col-12"><button className="btn btn-primary" onClick={addLog}>Log Work</button></div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-transparent"><h6 className="mb-0"><i className="bi bi-list-columns me-2"></i>Recent Work Logs</h6></div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Date</th><th>Project</th><th>Hours</th><th>Description</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 ? <tr><td colSpan="4" className="text-center text-muted py-4">No logs available.</td></tr> : logs.map((row) => (
                <tr key={row.id}>
                  <td>{row.work_date}</td><td>{row.project}</td><td>{row.hours}</td><td>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
