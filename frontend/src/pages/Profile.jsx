import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get("/ems/profile").then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold">Employee Profile</h2>
      <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
        <p><span className="font-medium">Name:</span> {profile.full_name}</p>
        <p><span className="font-medium">Email:</span> {profile.email}</p>
        <p><span className="font-medium">Title:</span> {profile.title}</p>
        <p><span className="font-medium">Department:</span> {profile.department}</p>
        <p><span className="font-medium">Role:</span> {profile.role}</p>
        <p><span className="font-medium">Manager:</span> {profile.manager || "NA"}</p>
        <p><span className="font-medium">Joined On:</span> {profile.joined_on}</p>
      </div>
    </div>
  );
}
