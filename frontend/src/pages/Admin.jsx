import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { readEmployee } from "../lib/auth";

const EMPTY_EMPLOYEE = {
  email: "",
  password: "",
  full_name: "",
  title: "Employee",
  department: "General",
  role: "employee",
  manager_id: "",
  is_active: true,
};

export default function Admin() {
  const current = readEmployee();
  const isAdmin = current?.role === "admin";
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [newEmployee, setNewEmployee] = useState(EMPTY_EMPLOYEE);
  const [assignment, setAssignment] = useState({ project_id: "", employee_id: "", allocation_percent: 100 });
  const [adminLeave, setAdminLeave] = useState({ employee_id: "", reason: "", start_date: "", end_date: "", status: "approved" });

  const managerOptions = useMemo(() => employees.filter((e) => e.is_active), [employees]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [employeesRes, projectsRes] = await Promise.all([
        api.get("/ems/admin/employees"),
        api.get("/ems/projects"),
      ]);
      setEmployees(employeesRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <p className="text-sm text-rose-600">Admin access required.</p>;
  }

  const updateEmployeeField = (id, field, value) => {
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp)));
  };

  const saveEmployee = async (employee) => {
    const payload = {
      full_name: employee.full_name,
      title: employee.title,
      department: employee.department,
      role: employee.role,
      manager_id: employee.manager_id === "" ? null : Number(employee.manager_id),
      is_active: employee.is_active,
    };
    await api.put(`/ems/admin/employees/${employee.id}`, payload);
    await loadData();
  };

  const createEmployee = async () => {
    const payload = {
      ...newEmployee,
      manager_id: newEmployee.manager_id === "" ? null : Number(newEmployee.manager_id),
    };
    await api.post("/ems/admin/employees", payload);
    setNewEmployee(EMPTY_EMPLOYEE);
    await loadData();
  };

  const assignProjectMember = async () => {
    await api.post(`/ems/projects/${Number(assignment.project_id)}/members`, {
      employee_id: Number(assignment.employee_id),
      allocation_percent: Number(assignment.allocation_percent),
    });
    setAssignment({ project_id: "", employee_id: "", allocation_percent: 100 });
    await loadData();
  };

  const createLeaveForEmployee = async () => {
    await api.post("/ems/admin/leaves", {
      employee_id: Number(adminLeave.employee_id),
      reason: adminLeave.reason,
      start_date: adminLeave.start_date,
      end_date: adminLeave.end_date,
      status: adminLeave.status,
    });
    setAdminLeave({ employee_id: "", reason: "", start_date: "", end_date: "", status: "approved" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Admin Management</h2>
        <p className="text-sm text-slate-600">Manage employees, team hierarchy, projects, and employee leave requests.</p>
        {loading ? <p className="mt-2 text-sm text-slate-500">Loading...</p> : null}
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
      </div>

      <section className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold">Add Employee</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <input className="rounded border px-3 py-2" placeholder="Name" value={newEmployee.full_name} onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })} />
          <input className="rounded border px-3 py-2" placeholder="Email" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} />
          <input className="rounded border px-3 py-2" type="password" placeholder="Password" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} />
          <input className="rounded border px-3 py-2" placeholder="Title" value={newEmployee.title} onChange={(e) => setNewEmployee({ ...newEmployee, title: e.target.value })} />
          <input className="rounded border px-3 py-2" placeholder="Department" value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} />
          <select className="rounded border px-3 py-2" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}>
            <option value="employee">employee</option>
            <option value="manager">manager</option>
            <option value="admin">admin</option>
          </select>
          <select className="rounded border px-3 py-2" value={newEmployee.manager_id} onChange={(e) => setNewEmployee({ ...newEmployee, manager_id: e.target.value })}>
            <option value="">No manager</option>
            {managerOptions.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
          </select>
          <button className="rounded bg-cyan-600 px-3 py-2 text-white" onClick={createEmployee}>Create Employee</button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold">Employees</h3>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-left">Email</th>
                <th className="px-2 py-2 text-left">Title</th>
                <th className="px-2 py-2 text-left">Department</th>
                <th className="px-2 py-2 text-left">Role</th>
                <th className="px-2 py-2 text-left">Manager</th>
                <th className="px-2 py-2 text-left">Active</th>
                <th className="px-2 py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-t border-slate-200">
                  <td className="px-2 py-2"><input className="w-40 rounded border px-2 py-1" value={emp.full_name} onChange={(e) => updateEmployeeField(emp.id, "full_name", e.target.value)} /></td>
                  <td className="px-2 py-2">{emp.email}</td>
                  <td className="px-2 py-2"><input className="w-32 rounded border px-2 py-1" value={emp.title} onChange={(e) => updateEmployeeField(emp.id, "title", e.target.value)} /></td>
                  <td className="px-2 py-2"><input className="w-32 rounded border px-2 py-1" value={emp.department} onChange={(e) => updateEmployeeField(emp.id, "department", e.target.value)} /></td>
                  <td className="px-2 py-2">
                    <select className="rounded border px-2 py-1" value={emp.role} onChange={(e) => updateEmployeeField(emp.id, "role", e.target.value)}>
                      <option value="employee">employee</option>
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <select className="rounded border px-2 py-1" value={emp.manager_id ?? ""} onChange={(e) => updateEmployeeField(emp.id, "manager_id", e.target.value === "" ? "" : Number(e.target.value))}>
                      <option value="">None</option>
                      {managerOptions.filter((m) => m.id !== emp.id).map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <input type="checkbox" checked={Boolean(emp.is_active)} onChange={(e) => updateEmployeeField(emp.id, "is_active", e.target.checked)} />
                  </td>
                  <td className="px-2 py-2">
                    <button className="rounded bg-emerald-600 px-2 py-1 text-white" onClick={() => saveEmployee(emp)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold">Assign Employee To Project</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          <select className="rounded border px-3 py-2" value={assignment.project_id} onChange={(e) => setAssignment({ ...assignment, project_id: e.target.value })}>
            <option value="">Select project</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="rounded border px-3 py-2" value={assignment.employee_id} onChange={(e) => setAssignment({ ...assignment, employee_id: e.target.value })}>
            <option value="">Select employee</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
          </select>
          <input className="rounded border px-3 py-2" type="number" min="1" max="100" value={assignment.allocation_percent} onChange={(e) => setAssignment({ ...assignment, allocation_percent: e.target.value })} />
          <button className="rounded bg-cyan-600 px-3 py-2 text-white" onClick={assignProjectMember}>Assign Member</button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 p-4">
        <h3 className="font-semibold">Create Leave For Employee</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-5">
          <select className="rounded border px-3 py-2" value={adminLeave.employee_id} onChange={(e) => setAdminLeave({ ...adminLeave, employee_id: e.target.value })}>
            <option value="">Select employee</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
          </select>
          <input className="rounded border px-3 py-2" placeholder="Reason" value={adminLeave.reason} onChange={(e) => setAdminLeave({ ...adminLeave, reason: e.target.value })} />
          <input className="rounded border px-3 py-2" type="date" value={adminLeave.start_date} onChange={(e) => setAdminLeave({ ...adminLeave, start_date: e.target.value })} />
          <input className="rounded border px-3 py-2" type="date" value={adminLeave.end_date} onChange={(e) => setAdminLeave({ ...adminLeave, end_date: e.target.value })} />
          <select className="rounded border px-3 py-2" value={adminLeave.status} onChange={(e) => setAdminLeave({ ...adminLeave, status: e.target.value })}>
            <option value="approved">approved</option>
            <option value="pending">pending</option>
            <option value="rejected">rejected</option>
          </select>
          <button className="rounded bg-cyan-600 px-3 py-2 text-white sm:col-span-5" onClick={createLeaveForEmployee}>Create Leave</button>
        </div>
      </section>
    </div>
  );
}
