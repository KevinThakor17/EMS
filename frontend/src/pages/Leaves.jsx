import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { readEmployee } from "../lib/auth";

export default function Leaves() {
  const current = readEmployee();
  const isAdmin = current?.role === "admin";
  const [rows, setRows] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const refresh = async () => {
    const [mine, all] = await Promise.all([
      api.get("/ems/leaves"),
      isAdmin ? api.get("/ems/leaves/all") : Promise.resolve({ data: [] }),
    ]);
    setRows(mine.data);
    setAllRows(all.data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const apply = async () => {
    await api.post("/ems/leaves", { reason, start_date: startDate, end_date: endDate });
    setReason("");
    setStartDate("");
    setEndDate("");
    refresh();
  };

  const updateLeaveStatus = async (leaveId, status) => {
    await api.put(`/ems/leaves/${leaveId}`, { status });
    refresh();
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold">Leave Management</h2>

      <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 p-4 sm:grid-cols-4">
        <input className="rounded border px-3 py-2" placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
        <input className="rounded border px-3 py-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="rounded border px-3 py-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="rounded bg-cyan-600 px-3 py-2 text-white" onClick={apply}>Apply Leave</button>
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left">Reason</th>
              <th className="px-3 py-2 text-left">Start</th>
              <th className="px-3 py-2 text-left">End</th>
              <th className="px-3 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-200">
                <td className="px-3 py-2">{row.reason}</td>
                <td className="px-3 py-2">{row.start_date}</td>
                <td className="px-3 py-2">{row.end_date}</td>
                <td className="px-3 py-2 capitalize">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdmin ? (
        <div className="mt-6">
          <h3 className="text-lg font-semibold">All Employee Leave Requests</h3>
          <div className="mt-3 overflow-auto rounded-xl border border-slate-200">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left">Employee</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-left">Start</th>
                  <th className="px-3 py-2 text-left">End</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {allRows.map((row) => (
                  <tr key={row.leave_id} className="border-t border-slate-200">
                    <td className="px-3 py-2">{row.employee}</td>
                    <td className="px-3 py-2">{row.reason}</td>
                    <td className="px-3 py-2">{row.start_date}</td>
                    <td className="px-3 py-2">{row.end_date}</td>
                    <td className="px-3 py-2 capitalize">{row.status}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <button className="rounded bg-emerald-600 px-2 py-1 text-white" onClick={() => updateLeaveStatus(row.leave_id, "approved")}>Approve</button>
                        <button className="rounded bg-rose-600 px-2 py-1 text-white" onClick={() => updateLeaveStatus(row.leave_id, "rejected")}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
