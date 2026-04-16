import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/results")({
  component: ResultsPage,
  head: () => ({
    meta: [
      { title: "Résultats — Tradex Party 2026" },
      { name: "description", content: "Résultats des votes en temps réel pour la fête Tradex." },
    ],
  }),
});

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CandidateWithVotes {
  id: string;
  category_id: string;
  full_name: string;
  department: string | null;
  photo_url: string | null;
  vote_count: number;
}

function ResultsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [candidatesWithVotes, setCandidatesWithVotes] = useState<CandidateWithVotes[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [catRes, candRes, votesRes] = await Promise.all([
      supabase.from("categories").select("*").order("created_at", { ascending: false }),
      supabase.from("candidates").select("*"),
      supabase.from("votes").select("candidate_id"),
    ]);

    if (catRes.data) setCategories(catRes.data);

    const voteCounts: Record<string, number> = {};
    if (votesRes.data) {
      for (const v of votesRes.data) {
        voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
      }
    }

    if (candRes.data) {
      setCandidatesWithVotes(
        candRes.data.map((c) => ({
          id: c.id,
          category_id: c.category_id,
          full_name: c.full_name,
          department: c.department,
          photo_url: c.photo_url,
          vote_count: voteCounts[c.id] || 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-16">
      <h1 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
        Résultats en direct
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Les résultats se rafraîchissent automatiquement toutes les 10 secondes
      </p>

      {loading ? (
        <div className="mt-12 text-center text-muted-foreground">Chargement...</div>
      ) : categories.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <p className="text-muted-foreground">Aucun résultat disponible pour le moment.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {categories.map((cat) => {
            const catCandidates = candidatesWithVotes
              .filter((c) => c.category_id === cat.id)
              .sort((a, b) => b.vote_count - a.vote_count);
            
            if (catCandidates.length === 0) return null;
            const maxVotes = catCandidates[0]?.vote_count || 1;

            return (
              <div key={cat.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="border-b border-border bg-muted/30 px-5 py-4">
                  <h2 className="font-heading text-xl font-bold text-card-foreground">{cat.name}</h2>
                  {cat.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{cat.description}</p>
                  )}
                </div>
                <div className="divide-y divide-border">
                  {catCandidates.map((cand, idx) => {
                    const percentage = maxVotes > 0 ? (cand.vote_count / maxVotes) * 100 : 0;
                    const isLeader = idx === 0 && cand.vote_count > 0;

                    return (
                      <div key={cand.id} className="px-5 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {cand.photo_url ? (
                              <img src={cand.photo_url} alt={cand.full_name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                                  isLeader
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {idx + 1}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-card-foreground">
                                {cand.full_name}
                                {isLeader && " 🏆"}
                              </p>
                              {cand.department && (
                                <p className="text-xs text-muted-foreground">{cand.department}</p>
                              )}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-primary">
                            {cand.vote_count} vote{cand.vote_count !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
