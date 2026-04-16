import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminLoginPage,
  head: () => ({
    meta: [
      { title: "Connexion Admin — Tradex Party 2026" },
      { name: "description", content: "Espace administrateur Tradex Party." },
    ],
  }),
});

const ADMIN_PASSWORD = "Tradex2026";

function AdminLoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("tradex_admin") === "true") {
      navigate({ to: "/admin/dashboard" });
    }
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("tradex_admin", "true");
      navigate({ to: "/admin/dashboard" });
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Decorative top */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl hero-gradient shadow-lg shadow-primary/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="mt-5 font-heading text-3xl font-bold text-foreground">
            Espace Administrateur
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Connectez-vous pour gérer l'événement Tradex Party
          </p>
        </div>

        {/* Login card */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl border border-border bg-card p-8 shadow-xl shadow-primary/5 transition-transform ${shake ? "animate-shake" : ""}`}
        >
          <label htmlFor="admin-pw" className="block text-sm font-medium text-card-foreground mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              id="admin-pw"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Entrez le mot de passe admin"
              autoFocus
              className={`w-full rounded-xl border px-4 py-3 text-sm text-foreground bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
                error
                  ? "border-destructive focus:ring-destructive/40"
                  : "border-input focus:ring-ring"
              }`}
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              Mot de passe incorrect
            </p>
          )}
          <button
            type="submit"
            className="mt-6 w-full rounded-xl hero-gradient px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 hover:brightness-110 active:scale-[0.98]"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Accès réservé aux administrateurs de l'événement
        </p>
      </div>
    </div>
  );
}
