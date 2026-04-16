import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Catégories — Tradex Party 2026" },
      { name: "description", content: "Gérez les catégories de vote pour la fête Tradex." },
    ],
  }),
});

const ADMIN_PASSWORD = "Tradex2026";

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface Candidate {
  id: string;
  category_id: string;
  full_name: string;
  department: string | null;
  photo_url: string | null;
  description: string | null;
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  // New category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [catRes, candRes] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: false }),
      supabase.from("candidates").select("*"),
    ]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    if (candRes.data) setCandidates(candRes.data as Candidate[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Check session admin
    const stored = sessionStorage.getItem("tradex_admin");
    if (stored === "true") setIsAdmin(true);
  }, []);

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("tradex_admin", "true");
      setShowPasswordPrompt(false);
      setPassword("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem("tradex_admin");
  };

  const addCategory = async () => {
    if (!catName.trim()) return;
    await supabase.from("categories").insert({ name: catName.trim(), description: catDesc.trim() || null });
    setCatName("");
    setCatDesc("");
    setShowCategoryForm(false);
    fetchData();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    fetchData();
  };

  const deleteCandidate = async (id: string) => {
    await supabase.from("candidates").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
            Catégories de vote
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isAdmin ? "Mode administrateur — gestion des catégories" : "Consultez les catégories et inscrivez-vous"}
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <>
              <button
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {showCategoryForm ? "Annuler" : "+ Nouvelle catégorie"}
              </button>
              <button
                onClick={handleAdminLogout}
                className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowPasswordPrompt(true)}
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              🔒 Admin
            </button>
          )}
        </div>
      </div>

      {/* Admin password prompt */}
      {showPasswordPrompt && !isAdmin && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading text-lg font-bold text-card-foreground">Accès administrateur</h3>
          <div className="mt-4 flex gap-2">
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleAdminLogin}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Entrer
            </button>
            <button
              onClick={() => { setShowPasswordPrompt(false); setPassword(""); setPasswordError(false); }}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Annuler
            </button>
          </div>
          {passwordError && (
            <p className="mt-2 text-sm text-destructive">Mot de passe incorrect</p>
          )}
        </div>
      )}

      {/* New category form (admin only) */}
      {showCategoryForm && isAdmin && (
        <div className="mt-6 rounded-xl border border-border bg-card p-5">
          <h3 className="font-heading text-lg font-bold text-card-foreground">Nouvelle catégorie</h3>
          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Nom de la catégorie"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              placeholder="Description (optionnel)"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <button
              onClick={addCategory}
              className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Créer la catégorie
            </button>
          </div>
        </div>
      )}

      {/* Categories list */}
      {loading ? (
        <div className="mt-12 text-center text-muted-foreground">Chargement...</div>
      ) : categories.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">Aucune catégorie pour le moment.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {categories.map((cat) => {
            const catCandidates = candidates.filter((c) => c.category_id === cat.id);
            return (
              <div key={cat.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex items-start justify-between border-b border-border p-5">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-card-foreground">{cat.name}</h3>
                    {cat.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {catCandidates.length} candidat{catCandidates.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                {/* Candidates list */}
                {catCandidates.length > 0 && (
                  <div className="divide-y divide-border">
                    {catCandidates.map((cand) => (
                      <div key={cand.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3">
                          {cand.photo_url ? (
                            <img src={cand.photo_url} alt={cand.full_name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                              {cand.full_name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-card-foreground">{cand.full_name}</p>
                            {cand.department && (
                              <p className="text-xs text-muted-foreground">{cand.department}</p>
                            )}
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => deleteCandidate(cand.id)}
                            className="text-xs text-destructive hover:underline"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
