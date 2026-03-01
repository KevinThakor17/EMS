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
      <h2 className="h4 mb-1">Projects and Members</h2>
      <p className="text-muted">Track active projects, teams, and allocations.</p>

      {canManageProjects ? (
        <div className="card mb-3">
          <div className="card-body">
            <div className="row g-2 align-items-end">
              <div className="col-12 col-md-2"><label className="form-label">Code</label><input className="form-control" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div className="col-12 col-md-3"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="col-12 col-md-3"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="col-6 col-md-2"><label className="form-label">Start</label><input type="date" className="form-control" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="col-6 col-md-2"><label className="form-label">End</label><input type="date" className="form-control" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              <div className="col-12"><button className="btn btn-primary" onClick={createProject}>Create Project</button></div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="row g-3">
        {projects.map((project) => (
          <div key={project.id} className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <h5 className="mb-0">{project.name}</h5>
                  <span className="badge text-bg-secondary">{project.code}</span>
                </div>
                <p className="text-muted mt-2 mb-1">{project.description}</p>
                <small className="text-secondary">Status: {project.status}</small>

                <div className="mt-3">
                  <h6>Project Members</h6>
                  <div className="row g-2">
                    {project.members.map((member) => (
                      <div key={`${project.id}-${member.employee_id}`} className="col-12 col-md-6 col-xl-4">
                        <div className="border rounded p-2 bg-light">{member.employee_name} ({member.allocation_percent}%)</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
