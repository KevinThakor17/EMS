import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Attendance() {
  const [rows, setRows] = useState([]);

  const refresh = () => api.get("/ems/attendance").then((res) => setRows(res.data));

  useEffect(() => {
    refresh();
  }, []);

  const markCheckIn = async () => {
    await api.post("/ems/attendance/check-in", { status: "present" });
    refresh();
  };

  const markCheckOut = async () => {
    await api.post("/ems/attendance/check-out");
    refresh();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold">Attendance</h2>
      <div className="mt-4 flex gap-2">
        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white" onClick={markCheckIn}>Check In</button>
        <button className="rounded-lg bg-amber-600 px-4 py-2 text-white" onClick={markCheckOut}>Check Out</button>
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Check In</th>
              <th className="px-3 py-2 text-left">Check Out</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{row.work_date}</td>
                <td className="px-3 py-2 capitalize">{row.status}</td>
                <td className="px-3 py-2">{row.check_in || "-"}</td>
                <td className="px-3 py-2">{row.check_out || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
