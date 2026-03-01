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
      <h2 className="h4 mb-1">Attendance</h2>
      <p className="text-muted">Track check-in and check-out with daily logs.</p>

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-success" onClick={markCheckIn}>Check In</button>
        <button className="btn btn-warning" onClick={markCheckOut}>Check Out</button>
      </div>

      <div className="table-responsive border rounded">
        <table className="table table-striped table-hover mb-0">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.work_date}</td>
                <td className="text-capitalize">{row.status}</td>
                <td>{row.check_in || "-"}</td>
                <td>{row.check_out || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
