import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/ems/profile").then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <p className="text-muted mb-0">Loading profile...</p>;

  return (
    <div>
      <h2 className="h4 mb-1">Employee Profile</h2>
      <p className="text-muted">Your official company profile and reporting structure.</p>

      <div className="row g-3">
        <div className="col-md-6"><div className="card"><div className="card-body"><small className="text-muted d-block">Name</small><div className="fw-semibold">{profile.full_name}</div></div></div></div>
        <div className="col-md-6"><div className="card"><div className="card-body"><small className="text-muted d-block">Email</small><div className="fw-semibold">{profile.email}</div></div></div></div>
        <div className="col-md-6"><div className="card"><div className="card-body"><small className="text-muted d-block">Title</small><div className="fw-semibold">{profile.title}</div></div></div></div>
        <div className="col-md-6"><div className="card"><div className="card-body"><small className="text-muted d-block">Department</small><div className="fw-semibold">{profile.department}</div></div></div></div>
        <div className="col-md-6"><div className="card"><div className="card-body"><small className="text-muted d-block">Role</small><div className="fw-semibold text-capitalize">{profile.role}</div></div></div></div>
        <div className="col-md-6"><div className="card"><div className="card-body"><small className="text-muted d-block">Manager</small><div className="fw-semibold">{profile.manager || "NA"}</div></div></div></div>
        <div className="col-md-6"><div className="card"><div className="card-body"><small className="text-muted d-block">Joined On</small><div className="fw-semibold">{profile.joined_on}</div></div></div></div>
      </div>
    </div>
  );
}
