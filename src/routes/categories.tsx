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
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // New category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // New candidate form
  const [activeCandidateForm, setActiveCandidateForm] = useState<string | null>(null);
  const [candName, setCandName] = useState("");
  const [candDept, setCandDept] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [catRes, candRes] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: false }),
      supabase.from("candidates").select("*"),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (candRes.data) setCandidates(candRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const addCandidate = async (categoryId: string) => {
    if (!candName.trim()) return;
    await supabase.from("candidates").insert({
      category_id: categoryId,
      full_name: candName.trim(),
      department: candDept.trim() || null,
    });
    setCandName("");
    setCandDept("");
    setActiveCandidateForm(null);
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
            Créez des catégories et inscrivez des candidats
          </p>
        </div>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {showCategoryForm ? "Annuler" : "+ Nouvelle catégorie"}
        </button>
      </div>

      {/* New category form */}
      {showCategoryForm && (
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
          <p className="mt-1 text-sm text-muted-foreground">Créez la première catégorie de vote !</p>
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
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveCandidateForm(activeCandidateForm === cat.id ? null : cat.id);
                        setCandName("");
                        setCandDept("");
                      }}
                      className="rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80"
                    >
                      + Candidat
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="rounded-md bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                {/* Add candidate form */}
                {activeCandidateForm === cat.id && (
                  <div className="border-b border-border bg-muted/30 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        placeholder="Nom complet"
                        value={candName}
                        onChange={(e) => setCandName(e.target.value)}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <input
                        type="text"
                        placeholder="Département (optionnel)"
                        value={candDept}
                        onChange={(e) => setCandDept(e.target.value)}
                        className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      <button
                        onClick={() => addCandidate(cat.id)}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}

                {/* Candidates list */}
                {catCandidates.length > 0 && (
                  <div className="divide-y divide-border">
                    {catCandidates.map((cand) => (
                      <div key={cand.id} className="flex items-center justify-between px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">{cand.full_name}</p>
                          {cand.department && (
                            <p className="text-xs text-muted-foreground">{cand.department}</p>
                          )}
                        </div>
                        <button
                          onClick={() => deleteCandidate(cand.id)}
                          className="text-xs text-destructive hover:underline"
                        >
                          Retirer
                        </button>
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
