import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
  head: () => ({
    meta: [
      { title: "Catégories — Tradex Party 2026" },
      { name: "description", content: "Découvrez les catégories de vote pour la fête Tradex." },
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
  photo_url: string | null;
  description: string | null;
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchData();
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
          Catégories de vote
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez les catégories et inscrivez-vous dans celle de votre choix.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
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
                <div className="border-b border-border p-5">
                  <h3 className="font-heading text-xl font-bold text-card-foreground">{cat.name}</h3>
                  {cat.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {catCandidates.length} candidat{catCandidates.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {catCandidates.length > 0 && (
                  <div className="divide-y divide-border">
                    {catCandidates.map((cand) => (
                      <div key={cand.id} className="flex items-center gap-3 px-5 py-3">
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
