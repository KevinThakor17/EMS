import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Holidays() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/ems/holidays").then((res) => setRows(res.data));
  }, []);

  return (
    <div>
      <h2 className="h4 mb-1">Company Holidays</h2>
      <p className="text-muted">Official holiday calendar visible across the organization.</p>
      <div className="row g-3">
        {rows.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-1">{item.name}</h5>
                <p className="text-primary fw-semibold mb-2">{item.holiday_date}</p>
                <p className="text-muted mb-0">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
