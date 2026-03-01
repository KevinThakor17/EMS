import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { readEmployee } from "../lib/auth";
import { useToast } from "../components/ToastProvider";

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
  const toast = useToast();
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
    if (isAdmin) loadData();
  }, [isAdmin]);

  if (!isAdmin) return <div className="alert alert-danger">Admin access required.</div>;

  const updateEmployeeField = (id, field, value) => {
    setEmployees((prev) => prev.map((emp) => (emp.id === id ? { ...emp, [field]: value } : emp)));
  };

  const saveEmployee = async (employee) => {
    try {
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
      toast.success("Employee updated.", { title: "Admin" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to update employee.", { title: "Admin" });
    }
  };

  const createEmployee = async () => {
    try {
      const payload = { ...newEmployee, manager_id: newEmployee.manager_id === "" ? null : Number(newEmployee.manager_id) };
      await api.post("/ems/admin/employees", payload);
      setNewEmployee(EMPTY_EMPLOYEE);
      await loadData();
      toast.success("Employee created.", { title: "Admin" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create employee.", { title: "Admin" });
    }
  };

  const assignProjectMember = async () => {
    try {
      await api.post(`/ems/projects/${Number(assignment.project_id)}/members`, {
        employee_id: Number(assignment.employee_id),
        allocation_percent: Number(assignment.allocation_percent),
      });
      setAssignment({ project_id: "", employee_id: "", allocation_percent: 100 });
      await loadData();
      toast.success("Employee assigned to project.", { title: "Admin" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to assign employee to project.", { title: "Admin" });
    }
  };

  const createLeaveForEmployee = async () => {
    try {
      await api.post("/ems/admin/leaves", {
        employee_id: Number(adminLeave.employee_id),
        reason: adminLeave.reason,
        start_date: adminLeave.start_date,
        end_date: adminLeave.end_date,
        status: adminLeave.status,
      });
      setAdminLeave({ employee_id: "", reason: "", start_date: "", end_date: "", status: "approved" });
      toast.success("Leave created for employee.", { title: "Admin" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create leave for employee.", { title: "Admin" });
    }
  };

  return (
    <div>
      <h2 className="h4 mb-1">Admin Console</h2>
      <p className="text-muted">Manage employees, assignments, and leave operations.</p>
      {loading ? <div className="alert alert-info py-2">Loading...</div> : null}
      {error ? <div className="alert alert-danger py-2">{error}</div> : null}

      <div className="card mb-3">
        <div className="card-header">Add Employee</div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-3"><label className="form-label">Name</label><input className="form-control" value={newEmployee.full_name} onChange={(e) => setNewEmployee({ ...newEmployee, full_name: e.target.value })} /></div>
            <div className="col-12 col-md-3"><label className="form-label">Email</label><input className="form-control" value={newEmployee.email} onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })} /></div>
            <div className="col-12 col-md-2"><label className="form-label">Password</label><input type="password" className="form-control" value={newEmployee.password} onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })} /></div>
            <div className="col-6 col-md-2"><label className="form-label">Title</label><input className="form-control" value={newEmployee.title} onChange={(e) => setNewEmployee({ ...newEmployee, title: e.target.value })} /></div>
            <div className="col-6 col-md-2"><label className="form-label">Department</label><input className="form-control" value={newEmployee.department} onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })} /></div>
            <div className="col-6 col-md-2"><label className="form-label">Role</label><select className="form-select" value={newEmployee.role} onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}><option value="employee">employee</option><option value="manager">manager</option><option value="admin">admin</option></select></div>
            <div className="col-6 col-md-3"><label className="form-label">Manager</label><select className="form-select" value={newEmployee.manager_id} onChange={(e) => setNewEmployee({ ...newEmployee, manager_id: e.target.value })}><option value="">No manager</option>{managerOptions.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}</select></div>
            <div className="col-12 col-md-2"><button className="btn btn-primary w-100" onClick={createEmployee}>Create</button></div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">Employees</div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Title</th><th>Department</th><th>Role</th><th>Manager</th><th>Active</th><th>Action</th></tr></thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td><input className="form-control form-control-sm" value={emp.full_name} onChange={(e) => updateEmployeeField(emp.id, "full_name", e.target.value)} /></td>
                  <td>{emp.email}</td>
                  <td><input className="form-control form-control-sm" value={emp.title} onChange={(e) => updateEmployeeField(emp.id, "title", e.target.value)} /></td>
                  <td><input className="form-control form-control-sm" value={emp.department} onChange={(e) => updateEmployeeField(emp.id, "department", e.target.value)} /></td>
                  <td><select className="form-select form-select-sm" value={emp.role} onChange={(e) => updateEmployeeField(emp.id, "role", e.target.value)}><option value="employee">employee</option><option value="manager">manager</option><option value="admin">admin</option></select></td>
                  <td><select className="form-select form-select-sm" value={emp.manager_id ?? ""} onChange={(e) => updateEmployeeField(emp.id, "manager_id", e.target.value === "" ? "" : Number(e.target.value))}><option value="">None</option>{managerOptions.filter((m) => m.id !== emp.id).map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}</select></td>
                  <td><input className="form-check-input" type="checkbox" checked={Boolean(emp.is_active)} onChange={(e) => updateEmployeeField(emp.id, "is_active", e.target.checked)} /></td>
                  <td><button className="btn btn-sm btn-outline-success" onClick={() => saveEmployee(emp)}>Save</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header">Assign Employee To Project</div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4"><label className="form-label">Project</label><select className="form-select" value={assignment.project_id} onChange={(e) => setAssignment({ ...assignment, project_id: e.target.value })}><option value="">Select project</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
            <div className="col-12 col-md-4"><label className="form-label">Employee</label><select className="form-select" value={assignment.employee_id} onChange={(e) => setAssignment({ ...assignment, employee_id: e.target.value })}><option value="">Select employee</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
            <div className="col-6 col-md-2"><label className="form-label">Allocation %</label><input type="number" min="1" max="100" className="form-control" value={assignment.allocation_percent} onChange={(e) => setAssignment({ ...assignment, allocation_percent: e.target.value })} /></div>
            <div className="col-6 col-md-2"><button className="btn btn-primary w-100" onClick={assignProjectMember}>Assign</button></div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Create Leave For Employee</div>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-3"><label className="form-label">Employee</label><select className="form-select" value={adminLeave.employee_id} onChange={(e) => setAdminLeave({ ...adminLeave, employee_id: e.target.value })}><option value="">Select employee</option>{employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
            <div className="col-12 col-md-3"><label className="form-label">Reason</label><input className="form-control" value={adminLeave.reason} onChange={(e) => setAdminLeave({ ...adminLeave, reason: e.target.value })} /></div>
            <div className="col-6 col-md-2"><label className="form-label">Start</label><input type="date" className="form-control" value={adminLeave.start_date} onChange={(e) => setAdminLeave({ ...adminLeave, start_date: e.target.value })} /></div>
            <div className="col-6 col-md-2"><label className="form-label">End</label><input type="date" className="form-control" value={adminLeave.end_date} onChange={(e) => setAdminLeave({ ...adminLeave, end_date: e.target.value })} /></div>
            <div className="col-6 col-md-1"><label className="form-label">Status</label><select className="form-select" value={adminLeave.status} onChange={(e) => setAdminLeave({ ...adminLeave, status: e.target.value })}><option value="approved">approved</option><option value="pending">pending</option><option value="rejected">rejected</option></select></div>
            <div className="col-6 col-md-1"><button className="btn btn-primary w-100" onClick={createLeaveForEmployee}>Create</button></div>
          </div>
        </div>
      </div>
    </div>
  );
}
