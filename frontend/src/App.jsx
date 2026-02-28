import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Attendance from "./pages/Attendance";
import Admin from "./pages/Admin";
import Holidays from "./pages/Holidays";
import Leaves from "./pages/Leaves";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Profile from "./pages/Profile";
import Projects from "./pages/Projects";
import Team from "./pages/Team";
import TimeLogs from "./pages/TimeLogs";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Overview />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/holidays" element={<Holidays />} />
          <Route path="/team" element={<Team />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/time-logs" element={<TimeLogs />} />
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
