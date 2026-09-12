"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    if (password !== confirmation) {
      setMessage("As senhas não coincidem.");
      return;
    }

    const response = await fetch("/api/password-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Não foi possível redefinir a senha.");
      return;
    }
    setDone(true);
    setMessage("Senha definida com sucesso. Você já pode entrar na aplicação.");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <section className="w-full rounded-lg border p-6">
        <h1 className="mb-2 text-2xl font-bold">Definir senha</h1>
        <p className="mb-6 text-sm text-muted-foreground">Use este link apenas uma vez.</p>
        {!done && (
          <form onSubmit={submit} className="space-y-4">
            <input className="w-full rounded-md border bg-transparent p-2" type="password" minLength={8} maxLength={128} placeholder="Nova senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <input className="w-full rounded-md border bg-transparent p-2" type="password" minLength={8} maxLength={128} placeholder="Confirme a senha" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required />
            <button className="w-full rounded-md border px-4 py-2 font-medium" type="submit">Salvar senha</button>
          </form>
        )}
        {message && <p className="mt-4 text-sm">{message}</p>}
      </section>
    </main>
  );
}
