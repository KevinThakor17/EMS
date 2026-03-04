import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function Team() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/ems/team").then((res) => setRows(res.data));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((m) => [m.name, m.title, m.department, m.manager || ""].some((s) => String(s).toLowerCase().includes(q)));
  }, [rows, query]);

  const departments = useMemo(() => [...new Set(rows.map((r) => r.department))], [rows]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1"><i className="bi bi-people me-2"></i>Team Directory</h2>
          <p className="text-muted mb-0">Discover team members, roles, and reporting lines.</p>
        </div>
        <div className="input-group" style={{ maxWidth: 260 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input className="form-control" placeholder="Search people" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2">
        {departments.map((dep) => <span key={dep} className="badge text-bg-light border">{dep}</span>)}
      </div>

      {filtered.length === 0 ? <div className="alert alert-secondary">No team members found.</div> : null}
      <div className="row g-3">
        {filtered.map((member) => (
          <div key={member.id} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                    <i className="bi bi-person"></i>
                  </div>
                  <div>
                    <h6 className="mb-0">{member.name}</h6>
                    <small className="text-muted">{member.title}</small>
                  </div>
                </div>
                <div className="small text-muted">Department: <span className="text-body">{member.department}</span></div>
                <div className="small text-muted">Manager: <span className="text-body">{member.manager || "Unassigned"}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
