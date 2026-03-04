import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { readEmployee } from "../lib/auth";
import { useToast } from "../components/ToastProvider";

export default function Projects() {
  const current = readEmployee();
  const canManageProjects = current?.role === "admin" || current?.role === "manager";
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ code: "", name: "", description: "", start_date: "", end_date: "" });

  const refresh = () => api.get("/ems/projects").then((res) => setProjects(res.data));

  useEffect(() => {
    refresh();
  }, []);

  const totalMembers = useMemo(() => projects.reduce((sum, p) => sum + p.members.length, 0), [projects]);

  const createProject = async () => {
    try {
      await api.post("/ems/projects", form);
      setForm({ code: "", name: "", description: "", start_date: "", end_date: "" });
      await refresh();
      toast.success("Project created successfully.", { title: "Project" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create project.", { title: "Project" });
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1"><i className="bi bi-kanban me-2"></i>Project Studio</h2>
          <p className="text-muted mb-0">Design, track, and staff project workstreams.</p>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-6 col-md-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Projects</small><div className="h5 mb-0">{projects.length}</div></div></div></div>
        <div className="col-6 col-md-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Members Assigned</small><div className="h5 mb-0">{totalMembers}</div></div></div></div>
        <div className="col-12 col-md-4"><div className="card metric-card shadow-sm"><div className="card-body"><small className="text-muted">Can Manage</small><div className="h5 mb-0">{canManageProjects ? "Yes" : "No"}</div></div></div></div>
      </div>

      {canManageProjects ? (
        <div className="card mb-3 border-0 shadow-sm">
          <div className="card-header bg-transparent"><h6 className="mb-0"><i className="bi bi-plus-circle me-2"></i>Create Project</h6></div>
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
        {projects.length === 0 ? <div className="col-12"><div className="alert alert-secondary mb-0">No projects created yet.</div></div> : projects.map((project) => (
          <div key={project.id} className="col-12 col-xl-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <h5 className="mb-0">{project.name}</h5>
                  <span className="badge text-bg-secondary">{project.code}</span>
                </div>
                <p className="text-muted mb-2">{project.description || "No description"}</p>
                <div className="small text-muted mb-3">Status: <span className="text-body">{project.status}</span></div>

                <h6 className="mb-2">Team</h6>
                {project.members.length === 0 ? (
                  <p className="text-muted mb-0">No members assigned.</p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {project.members.map((member) => (
                      <span key={`${project.id}-${member.employee_id}`} className="badge text-bg-light border">
                        {member.employee_name} ({member.allocation_percent}%)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
