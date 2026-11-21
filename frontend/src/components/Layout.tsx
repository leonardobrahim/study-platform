import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  RotateCw,
  Menu,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    signOut();
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
    { to: "/reviews", icon: RotateCw, label: "Revisões" },
    { to: "/sessions", icon: History, label: "Histórico" },
  ];

  return (
    <div className="flex flex-col md:flex-row fixed inset-0 bg-gray-50 overflow-hidden">
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <BookOpen className="text-white w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">StudyApp</h2>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Abrir menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <aside
        className={`${
          isMobileMenuOpen ? "fixed inset-0 z-50 flex" : "hidden"
        } md:static md:z-auto md:flex flex-col w-full md:w-64 h-full bg-white border-r border-gray-200 transition-all`}
      >
        <div className="p-4 md:p-6 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">StudyApp</h2>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
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

        <div className="p-4 border-t border-gray-200 space-y-3">
          {user && (
            <div className="px-3 py-2 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors w-full font-medium cursor-pointer"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
