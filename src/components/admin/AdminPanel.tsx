"use client";

import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  active: boolean;
};

type Certificate = {
  id: string;
  userId: string;
  userName: string | null;
  name: string;
  provider: string | null;
  credentialUrl: string | null;
  issuedAt: string;
};

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [pending, setPending] = useState<Certificate[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [resetLink, setResetLink] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [usersResponse, certificatesResponse] = await Promise.all([
      fetch("/api/admin/users", { cache: "no-store" }),
      fetch("/api/admin/certificates", { cache: "no-store" }),
    ]);
    if (usersResponse.ok) setUsers(await usersResponse.json());
    if (certificatesResponse.ok) setPending(await certificatesResponse.json());
  }

  useEffect(() => {
    void load();
  }, []);

  async function createUser(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, role }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Não foi possível criar o usuário.");
      return;
    }
    setResetLink(`${window.location.origin}/redefinir-senha?token=${encodeURIComponent(data.resetToken)}`);
    setName("");
    setEmail("");
    setRole("user");
    setMessage("Usuário criado. Envie o link de definição de senha com segurança.");
    await load();
  }

  async function updateUser(id: string, payload: Record<string, unknown>) {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) setMessage(data.error ?? "Não foi possível atualizar o usuário.");
    await load();
  }

  async function verifyCertificate(id: string, action: "verify" | "reject") {
    const response = await fetch(`/api/admin/certificates/${id}/${action}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: action === "verify" ? JSON.stringify({}) : undefined,
    });
    const data = await response.json();
    if (!response.ok) setMessage(data.error ?? "Não foi possível processar o certificado.");
    await load();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header>
        <h1 className="text-3xl font-bold">Administração</h1>
        <p className="text-muted-foreground">Usuários, acesso e validação de certificados.</p>
      </header>

      {message && <p className="rounded-md border p-3 text-sm">{message}</p>}
      {resetLink && (
        <div className="rounded-md border p-4">
          <p className="mb-2 font-medium">Link de definição de senha</p>
          <code className="break-all text-xs">{resetLink}</code>
        </div>
      )}

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-xl font-semibold">Novo usuário</h2>
        <form onSubmit={createUser} className="grid gap-3 md:grid-cols-4">
          <input className="rounded-md border bg-transparent p-2" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="rounded-md border bg-transparent p-2" placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <select className="rounded-md border bg-transparent p-2" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
          <button className="rounded-md border px-4 py-2 font-medium" type="submit">Criar</button>
        </form>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-xl font-semibold">Usuários</h2>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col gap-3 rounded-md border p-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium">{user.name || "Sem nome"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm" onClick={() => updateUser(user.id, { active: !user.active })}>
                  {user.active ? "Desativar" : "Ativar"}
                </button>
                <button className="rounded-md border px-3 py-1 text-sm" onClick={() => updateUser(user.id, { role: user.role === "admin" ? "user" : "admin" })}>
                  {user.role === "admin" ? "Tornar usuário" : "Tornar admin"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border p-5">
        <h2 className="mb-4 text-xl font-semibold">Certificados pendentes</h2>
        <div className="space-y-3">
          {pending.length === 0 && <p className="text-sm text-muted-foreground">Nenhum certificado pendente.</p>}
          {pending.map((certificate) => (
            <div key={certificate.id} className="rounded-md border p-3">
              <p className="font-medium">{certificate.name}</p>
              <p className="text-sm text-muted-foreground">{certificate.userName || certificate.userId} · {certificate.provider || "Provedor não informado"}</p>
              {certificate.credentialUrl && <a className="text-sm underline" href={certificate.credentialUrl} target="_blank" rel="noreferrer">Ver credencial</a>}
              <div className="mt-3 flex gap-2">
                <button className="rounded-md border px-3 py-1 text-sm" onClick={() => verifyCertificate(certificate.id, "verify")}>Validar</button>
                <button className="rounded-md border px-3 py-1 text-sm" onClick={() => verifyCertificate(certificate.id, "reject")}>Rejeitar</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
