import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Calendar,
  BookOpen,
  CheckSquare,
  Timer,
  History,
  LogOut,
  Award,
} from "lucide-react";
import { useEffect } from "react";

export function Layout() {
  const navigate = useNavigate();

  // Proteção extra: se não tiver token, joga pro login
  useEffect(() => {
    const token = localStorage.getItem("@StudyPlatform:token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("@StudyPlatform:token");
    navigate("/login");
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/calendar", icon: CalendarDays, label: "Calendário" },
    { to: "/semesters", icon: Calendar, label: "Semestres" },
    { to: "/subjects", icon: BookOpen, label: "Disciplinas" },
    { to: "/assessments", icon: Award, label: "Avaliações" },
    { to: "/tasks", icon: CheckSquare, label: "Tarefas" },
    { to: "/timer", icon: Timer, label: "Timer" },
    { to: "/sessions", icon: History, label: "Histórico" },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar (Menu Lateral) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 mb-4 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">StudyApp</h2>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Botão de Sair no rodapé do menu */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full font-medium"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Área Principal onde as telas (Dashboard, Tarefas, etc) vão aparecer */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
