import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Team() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/ems/team").then((res) => setRows(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold">Team View</h2>
      {rows.length === 0 ? <p className="mt-4 text-sm text-slate-600">No team members assigned or manager access required.</p> : null}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((member) => (
          <div key={member.id} className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold">{member.name}</h3>
            <p className="text-sm text-slate-600">{member.title}</p>
            <p className="text-sm text-slate-500">{member.department}</p>
            <p className="text-xs text-slate-500">Manager: {member.manager || "Unassigned"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
