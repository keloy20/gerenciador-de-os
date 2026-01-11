"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Service } from "../lib/types";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [servicos, setServicos] = useState<Service[]>([]);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/login");
      return;
    }

    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const data = await apiFetch("/projects/admin/all");
      setServicos(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.clear();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Painel Admin</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Sair
        </button>
      </div>

      {loading && <p>Carregando serviços...</p>}
      {erro && <p className="text-red-600">{erro}</p>}

      <div className="grid gap-3">
        {servicos.map((s) => (
          <div
            key={s._id}
            className="bg-white p-3 rounded shadow flex flex-col gap-1"
          >
            <strong>{s.osNumero}</strong>
            <span>Cliente: {s.cliente}</span>
            <span>Status: {s.status}</span>
            <span>Técnico: {s.tecnico?.nome || "—"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
