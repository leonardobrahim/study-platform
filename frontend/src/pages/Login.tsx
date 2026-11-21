import { useState } from "react";
import type { FormEvent } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || "portfolio@teste.com";
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || "portfolio123";

export function Login() {
  const { isAuthenticated, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch {
      setError("E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError("");
    setLoadingDemo(true);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);

    try {
      await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      navigate("/dashboard");
    } catch {
      setError("Não foi possível acessar a conta demo agora. Tente novamente.");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="bg-indigo-100 p-3 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Plataforma de Estudos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Acesse sua conta para continuar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || loadingDemo}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">ou teste agora</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading || loadingDemo}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold py-2.5 px-4 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles size={18} />
          {loadingDemo ? "Acessando conta demo..." : "Entrar com conta demo"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem uma conta?{" "}
          <Link
            to="/signup"
            className="text-indigo-600 font-medium hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
