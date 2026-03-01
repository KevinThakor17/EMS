import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function TimeLogs() {
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

  const addLog = async () => {
    await api.post("/ems/time-logs", {
      project_id: Number(projectId),
      work_date: workDate,
      hours: Number(hours),
      description,
    });
    setDescription("");
    refreshLogs();
  };

  return (
    <div>
      <h2 className="h4 mb-1">Daily Time Logs</h2>
      <p className="text-muted">Capture work done every day with project-level context.</p>

      <div className="card mb-3">
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

      <div className="table-responsive border rounded">
        <table className="table table-striped mb-0">
          <thead className="table-light">
            <tr><th>Date</th><th>Project</th><th>Hours</th><th>Description</th></tr>
          </thead>
          <tbody>
            {logs.map((row) => (
              <tr key={row.id}>
                <td>{row.work_date}</td><td>{row.project}</td><td>{row.hours}</td><td>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
