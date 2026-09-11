import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "./pages/Login";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota da tela de Login */}
        <Route path="/login" element={<Login />} />

        {/* Se acessar qualquer outra rota (por enquanto), joga pro login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
