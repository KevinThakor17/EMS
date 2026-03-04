import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/ems/profile").then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <p className="text-muted mb-0">Loading profile...</p>;

  const info = [
    { label: "Email", value: profile.email, icon: "bi-envelope" },
    { label: "Title", value: profile.title, icon: "bi-briefcase" },
    { label: "Department", value: profile.department, icon: "bi-diagram-3" },
    { label: "Role", value: profile.role, icon: "bi-person-gear" },
    { label: "Manager", value: profile.manager || "NA", icon: "bi-person-check" },
    { label: "Joined On", value: profile.joined_on, icon: "bi-calendar-date" },
  ];

  return (
    <div>
      <div className="card shadow-sm border-0 mb-3">
        <div className="card-body d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, fontSize: 24 }}>
              <i className="bi bi-person"></i>
            </div>
            <div>
              <h2 className="h4 mb-1">{profile.full_name}</h2>
              <p className="text-muted mb-0">Employee identity and organization details</p>
            </div>
          </div>
          <button className="btn btn-light border"><i className="bi bi-download me-2"></i>Export Profile</button>
        </div>
      </div>

      <div className="row g-3">
        {info.map((item) => (
          <div key={item.label} className="col-12 col-md-6 col-xl-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body d-flex align-items-start gap-3">
                <div className="workspace-logo" style={{ width: 38, height: 38 }}><i className={`bi ${item.icon}`}></i></div>
                <div>
                  <small className="text-muted d-block">{item.label}</small>
                  <div className="fw-semibold text-capitalize">{item.value}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
