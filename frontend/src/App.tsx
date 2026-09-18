import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { Dashboard } from "./pages/Dashboard";
import { Layout } from "./components/Layout";
import { Semesters } from "./pages/Semesters";
import { Subjects } from "./pages/Subjects";
import { Tasks } from "./pages/Tasks";
import { Timer } from "./pages/Timer";
import { Sessions } from "./pages/Sessions";
import { Assessments } from "./pages/Assessments";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/semesters" element={<Semesters />} />
          <Route path="/subjects" element={<Subjects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/sessions" element={<Sessions />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
