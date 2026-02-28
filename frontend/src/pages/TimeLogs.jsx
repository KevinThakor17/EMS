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
      <h2 className="text-2xl font-semibold">Daily Time Logs</h2>

      <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-5">
        <select className="rounded border px-3 py-2" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <input className="rounded border px-3 py-2" type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
        <input className="rounded border px-3 py-2" type="number" step="0.5" min="0" max="24" value={hours} onChange={(e) => setHours(e.target.value)} />
        <input className="rounded border px-3 py-2 sm:col-span-2" placeholder="Work description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button className="rounded bg-cyan-600 px-3 py-2 text-white sm:col-span-5" onClick={addLog}>Log Work</button>
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Project</th>
              <th className="px-3 py-2 text-left">Hours</th>
              <th className="px-3 py-2 text-left">Description</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{row.work_date}</td>
                <td className="px-3 py-2">{row.project}</td>
                <td className="px-3 py-2">{row.hours}</td>
                <td className="px-3 py-2">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
