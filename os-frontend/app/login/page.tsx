"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("https://gerenciador-de-os.onrender.com/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.error || "Erro ao logar");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("nome", data.nome);

      if (data.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/tecnico");
      }

    } catch (err) {
      setErro("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-sm rounded-xl p-6 shadow-lg"
      >
        <h1 className="text-2xl font-bold text-center mb-1">Sistema de OS</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Entre com suas credenciais
        </p>

        {erro && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm text-center">
            {erro}
          </div>
        )}

        <div className="mb-3">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded p-2 mt-1"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium">Senha</label>
          <input
            type="password"
            className="w-full border rounded p-2 mt-1"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:opacity-90 transition"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
