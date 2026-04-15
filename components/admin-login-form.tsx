"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ error: "Falha ao autenticar." }))) as { error?: string };
      setError(data.error ?? "Nao foi possivel autenticar. Confira email e senha.");
      setIsSubmitting(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form className="login-card field-stack" onSubmit={handleSubmit}>
      <p className="section-kicker">Painel Luci Luci</p>
      <h1>Entrar</h1>
      <input className="field" name="email" type="email" placeholder="Email" required value={email} onChange={(event) => setEmail(event.target.value)} />
      <input className="field" name="password" type="password" placeholder="Senha" required value={password} onChange={(event) => setPassword(event.target.value)} />
      {error ? <div className="flash flash-danger">{error}</div> : null}
      <button className="primary-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Acessar painel"}
      </button>
      <p className="muted">
        Use as credenciais configuradas em <code>.env.local</code>.
      </p>
    </form>
  );
}
