export const saveSession = (payload) => {
  localStorage.setItem("ems_token", payload.access_token);
  localStorage.setItem("ems_employee", JSON.stringify(payload.employee));
};

export const clearSession = () => {
  localStorage.removeItem("ems_token");
  localStorage.removeItem("ems_employee");
};

export const readEmployee = () => {
  try {
    const raw = localStorage.getItem("ems_employee");
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = () => Boolean(localStorage.getItem("ems_token"));
