import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Team() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/ems/team").then((res) => setRows(res.data));
  }, []);

  return (
    <div>
      <h2 className="h4 mb-1">Team Directory</h2>
      <p className="text-muted">View colleagues by reporting structure and department.</p>

      {rows.length === 0 ? <div className="alert alert-secondary">No team members assigned or manager access required.</div> : null}
      <div className="row g-3">
        {rows.map((member) => (
          <div key={member.id} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-1">{member.name}</h5>
                <p className="mb-1 fw-semibold">{member.title}</p>
                <p className="text-muted mb-2">{member.department}</p>
                <small className="text-secondary">Manager: {member.manager || "Unassigned"}</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
