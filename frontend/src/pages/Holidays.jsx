import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Holidays() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/ems/holidays").then((res) => setRows(res.data));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold">Company Holidays</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-slate-600">{item.holiday_date}</p>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
