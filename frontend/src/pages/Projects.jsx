import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { readEmployee } from "../lib/auth";

export default function Projects() {
  const current = readEmployee();
  const canManageProjects = current?.role === "admin" || current?.role === "manager";
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", description: "", start_date: "", end_date: "" });

  const refresh = () => api.get("/ems/projects").then((res) => setProjects(res.data));

  useEffect(() => {
    refresh();
  }, []);

  const createProject = async () => {
    await api.post("/ems/projects", form);
    setForm({ code: "", name: "", description: "", start_date: "", end_date: "" });
    refresh();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold">Projects and Members</h2>
      {canManageProjects ? (
        <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-5">
          <input className="rounded border px-3 py-2" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="rounded border px-3 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="rounded border px-3 py-2 sm:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="rounded border px-3 py-2" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          <input className="rounded border px-3 py-2" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          <button className="rounded bg-cyan-600 px-3 py-2 text-white sm:col-span-5" onClick={createProject}>Create Project</button>
        </div>
      ) : null}
      <div className="mt-4 space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <span className="rounded bg-slate-100 px-2 py-1 text-xs">{project.code}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{project.description}</p>
            <p className="mt-1 text-xs text-slate-500">Status: {project.status}</p>

            <div className="mt-3">
              <p className="text-sm font-medium">Project Members</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {project.members.map((member) => (
                  <li key={`${project.id}-${member.employee_id}`} className="rounded bg-slate-50 px-2 py-1">
                    {member.employee_name} ({member.allocation_percent}%)
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
