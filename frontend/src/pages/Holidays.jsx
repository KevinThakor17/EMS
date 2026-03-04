import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function Holidays() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/ems/holidays").then((res) => setRows(res.data));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((h) => h.name.toLowerCase().includes(q) || String(h.holiday_date).toLowerCase().includes(q));
  }, [rows, query]);

  const upcoming = filtered[0];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="h4 mb-1"><i className="bi bi-calendar2-heart me-2"></i>Holiday Calendar</h2>
          <p className="text-muted mb-0">Track company holidays and upcoming break periods.</p>
        </div>
        <div className="input-group" style={{ maxWidth: 260 }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input className="form-control" placeholder="Search holiday" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {upcoming ? (
        <div className="card border-0 shadow-sm mb-3 soft-card">
          <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <small className="text-muted">Next Holiday</small>
              <h5 className="mb-1">{upcoming.name}</h5>
              <p className="text-muted mb-0">{upcoming.holiday_date}</p>
            </div>
            <span className="badge text-bg-primary">Upcoming</span>
          </div>
        </div>
      ) : null}

      <div className="row g-3">
        {filtered.length === 0 ? (
          <div className="col-12"><div className="alert alert-secondary mb-0">No holidays found.</div></div>
        ) : filtered.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start gap-2">
                  <h5 className="card-title mb-1">{item.name}</h5>
                  <i className="bi bi-stars text-primary"></i>
                </div>
                <p className="text-primary fw-semibold mb-2">{item.holiday_date}</p>
                <p className="text-muted mb-0">{item.description || "No additional details."}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
